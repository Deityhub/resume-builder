<script lang="ts">
	import ResumeCanvas from './(components)/ResumeCanvas.svelte';
	import Toolbar from './(components)/Toolbar.svelte';
	import PropertyPanel from './(components)/PropertyPanel.svelte';
	import ExportModal from './(components)/ExportModal.svelte';
	import { Button } from '$lib/components';
	import type { ElementType, TCanvasInstance } from '$lib/types/resume';
	import { appStore } from '$lib/stores/appStore.svelte.ts';
	import { CANVAS_WIDTH, CANVAS_HEIGHT } from '$lib/const/dimension';

	const pages = $derived(Object.values(appStore.getPages()));
	const canvasInstances = $state<Record<string, TCanvasInstance>>({});

	function setCanvasRefInstance(pageId: string, instance: TCanvasInstance) {
		canvasInstances[pageId] = instance;
	}

	function getCanvasRefInstance(pageId: string): TCanvasInstance | undefined {
		return canvasInstances[pageId];
	}

	let exportModalOpen = $state(false);

	function handleDragOver(event: DragEvent, pageId: string) {
		event.preventDefault();

		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'copy';
		}

		// Update drag preview in the canvas component
		const canvasComponent = getCanvasRefInstance(pageId);
		if (canvasComponent && canvasComponent.updateDragPreview) {
			canvasComponent.updateDragPreview(event);
		}
	}

	function handleDrop(event: DragEvent, pageId: string) {
		event.preventDefault();

		if (!event.dataTransfer) return;

		try {
			const data = JSON.parse(event.dataTransfer.getData('application/json'));
			// Use currentTarget (the canvas element), not target (which could be a child)
			const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
			const page = appStore.getPages()[pageId];

			if (!page) return;

			// Calculate position relative to the canvas
			const scaleX = CANVAS_WIDTH / rect.width;
			const scaleY = CANVAS_HEIGHT / rect.height;

			let x = (event.clientX - rect.left) * scaleX;
			let y = (event.clientY - rect.top) * scaleY;

			const SNAP_THRESHOLD = 10;
			const { horizontal, vertical } = page.boundaries;

			// Calculate dynamic element dimensions based on drop position
			// Width: from drop position to right boundary
			let elementWidth = horizontal.end - x;
			// Height: default 500px or remaining space, whichever is smaller
			let elementHeight = Math.min(500, vertical.end - y);

			// Ensure minimum dimensions
			const MIN_WIDTH = 100;
			const MIN_HEIGHT = 50;

			if (elementWidth < MIN_WIDTH) {
				elementWidth = Math.min(MIN_WIDTH, horizontal.end - horizontal.start);
			}
			if (elementHeight < MIN_HEIGHT) {
				elementHeight = Math.min(MIN_HEIGHT, vertical.end - vertical.start);
			}

			// Snap to boundaries
			if (Math.abs(x - horizontal.start) < SNAP_THRESHOLD) {
				x = horizontal.start;
				elementWidth = horizontal.end - horizontal.start;
			}
			if (Math.abs(x - horizontal.end) < SNAP_THRESHOLD) {
				x = horizontal.end - elementWidth;
			}
			if (Math.abs(y - vertical.start) < SNAP_THRESHOLD) {
				y = vertical.start;
			}
			if (Math.abs(y - vertical.end) < SNAP_THRESHOLD) {
				y = vertical.end - elementHeight;
			}

			// Enforce boundaries - ensure element fits within bounds
			const boundedX = Math.max(horizontal.start, Math.min(x, horizontal.end - elementWidth));
			const boundedY = Math.max(vertical.start, Math.min(y, vertical.end - elementHeight));

			// Check if dropping on an existing element (search all elements, topmost first)
			const allElements = Object.values(page.elements).sort((a, b) => b.zIndex - a.zIndex);
			let parentElementId: string | null = null;
			for (const element of allElements) {
				if (
					boundedX >= element.x &&
					boundedX <= element.x + element.width &&
					boundedY >= element.y &&
					boundedY <= element.y + element.height
				) {
					parentElementId = element.id;
					break;
				}
			}

			appStore.addElement({
				type: data.type as ElementType,
				x: boundedX,
				y: boundedY,
				pageId: pageId,
				width: elementWidth,
				height: elementHeight,
				parentElementId
			});

			// Clear drag preview
			const canvasComponent = getCanvasRefInstance(pageId);
			if (canvasComponent && canvasComponent.clearDragPreview) {
				canvasComponent.clearDragPreview();
			}
		} catch (_error) {
			// Error parsing drag data - silently handle for better UX
		}
	}
</script>

<div class="flex h-screen bg-gray-50">
	<!-- Toolbar -->
	<Toolbar />

	<!-- Main Canvas Area -->
	<div class="flex flex-1 flex-col">
		<!-- Page Navigation -->
		<div class="flex items-center justify-between border-b bg-white p-4">
			<div class="flex items-center gap-2">
				<span class="text-sm text-gray-600" data-testid="page-count">
					{pages.length}
					{pages.length > 1 ? 'Pages' : 'Page'}
				</span>
			</div>

			<div class="flex items-center gap-2">
				<Button onClick={() => (exportModalOpen = true)} variant="ghost" data-testid="export-btn">
					Export PDF
				</Button>
				<Button onClick={appStore.addPage} variant="secondary" data-testid="add-page-btn"
					>Add Page</Button
				>
			</div>
		</div>

		<!-- Canvas -->
		<div class="flex-1 overflow-auto p-8" data-testid="canvas-container">
			<div class="flex flex-col items-center justify-center gap-12">
				{#each pages as page (page.id)}
					<ResumeCanvas
						bind:this={canvasInstances[page.id]}
						{page}
						showDeleteButton={pages.length > 1}
						width={CANVAS_WIDTH}
						height={CANVAS_HEIGHT}
						data-page-id={page.id}
						onDragover={(e) => handleDragOver(e, page.id)}
						onDrop={(e) => handleDrop(e, page.id)}
						onMount={(instance: TCanvasInstance) => setCanvasRefInstance(page.id, instance)}
					/>
				{/each}
			</div>
		</div>
	</div>

	<!-- Property Panel -->
	<PropertyPanel />

	<!-- Export Modal -->
	<ExportModal isOpen={exportModalOpen} onClose={() => (exportModalOpen = false)} />
</div>
