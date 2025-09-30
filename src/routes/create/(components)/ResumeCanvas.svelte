<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import ResumeElementComponent from './ResumeElement.svelte';
	import Ruler from './Ruler.svelte';
	import { appStore } from '$lib/stores/appStore.svelte.ts';
	import type { ResumeElement, ResumePage, ResizeDirection } from '$lib/types/resume';
	const selectedElement = $derived(appStore.getSelectedElement());

	interface ResumeCanvasProps {
		page: ResumePage;
		showDeleteButton?: boolean;
		width: number;
		height: number;
		onDragover?: (event: DragEvent) => void;
		onDrop?: (event: DragEvent) => void;
	}

	const {
		page,
		showDeleteButton = false,
		width,
		height,
		onDragover = (_event: DragEvent) => {},
		onDrop = (_event: DragEvent) => {}
	}: ResumeCanvasProps = $props();

	let canvasRef: HTMLDivElement;
	let isDragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });

	// Drag preview and highlighting states
	let dragPreview = $state<{ x: number; y: number; width: number; height: number } | null>(null);
	let hoveredElementId = $state<string | null>(null);
	let highlightedElementIds = $state<string[]>([]);

	const SNAP_THRESHOLD = 10; // pixels

	// Helper to check if two elements overlap
	function elementsOverlap(
		el1: { x: number; y: number; width: number; height: number },
		el2: { x: number; y: number; width: number; height: number }
	): boolean {
		return !(
			el1.x + el1.width < el2.x ||
			el2.x + el2.width < el1.x ||
			el1.y + el1.height < el2.y ||
			el2.y + el2.height < el1.y
		);
	}

	// Get all elements recursively (flattened)
	function getAllElements(elements: Record<string, ResumeElement>): ResumeElement[] {
		const result: ResumeElement[] = [];
		for (const el of Object.values(elements)) {
			result.push(el);
			result.push(...getAllElements(el.elements));
		}
		return result;
	}

	// Get elements that overlap with the given element
	function getOverlappingElements(element: ResumeElement): ResumeElement[] {
		const allElements = getAllElements(page.elements);
		return allElements.filter((el) => el.id !== element.id && elementsOverlap(element, el));
	}

	// Find which element (if any) contains the given point
	function findElementAtPosition(x: number, y: number, excludeId?: string): ResumeElement | null {
		const allElements = getAllElements(page.elements);
		// Sort by zIndex descending to check top elements first
		const sorted = allElements.sort((a, b) => b.zIndex - a.zIndex);

		for (const el of sorted) {
			if (el.id === excludeId) continue;
			if (x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height) {
				return el;
			}
		}
		return null;
	}

	// Update highlighted elements when selection changes
	$effect(() => {
		if (selectedElement && selectedElement.pageId === page.id) {
			const overlapping = getOverlappingElements(selectedElement);
			highlightedElementIds = overlapping.map((el) => el.id);
		} else {
			highlightedElementIds = [];
		}
	});

	// Constrain all elements to boundaries when boundaries change
	function constrainElementsToBoundaries() {
		const { horizontal, vertical } = page.boundaries;
		const elements = Object.values(page.elements);

		elements.forEach((element) => {
			let needsUpdate = false;
			let newX = element.x;
			let newY = element.y;
			let newWidth = element.width;
			let newHeight = element.height;

			// Constrain position to start boundaries
			if (newX < horizontal.start) {
				newX = horizontal.start;
				needsUpdate = true;
			}
			if (newY < vertical.start) {
				newY = vertical.start;
				needsUpdate = true;
			}

			// Constrain width if element extends beyond end boundary
			if (newX + newWidth > horizontal.end) {
				newWidth = horizontal.end - newX;
				needsUpdate = true;
			}
			if (newY + newHeight > vertical.end) {
				newHeight = vertical.end - newY;
				needsUpdate = true;
			}

			// Ensure minimum size
			if (newWidth < 20) {
				newWidth = 20;
				needsUpdate = true;
			}
			if (newHeight < 20) {
				newHeight = 20;
				needsUpdate = true;
			}

			if (needsUpdate) {
				appStore.updateElement({
					elementId: element.id,
					updates: {
						x: newX,
						y: newY,
						width: newWidth,
						height: newHeight
					},
					pageId: element.pageId
				});
			}
		});
	}

	// Watch for boundary changes and constrain elements
	$effect(() => {
		// Access boundaries to make this effect reactive
		void page.boundaries;
		constrainElementsToBoundaries();
	});

	// Snap position to ruler boundaries
	function snapToBoundaries(value: number, start: number, end: number): number {
		if (Math.abs(value - start) < SNAP_THRESHOLD) {
			return start;
		}
		if (Math.abs(value - end) < SNAP_THRESHOLD) {
			return end;
		}
		return value;
	}

	// Enforce boundaries
	function enforceBoundaries(
		x: number,
		y: number,
		elementWidth: number,
		elementHeight: number
	): { x: number; y: number } {
		const { horizontal, vertical } = page.boundaries;

		// Clamp position to boundaries
		const clampedX = Math.max(horizontal.start, Math.min(x, horizontal.end - elementWidth));
		const clampedY = Math.max(vertical.start, Math.min(y, vertical.end - elementHeight));

		return { x: clampedX, y: clampedY };
	}

	// Scale factor for display (adjust this to control canvas display size)
	const DISPLAY_SCALE = 0.35; // 35% of actual size for better viewing

	// Convert pixel coordinates to percentage for responsive design
	function pixelsToPercent(pixels: number, total: number): string {
		return `${(pixels / total) * 100}%`;
	}

	function handleCanvasClick(event: MouseEvent) {
		if (event.target === canvasRef) {
			appStore.selectElement(null);
		}
	}

	let elementBeingDragged = $state<string | null>(null);

	function handleElementMove(event: MouseEvent, element: ResumeElement) {
		if (isDragging && element) {
			const rect = canvasRef.getBoundingClientRect();
			const scaleX = width / rect.width;
			const scaleY = height / rect.height;

			const deltaX = (event.clientX - dragStart.x) * scaleX;
			const deltaY = (event.clientY - dragStart.y) * scaleY;

			let newX = element.x + deltaX;
			let newY = element.y + deltaY;

			// Snap to boundaries
			newX = snapToBoundaries(
				newX,
				page.boundaries.horizontal.start,
				page.boundaries.horizontal.end - element.width
			);
			newY = snapToBoundaries(
				newY,
				page.boundaries.vertical.start,
				page.boundaries.vertical.end - element.height
			);

			// Enforce boundaries
			const bounded = enforceBoundaries(newX, newY, element.width, element.height);

			// Check if element should be reparented
			const centerX = bounded.x + element.width / 2;
			const centerY = bounded.y + element.height / 2;
			const newParentElement = findElementAtPosition(centerX, centerY, element.id);
			const newParentId = newParentElement ? newParentElement.id : null;

			// If parent changed, use moveElement
			if (elementBeingDragged !== element.id) {
				elementBeingDragged = element.id;
				// Store original parent (we'll need to track this differently)
			}

			// For now, just update position - reparenting happens on mouse up
			appStore.updateElement({
				elementId: element.id,
				updates: {
					x: bounded.x,
					y: bounded.y
				},
				pageId: element.pageId
			});

			// Update hover state
			hoveredElementId = newParentId;

			dragStart = { x: event.clientX, y: event.clientY };
		}
	}

	function handleElementMouseUp(element: ResumeElement) {
		if (isDragging && elementBeingDragged === element.id) {
			// Check final position and reparent if needed
			const centerX = element.x + element.width / 2;
			const centerY = element.y + element.height / 2;
			const newParentElement = findElementAtPosition(centerX, centerY, element.id);
			const newParentId = newParentElement ? newParentElement.id : null;

			// Move element to new parent
			appStore.moveElement({
				pageId: element.pageId,
				elementId: element.id,
				newParentId,
				newX: element.x,
				newY: element.y
			});
		}

		isDragging = false;
		elementBeingDragged = null;
		hoveredElementId = null;
	}

	function handleElementResize(
		event: MouseEvent,
		element: ResumeElement,
		direction: ResizeDirection
	) {
		event.stopPropagation();

		const rect = canvasRef.getBoundingClientRect();
		const scaleX = width / rect.width;
		const scaleY = height / rect.height;

		const startX = event.clientX;
		const startY = event.clientY;

		function onMouseMove(e: MouseEvent) {
			const deltaX = (e.clientX - startX) * scaleX;
			const deltaY = (e.clientY - startY) * scaleY;

			let newWidth = element.width;
			let newHeight = element.height;
			let newX = element.x;
			let newY = element.y;

			const { horizontal, vertical } = page.boundaries;

			switch (direction) {
				// Edge handles - resize width or height only
				case 'e': // East - resize width (right edge)
					newWidth = Math.max(20, element.width + deltaX);
					break;
				case 'w': // West - resize width (left edge)
					newWidth = Math.max(20, element.width - deltaX);
					newX = Math.max(horizontal.start, element.x + deltaX);
					break;
				case 's': // South - resize height (bottom edge)
					newHeight = Math.max(20, element.height + deltaY);
					break;
				case 'n': // North - resize height (top edge)
					newHeight = Math.max(20, element.height - deltaY);
					newY = Math.max(vertical.start, element.y + deltaY);
					break;

				// Corner handles - resize both width and height
				case 'se': // Southeast
					newWidth = Math.max(20, element.width + deltaX);
					newHeight = Math.max(20, element.height + deltaY);
					break;
				case 'sw': // Southwest
					newWidth = Math.max(20, element.width - deltaX);
					newX = Math.max(horizontal.start, element.x + deltaX);
					newHeight = Math.max(20, element.height + deltaY);
					break;
				case 'ne': // Northeast
					newWidth = Math.max(20, element.width + deltaX);
					newHeight = Math.max(20, element.height - deltaY);
					newY = Math.max(vertical.start, element.y + deltaY);
					break;
				case 'nw': // Northwest
					newWidth = Math.max(20, element.width - deltaX);
					newX = Math.max(horizontal.start, element.x + deltaX);
					newHeight = Math.max(20, element.height - deltaY);
					newY = Math.max(vertical.start, element.y + deltaY);
					break;
			}

			// Enforce boundaries for resize
			if (newX + newWidth > horizontal.end) {
				newWidth = horizontal.end - newX;
			}
			if (newY + newHeight > vertical.end) {
				newHeight = vertical.end - newY;
			}

			appStore.updateElement({
				elementId: element.id,
				updates: {
					x: newX,
					y: newY,
					width: newWidth,
					height: newHeight
				},
				pageId: element.pageId
			});
		}

		function onMouseUp() {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}

	// Exposed methods for drag preview
	export function updateDragPreview(event: DragEvent) {
		if (!canvasRef) return;

		const rect = canvasRef.getBoundingClientRect();
		const scaleX = width / rect.width;
		const scaleY = height / rect.height;

		let x = (event.clientX - rect.left) * scaleX;
		let y = (event.clientY - rect.top) * scaleY;

		const { horizontal, vertical } = page.boundaries;

		// Calculate dynamic dimensions
		let previewWidth = horizontal.end - x;
		let previewHeight = Math.min(500, vertical.end - y);

		const MIN_WIDTH = 100;
		const MIN_HEIGHT = 50;

		if (previewWidth < MIN_WIDTH) {
			previewWidth = Math.min(MIN_WIDTH, horizontal.end - horizontal.start);
		}
		if (previewHeight < MIN_HEIGHT) {
			previewHeight = Math.min(MIN_HEIGHT, vertical.end - vertical.start);
		}

		// Clamp to boundaries
		x = Math.max(horizontal.start, Math.min(x, horizontal.end - previewWidth));
		y = Math.max(vertical.start, Math.min(y, vertical.end - previewHeight));

		dragPreview = { x, y, width: previewWidth, height: previewHeight };

		// Check for hovered element
		const allElements = getAllElements(page.elements);
		let foundHover = false;
		for (const element of allElements) {
			if (
				x >= element.x &&
				x <= element.x + element.width &&
				y >= element.y &&
				y <= element.y + element.height
			) {
				hoveredElementId = element.id;
				foundHover = true;
				break;
			}
		}
		if (!foundHover) {
			hoveredElementId = null;
		}
	}

	export function clearDragPreview() {
		dragPreview = null;
		hoveredElementId = null;
	}

	// Handle drag leave to clear highlights
	function handleDragLeave(event: DragEvent) {
		// Only clear if leaving the canvas entirely
		if (!canvasRef?.contains(event.relatedTarget as Node)) {
			clearDragPreview();
		}
	}
</script>

<div class="relative flex">
	<div class="relative flex flex-col">
		<!-- Corner spacer and Horizontal Ruler -->
		<div class="flex">
			<!-- Corner spacer to align with vertical ruler -->
			<div class="h-[30px] w-[30px] bg-gray-300"></div>
			<Ruler
				orientation="horizontal"
				size={width}
				displaySize={width * DISPLAY_SCALE}
				startAnchor={page.boundaries.horizontal.start}
				endAnchor={page.boundaries.horizontal.end}
				onAnchorChange={(start, end) => {
					appStore.updateBoundaries(page.id, {
						...page.boundaries,
						horizontal: { start, end }
					});
				}}
			/>
		</div>

		<div class="absolute bottom-0 left-0">
			<!-- Vertical Ruler -->
			<Ruler
				orientation="vertical"
				size={height}
				displaySize={height * DISPLAY_SCALE}
				startAnchor={page.boundaries.vertical.start}
				endAnchor={page.boundaries.vertical.end}
				onAnchorChange={(start, end) => {
					appStore.updateBoundaries(page.id, {
						...page.boundaries,
						vertical: { start, end }
					});
				}}
			/>
		</div>

		<!-- Canvas wrapper with left margin -->
		<div class="flex">
			<div style:height="{height * DISPLAY_SCALE}px" class="w-[30px]"></div>
			<div
				bind:this={canvasRef}
				data-testid="resume-canvas"
				class="relative overflow-hidden border-2 border-gray-300 bg-white shadow-lg"
				style:width="{width * DISPLAY_SCALE}px"
				style:height="{height * DISPLAY_SCALE}px"
				onclick={handleCanvasClick}
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					if (e.key === 'Escape') {
						clearDragPreview();
						isDragging = false;
						elementBeingDragged = null;
					}
				}}
				ondragover={onDragover}
				ondrop={onDrop}
				ondragleave={handleDragLeave}
			>
				<!-- Delete Page Button -->
				{#if showDeleteButton}
					<Button
						variant="destructive"
						onClick={(e) => {
							e.stopPropagation();
							appStore.deletePage(page.id);
						}}
						className="absolute top-2 right-2 z-20"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
					</Button>
				{/if}

				<!-- Render all elements (sorted by zIndex, flattened from nested structure) -->
				{#each getAllElements(page.elements).sort((a, b) => a.zIndex - b.zIndex) as element (element.id)}
					{@const isSelected = selectedElement?.id === element.id}
					{@const isHighlighted = highlightedElementIds.includes(element.id)}
					{@const isHovered = hoveredElementId === element.id}
					<div
						role="button"
						tabindex="0"
						onkeydown={null}
						class="absolute cursor-move transition-all select-none"
						class:hover:ring-2={isSelected}
						class:hover:ring-blue-500={isSelected}
						class:ring-2={isSelected || isHighlighted || isHovered}
						class:ring-blue-500={isSelected}
						class:ring-yellow-400={isHighlighted && !isSelected}
						class:ring-green-400={isHovered}
						style:left={pixelsToPercent(element.x, width)}
						style:top={pixelsToPercent(element.y, height)}
						style:width={pixelsToPercent(element.width, width)}
						style:height={pixelsToPercent(element.height, height)}
						style:z-index={element.zIndex}
						onmousedown={(e) => {
							isDragging = true;
							dragStart = { x: e.clientX, y: e.clientY };
						}}
						onmousemove={(e) => handleElementMove(e, element)}
						onmouseup={() => handleElementMouseUp(element)}
					>
						<ResumeElementComponent
							{element}
							{isSelected}
							onResize={(event, direction) => handleElementResize(event, element, direction)}
						/>
					</div>
				{/each}

				<!-- Drag preview -->
				{#if dragPreview}
					<div
						class="pointer-events-none absolute border-2 border-dashed border-purple-500 bg-purple-100 opacity-50"
						style:left={pixelsToPercent(dragPreview.x, width)}
						style:top={pixelsToPercent(dragPreview.y, height)}
						style:width={pixelsToPercent(dragPreview.width, width)}
						style:height={pixelsToPercent(dragPreview.height, height)}
					></div>
				{/if}

				<!-- Selection outline for empty canvas -->
				{#if !selectedElement && Object.values(page.elements).length === 0}
					<div class="absolute inset-4 flex items-center justify-center text-gray-400">
						Drag and drop elements from toolbar to create them
					</div>
				{/if}

				<!-- Boundary visualization -->
				<div
					class="pointer-events-none absolute border-2 border-dashed border-blue-400"
					style:left={pixelsToPercent(page.boundaries.horizontal.start, width)}
					style:top={pixelsToPercent(page.boundaries.vertical.start, height)}
					style:width={pixelsToPercent(
						page.boundaries.horizontal.end - page.boundaries.horizontal.start,
						width
					)}
					style:height={pixelsToPercent(
						page.boundaries.vertical.end - page.boundaries.vertical.start,
						height
					)}
				></div>
			</div>
		</div>
	</div>
</div>

<style>
	.hover\:ring-2:hover {
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
	}
</style>
