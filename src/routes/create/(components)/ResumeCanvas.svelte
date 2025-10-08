<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import ResumeElementComponent from './ResumeElement.svelte';
	import Ruler from './Ruler.svelte';
	import { appStore } from '$lib/stores/appStore.svelte.ts';
	import type { ResumeElement, ResumePage, ResizeDirection } from '$lib/types/resume';
	import { DISPLAY_SCALE } from '$lib/const/dimension';
	import { getAllElements, pixelsToPercent } from '$lib/utils';
	const selectedElement = $derived(appStore.getSelectedElement());

	interface ResumeCanvasProps {
		page: ResumePage;
		showDeleteButton?: boolean;
		width: number;
		height: number;
		onDragover?: (event: DragEvent) => void;
		onDrop?: (event: DragEvent) => void;
		'data-page-id'?: string;
	}

	const {
		page,
		showDeleteButton = false,
		width,
		height,
		onDragover = (_event: DragEvent) => {},
		onDrop = (_event: DragEvent) => {},
		'data-page-id': dataPageId
	}: ResumeCanvasProps = $props();

	let showBoundary = $state(true);

	// High-performance drag state (document-level + rAF)
	let dragRafId: number | null = null;
	let lastPointer = { x: 0, y: 0 };
	let dragMeta: {
		id: string;
		pageId: string;
		startX: number;
		startY: number;
		width: number;
		height: number;
	} | null = null;

	// Drag preview and highlighting states
	let dragPreview = $state<{ x: number; y: number; width: number; height: number } | null>(null);
	let hoveredElementId = $state<string | null>(null);
	let highlightedElementIds = $state<string[]>([]);

	let canvasRef: HTMLDivElement;
	let canvasPageRef: HTMLDivElement;
	let isDragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });
	let isResizing = $state(false);

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

	// Get elements that overlap with the given element
	function getOverlappingElements(element: ResumeElement): ResumeElement[] {
		const allElements = getAllElements(page.elements);
		return allElements.filter((el) => el.id !== element.id && elementsOverlap(element, el));
	}

	function getNextZIndex(): number {
		const all = getAllElements(page.elements);
		if (all.length === 0) return 0;
		return Math.max(...all.map((e) => e.zIndex)) + 1;
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
		// Access boundaries to make this reactive effect reactive
		void page.boundaries;
		constrainElementsToBoundaries();
	});

	// Handle clicks outside the canvas to hide boundary
	$effect(() => {
		const handleDocumentClick = (event: MouseEvent) => {
			if (!canvasPageRef?.contains(event.target as Node)) {
				showBoundary = false;
			}
		};

		document.addEventListener('click', handleDocumentClick);
		return () => {
			document.removeEventListener('click', handleDocumentClick);
		};
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

	function handleCanvasClick(event: MouseEvent) {
		if (event.target === canvasRef) {
			showBoundary = true;
			appStore.selectElement(null);
		}
	}

	function handleCanvasDragOver(event: DragEvent) {
		showBoundary = true;
		onDragover(event);
	}

	// Track current drag using dragMeta alone (no separate flag/id var)

	function handleGlobalPointerUp() {
		if (!isDragging || !dragMeta) {
			return;
		}

		// Lookup the latest element state from store to finalize and reparent
		const latest = appStore.findElement(dragMeta.pageId, dragMeta.id);
		if (latest) {
			const centerX = latest.x + latest.width / 2;
			const centerY = latest.y + latest.height / 2;
			const newParentElement = findElementAtPosition(centerX, centerY, latest.id);
			const newParentId = newParentElement ? newParentElement.id : null;

			appStore.moveElement({
				pageId: latest.pageId,
				elementId: latest.id,
				newParentId,
				newX: latest.x,
				newY: latest.y
			});

			// Bring to front and select so it remains interactive after drop
			const topZ = getNextZIndex();
			appStore.updateElement({
				elementId: latest.id,
				updates: { zIndex: topZ },
				pageId: latest.pageId
			});
			const updated = appStore.findElement(latest.pageId, latest.id);
			if (updated) {
				appStore.selectElement(updated);
			}
		}

		// Cleanup
		isDragging = false;
		hoveredElementId = null;
		dragMeta = null;
		if (dragRafId !== null) {
			cancelAnimationFrame(dragRafId);
			dragRafId = null;
		}
		document.removeEventListener('pointermove', handleGlobalPointerMove);
		document.removeEventListener('pointerup', handleGlobalPointerUp, true);
		document.body.style.userSelect = '';
	}

	function cancelDrag() {
		// Abort drag without finalizing reparenting
		isDragging = false;
		hoveredElementId = null;
		dragMeta = null;
		if (dragRafId !== null) {
			cancelAnimationFrame(dragRafId);
			dragRafId = null;
		}
		document.removeEventListener('pointermove', handleGlobalPointerMove);
		document.removeEventListener('pointerup', handleGlobalPointerUp, true);
		document.body.style.userSelect = '';
	}

	function handleGlobalPointerMove(e: PointerEvent) {
		lastPointer = { x: e.clientX, y: e.clientY };
		// rAF throttle
		if (dragRafId === null) {
			dragRafId = requestAnimationFrame(() => {
				dragRafId = null;
				if (!isDragging || !dragMeta) return;

				const rect = canvasRef.getBoundingClientRect();
				const scaleX = width / rect.width;
				const scaleY = height / rect.height;

				const deltaX = (lastPointer.x - dragStart.x) * scaleX;
				const deltaY = (lastPointer.y - dragStart.y) * scaleY;

				let newX = dragMeta.startX + deltaX;
				let newY = dragMeta.startY + deltaY;

				// Snap and enforce boundaries
				newX = snapToBoundaries(
					newX,
					page.boundaries.horizontal.start,
					page.boundaries.horizontal.end - dragMeta.width
				);
				newY = snapToBoundaries(
					newY,
					page.boundaries.vertical.start,
					page.boundaries.vertical.end - dragMeta.height
				);
				const bounded = enforceBoundaries(newX, newY, dragMeta.width, dragMeta.height);

				// Hover state based on center
				const centerX = bounded.x + dragMeta.width / 2;
				const centerY = bounded.y + dragMeta.height / 2;
				const newParentElement = findElementAtPosition(centerX, centerY, dragMeta.id);
				hoveredElementId = newParentElement ? newParentElement.id : null;

				// Update element position
				appStore.updateElement({
					elementId: dragMeta.id,
					updates: { x: bounded.x, y: bounded.y },
					pageId: dragMeta.pageId
				});
			});
		}
	}

	function handleElementResize(
		event: MouseEvent,
		element: ResumeElement,
		direction: ResizeDirection
	) {
		event.stopPropagation();
		event.preventDefault();
		isResizing = true;
		document.body.style.userSelect = 'none';

		const rect = canvasRef.getBoundingClientRect();
		const scaleX = width / rect.width;
		const scaleY = height / rect.height;

		const startX = event.clientX;
		const startY = event.clientY;
		const startState = {
			x: element.x,
			y: element.y,
			w: element.width,
			h: element.height
		};

		let resizeRafId: number | null = null;
		let last = { x: startX, y: startY };

		const onPointerMove = (e: PointerEvent) => {
			last = { x: e.clientX, y: e.clientY };
			if (resizeRafId === null) {
				resizeRafId = requestAnimationFrame(() => {
					resizeRafId = null;
					const deltaX = (last.x - startX) * scaleX;
					const deltaY = (last.y - startY) * scaleY;

					let newWidth = startState.w;
					let newHeight = startState.h;
					let newX = startState.x;
					let newY = startState.y;

					const { horizontal, vertical } = page.boundaries;

					switch (direction) {
						case 'e':
							newWidth = Math.max(20, startState.w + deltaX);
							break;
						case 'w':
							newWidth = Math.max(20, startState.w - deltaX);
							newX = Math.max(horizontal.start, startState.x + deltaX);
							break;
						case 's':
							newHeight = Math.max(20, startState.h + deltaY);
							break;
						case 'n':
							newHeight = Math.max(20, startState.h - deltaY);
							newY = Math.max(vertical.start, startState.y + deltaY);
							break;
						case 'se':
							newWidth = Math.max(20, startState.w + deltaX);
							newHeight = Math.max(20, startState.h + deltaY);
							break;
						case 'sw':
							newWidth = Math.max(20, startState.w - deltaX);
							newX = Math.max(horizontal.start, startState.x + deltaX);
							newHeight = Math.max(20, startState.h + deltaY);
							break;
						case 'ne':
							newWidth = Math.max(20, startState.w + deltaX);
							newHeight = Math.max(20, startState.h - deltaY);
							newY = Math.max(vertical.start, startState.y + deltaY);
							break;
						case 'nw':
							newWidth = Math.max(20, startState.w - deltaX);
							newX = Math.max(horizontal.start, startState.x + deltaX);
							newHeight = Math.max(20, startState.h - deltaY);
							newY = Math.max(vertical.start, startState.y + deltaY);
							break;
					}

					// Enforce boundaries
					if (newX + newWidth > horizontal.end) {
						newWidth = horizontal.end - newX;
					}
					if (newY + newHeight > vertical.end) {
						newHeight = vertical.end - newY;
					}

					appStore.updateElement({
						elementId: element.id,
						updates: { x: newX, y: newY, width: newWidth, height: newHeight },
						pageId: element.pageId
					});
				});
			}
		};

		const onPointerUp = () => {
			isResizing = false;
			if (resizeRafId !== null) {
				cancelAnimationFrame(resizeRafId);
				resizeRafId = null;
			}
			document.removeEventListener('pointermove', onPointerMove);
			document.removeEventListener('pointerup', onPointerUp, true);
			document.body.style.userSelect = '';
		};

		document.addEventListener('pointermove', onPointerMove);
		document.addEventListener('pointerup', onPointerUp, true);
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

<div class="relative flex" data-page-id={dataPageId} bind:this={canvasPageRef}>
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
		<div
			class="flex"
			onclick={() => (showBoundary = true)}
			role="button"
			tabindex="0"
			onkeydown={null}
		>
			<div style:height="{height * DISPLAY_SCALE}px" class="w-[30px]"></div>
			<div
				bind:this={canvasRef}
				data-testid="resume-canvas"
				class="relative border-2 border-gray-300 bg-white shadow-lg"
				style:width="{width * DISPLAY_SCALE}px"
				style:height="{height * DISPLAY_SCALE}px"
				onclick={handleCanvasClick}
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					if (e.key === 'Escape') {
						clearDragPreview();
						cancelDrag();
					}
				}}
				ondragover={handleCanvasDragOver}
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
						class:transition-none={isDragging || isResizing}
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
						onclick={() => {
							showBoundary = true;
						}}
						onpointerdown={(e) => {
							// Start global, rAF-throttled drag
							// Bring to front to ensure pointer events are not blocked by overlaps
							const targetTopZ = getNextZIndex();
							if (element.zIndex < targetTopZ) {
								appStore.updateElement({
									elementId: element.id,
									updates: { zIndex: targetTopZ },
									pageId: element.pageId
								});
							}
							isDragging = true;
							dragStart = { x: e.clientX, y: e.clientY };
							dragMeta = {
								id: element.id,
								pageId: element.pageId,
								startX: element.x,
								startY: element.y,
								width: element.width,
								height: element.height
							};
							lastPointer = { x: e.clientX, y: e.clientY };
							document.addEventListener('pointermove', handleGlobalPointerMove);
							document.addEventListener('pointerup', handleGlobalPointerUp, true);
							document.body.style.userSelect = 'none';
						}}
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
				{#if showBoundary}
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
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.hover\:ring-2:hover {
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
	}
</style>
