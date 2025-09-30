<script lang="ts">
	import ResumeCanvas from './(components)/ResumeCanvas.svelte';
	import Toolbar from './(components)/Toolbar.svelte';
	import PropertyPanel from './(components)/PropertyPanel.svelte';
	import { Button } from '$lib/components';
	import type { ElementType } from '$lib/types/resume';
	import { appStore } from '$lib/stores/appStore.svelte.ts';
	import { CANVAS_WIDTH, CANVAS_HEIGHT } from '$lib/const/dimension';

	let pages = $derived(Object.values(appStore.getPages()));

	function handleDragOver(event: DragEvent) {
		event.preventDefault();

		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'copy';
		}
	}

	function handleDrop(event: DragEvent, pageId: string) {
		event.preventDefault();

		if (!event.dataTransfer) return;

		try {
			const data = JSON.parse(event.dataTransfer.getData('application/json'));
			const rect = (event.target as HTMLElement).getBoundingClientRect();
			const page = appStore.getPages()[pageId];

			if (!page) return;

			// Calculate position relative to the canvas
			const scaleX = CANVAS_WIDTH / rect.width;
			const scaleY = CANVAS_HEIGHT / rect.height;

			let x = (event.clientX - rect.left) * scaleX;
			let y = (event.clientY - rect.top) * scaleY;

			const SNAP_THRESHOLD = 10;
			const { horizontal, vertical } = page.boundaries;

			// Calculate element dimensions to fit within boundaries
			const elementWidth = horizontal.end - horizontal.start;
			const elementHeight = Math.min(500, vertical.end - vertical.start);

			// Snap to boundaries
			if (Math.abs(x - horizontal.start) < SNAP_THRESHOLD) {
				x = horizontal.start;
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

			appStore.addElement({
				type: data.type as ElementType,
				x: boundedX,
				y: boundedY,
				pageId: pageId,
				width: elementWidth,
				height: elementHeight
			});
		} catch (error) {
			console.error('Error parsing drag data:', error);
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
				<span class="text-sm text-gray-600">
					{pages.length}
					{pages.length > 1 ? 'Pages' : 'Page'}
				</span>
			</div>

			<Button onClick={appStore.addPage} variant="secondary">Add Page</Button>
		</div>

		<!-- Canvas -->
		<div class="flex-1 overflow-auto p-8">
			<div class="flex flex-col items-center justify-center gap-12">
				{#each pages as page (page.id)}
					<ResumeCanvas
						{page}
						showDeleteButton={pages.length > 1}
						width={CANVAS_WIDTH}
						height={CANVAS_HEIGHT}
						onDragover={handleDragOver}
						onDrop={(e) => handleDrop(e, page.id)}
					/>
				{/each}
			</div>
		</div>
	</div>

	<!-- Property Panel -->
	<PropertyPanel />
</div>
