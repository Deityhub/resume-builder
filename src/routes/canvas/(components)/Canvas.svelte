<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import CanvasElement from './CanvasElement.svelte';
	import Ruler from './Ruler.svelte';
	import { appStore } from '$lib/stores/appStore.svelte.ts';
	import type {
		TCanvasElement,
		DocumentPage,
		ResizeDirection,
		TCanvasInstance
	} from '$lib/types/canvas';
	import { pixelsToPercent } from '$lib/utils';

	const selectedElement = $derived(appStore.getSelectedElement());
	const scale = $derived(appStore.getScale());

	interface CanvasProps {
		page: DocumentPage;
		showDeleteButton?: boolean;
		width: number;
		height: number;
		onDragover?: (event: DragEvent) => void;
		onDrop?: (event: DragEvent) => void;
		'data-page-id'?: string;
		onMount?: (instance: TCanvasInstance) => void;
	}

	const {
		page,
		showDeleteButton = false,
		width,
		height,
		onDragover = (_event: DragEvent) => {},
		onDrop = (_event: DragEvent) => {},
		'data-page-id': dataPageId,
		onMount
	}: CanvasProps = $props();

	// Create component instance for onMount callback
	const componentInstance: TCanvasInstance = {
		updateDragPreview,
		clearDragPreview
	};

	// Call onMount when component is initialized
	$effect(() => {
		if (onMount) {
			onMount(componentInstance);
		}
	});

	let showBoundary = $state(true);
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
	function getOverlappingElements(element: TCanvasElement): TCanvasElement[] {
		return Object.values(page.elements).filter(
			(el) => el.id !== element.id && elementsOverlap(element, el)
		);
	}

	// Find which element (if any) contains the given point
	function findElementAtPosition(x: number, y: number, excludeId?: string): TCanvasElement | null {
		// Sort by zIndex descending to check top elements first
		const sorted = [...Object.values(page.elements)].sort((a, b) => b.zIndex - a.zIndex);

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
			let newX = element.x;
			let newY = element.y;
			let newWidth = element.width;
			let newHeight = element.height;

			const maxWidth = horizontal.end - horizontal.start;
			const maxHeight = vertical.end - vertical.start;

			// Ensure size stays within allowed range
			if (newWidth > maxWidth) {
				newWidth = maxWidth;
			}
			if (newHeight > maxHeight) {
				newHeight = maxHeight;
			}

			// Ensure minimum size
			if (newWidth < 20) {
				newWidth = 20;
			}
			if (newHeight < 20) {
				newHeight = 20;
			}

			// Constrain position to boundaries (similar to enforceBoundaries)
			if (newX < horizontal.start) {
				newX = horizontal.start;
			}
			if (newY < vertical.start) {
				newY = vertical.start;
			}
			if (newX + newWidth > horizontal.end) {
				newX = horizontal.end - newWidth;
			}
			if (newY + newHeight > vertical.end) {
				newY = vertical.end - newHeight;
			}

			// Only update if something actually changed to avoid unnecessary re-renders
			if (
				newX !== element.x ||
				newY !== element.y ||
				newWidth !== element.width ||
				newHeight !== element.height
			) {
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
			const propertyPanel = document.querySelector('[data-testid="property-panel"]');
			if (
				!canvasPageRef?.contains(event.target as Node) &&
				!propertyPanel?.contains(event.target as Node)
			) {
				showBoundary = false;
				appStore.selectElement(null);
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
		document.removeEventListener('touchmove', handleTouchMove);
		document.removeEventListener('touchend', handleGlobalPointerUp, true);
		document.removeEventListener('touchcancel', handleGlobalPointerUp, true);
		document.body.style.userSelect = '';
		document.body.style.touchAction = '';
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
		document.removeEventListener('touchmove', handleTouchMove);
		document.removeEventListener('touchend', handleGlobalPointerUp, true);
		document.removeEventListener('touchcancel', handleGlobalPointerUp, true);
		document.body.style.userSelect = '';
		document.body.style.touchAction = '';
	}

	function startElementDrag(event: PointerEvent | TouchEvent, element: TCanvasElement) {
		// Prevent default touch behavior - more aggressive for mobile
		event.preventDefault();
		event.stopPropagation();

		// For touch events, also prevent any scrolling
		if ('touches' in event) {
			// Force prevent any default behavior if cancellable
			if (event.cancelable) {
				event.preventDefault();
			}
		}

		// Start global, rAF-throttled drag
		isDragging = true;

		// Handle both pointer and touch events
		const startX = 'touches' in event ? event.touches[0].clientX : event.clientX;
		const startY = 'touches' in event ? event.touches[0].clientY : event.clientY;

		dragStart = { x: startX, y: startY };
		dragMeta = {
			id: element.id,
			pageId: element.pageId,
			startX: element.x,
			startY: element.y,
			width: element.width,
			height: element.height
		};
		lastPointer = { x: startX, y: startY };

		// Add both pointer and touch event listeners
		document.addEventListener('pointermove', handleGlobalPointerMove);
		document.addEventListener('pointerup', handleGlobalPointerUp, true);
		document.addEventListener('touchmove', handleTouchMove, {
			passive: false
		} as AddEventListenerOptions);
		document.addEventListener('touchend', handleGlobalPointerUp, true);
		document.addEventListener('touchcancel', handleGlobalPointerUp, true); // Add touchcancel
		document.body.style.userSelect = 'none';
		document.body.style.touchAction = 'none';
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isDragging || !dragMeta) return;

		const touch = e.touches[0];
		lastPointer = { x: touch.clientX, y: touch.clientY };

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

				const bounded = {
					x: newX,
					y: newY
				};

				appStore.updateElement({
					elementId: dragMeta.id,
					updates: { x: bounded.x, y: bounded.y },
					pageId: dragMeta.pageId
				});
			});
		}
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

	function handleElementResizeAnimationFrame({
		element,
		direction,
		startState,
		startX,
		startY,
		scaleX,
		scaleY,
		last
	}: {
		element: TCanvasElement;
		direction: ResizeDirection;
		startState: { x: number; y: number; w: number; h: number };
		startX: number;
		startY: number;
		scaleX: number;
		scaleY: number;
		last: { x: number; y: number };
	}) {
		return requestAnimationFrame(() => {
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

	function handleElementResize(
		event: MouseEvent | PointerEvent | TouchEvent,
		element: TCanvasElement,
		direction: ResizeDirection
	) {
		event.stopPropagation();
		event.preventDefault();
		isResizing = true;
		document.body.style.userSelect = '';
		document.body.style.touchAction = 'none'; // Prevent touch scrolling during resize

		const rect = canvasRef.getBoundingClientRect();
		const scaleX = width / rect.width;
		const scaleY = height / rect.height;

		// Handle both mouse/pointer and touch events
		const startX = 'touches' in event ? event.touches[0].clientX : event.clientX;
		const startY = 'touches' in event ? event.touches[0].clientY : event.clientY;

		const startState = {
			x: element.x,
			y: element.y,
			w: element.width,
			h: element.height
		};

		let resizeRafId: number | null = null;
		let last = { x: startX, y: startY };
		let lastUpdateTime = 0;
		const UPDATE_THROTTLE = 16; // ~60fps for smoother mobile performance

		const onPointerMove = (e: PointerEvent) => {
			last = { x: e.clientX, y: e.clientY };

			// Throttle updates for better mobile performance
			const now = performance.now();
			if (now - lastUpdateTime < UPDATE_THROTTLE && resizeRafId !== null) {
				return;
			}

			lastUpdateTime = now;

			if (resizeRafId === null) {
				resizeRafId = handleElementResizeAnimationFrame({
					element,
					direction,
					startState,
					startX,
					startY,
					scaleX,
					scaleY,
					last
				});

				resizeRafId = null;
			}
		};

		const onTouchMove = (e: TouchEvent) => {
			const touch = e.touches[0];
			last = { x: touch.clientX, y: touch.clientY };

			// Throttle updates for better mobile performance
			const now = performance.now();
			if (now - lastUpdateTime < UPDATE_THROTTLE && resizeRafId !== null) {
				return;
			}

			lastUpdateTime = now;

			if (resizeRafId === null) {
				resizeRafId = handleElementResizeAnimationFrame({
					element,
					direction,
					startState,
					startX,
					startY,
					scaleX,
					scaleY,
					last
				});

				resizeRafId = null;
			}
		};

		const option: AddEventListenerOptions = { passive: false };

		const onPointerUp = () => {
			isResizing = false;
			if (resizeRafId !== null) {
				cancelAnimationFrame(resizeRafId);
				resizeRafId = null;
			}
			document.removeEventListener('pointermove', onPointerMove);
			document.removeEventListener('pointerup', onPointerUp, true);
			document.removeEventListener('touchmove', onTouchMove, option);
			document.removeEventListener('touchend', onPointerUp, true);
			document.body.style.userSelect = '';
			document.body.style.touchAction = ''; // Restore touch scrolling
		};

		// Add both pointer and touch event listeners for better mobile support
		document.addEventListener('pointermove', onPointerMove);
		document.addEventListener('pointerup', onPointerUp, true);
		document.addEventListener('touchmove', onTouchMove, option);
		document.addEventListener('touchend', onPointerUp, true);
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
		let foundHover = false;
		for (const element of Object.values(page.elements)) {
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
			<div class="h-[30px] w-[30px]"></div>
			<Ruler
				orientation="horizontal"
				size={width}
				displaySize={width * scale}
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
				displaySize={height * scale}
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
			<div style:height="{height * scale}px" class="w-[30px]"></div>
			<div
				bind:this={canvasRef}
				id={`canvas-${dataPageId}`}
				data-testid="document-canvas"
				class="relative bg-background shadow-lg"
				style:width="{width * scale}px"
				style:height="{height * scale}px"
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

				<!-- Render all elements (sorted by zIndex) -->
				{#each Object.values(page.elements).sort((a, b) => a.zIndex - b.zIndex) as element (element.id)}
					{@const isSelected = selectedElement?.id === element.id}
					{@const isHighlighted = highlightedElementIds.includes(element.id)}
					{@const isHovered = hoveredElementId === element.id}
					<div
						role="button"
						tabindex="0"
						onkeydown={null}
						class="absolute cursor-move transition-all select-none {isSelected
							? 'ring-primary hover:ring-2 hover:ring-primary'
							: ''} {isHighlighted || isHovered || isSelected
							? 'ring-2 ring-primary'
							: ''} {isHovered ? 'ring-primary' : ''} {isHighlighted && !isSelected
							? 'ring-primary/30'
							: ''}"
						class:transition-none={isDragging || isResizing}
						style:left={pixelsToPercent(element.x, width)}
						style:top={pixelsToPercent(element.y, height)}
						style:width={pixelsToPercent(element.width, width)}
						style:height={pixelsToPercent(element.height, height)}
						style:z-index={element.zIndex}
						style:touch-action="none"
						onclick={() => {
							showBoundary = true;
						}}
						onpointerdown={(e) => {
							startElementDrag(e, element);
						}}
						ontouchstart={(e) => {
							startElementDrag(e, element);
						}}
					>
						<CanvasElement
							{element}
							{isSelected}
							onResize={(event, direction) => handleElementResize(event, element, direction)}
						/>
					</div>
				{/each}

				<!-- Drag preview -->
				{#if dragPreview}
					<div
						class="pointer-events-none absolute z-[9999] border-2 border-dashed border-primary bg-primary/10 opacity-50"
						style:left={pixelsToPercent(dragPreview.x, width)}
						style:top={pixelsToPercent(dragPreview.y, height)}
						style:width={pixelsToPercent(dragPreview.width, width)}
						style:height={pixelsToPercent(dragPreview.height, height)}
						data-html2canvas-ignore
					></div>
				{/if}

				<!-- Selection outline for empty canvas -->
				{#if !selectedElement && Object.keys(page.elements).length === 0}
					<div
						class="absolute inset-4 flex items-center justify-center text-muted-foreground max-sm:text-xs"
						data-html2canvas-ignore
					>
						Drag and drop elements from toolbar to create them
					</div>
				{/if}

				<!-- Boundary visualization -->
				{#if showBoundary}
					<div
						class="pointer-events-none absolute border-2 border-dashed border-primary/50"
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
						data-testid={`boundary-${page.id}`}
						data-html2canvas-ignore
					></div>
				{/if}
			</div>
		</div>
	</div>
</div>
