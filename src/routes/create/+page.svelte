<script lang="ts">
	import ResumeCanvas from './(components)/ResumeCanvas.svelte';
	import Toolbar from './(components)/Toolbar.svelte';
	import PropertyPanel from './(components)/PropertyPanel.svelte';
	import { Button } from '$lib/components';
	import type { ElementType } from '$lib/types/resume';
	import { appStore } from '$lib/stores/appStore.svelte.ts';

	let pages = $derived(Object.values(appStore.getPages()));

	// Canvas dimensions (A4 at 300 DPI)
	const CANVAS_WIDTH = 2480; // A4 width in pixels at 300 DPI
	const CANVAS_HEIGHT = 3508; // A4 height in pixels at 300 DPI

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

			// Calculate position relative to the canvas
			const x = event.clientX + rect.left;
			const y = event.clientY + rect.top;

			// Ensure the element is within bounds
			const boundedX = x || Math.max(0, Math.min(x, CANVAS_WIDTH - 100));
			const boundedY = y || Math.max(0, Math.min(y, CANVAS_HEIGHT - 50));

			appStore.addElement({
				type: data.type as ElementType,
				x: boundedX,
				y: boundedY,
				pageId: pageId
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
			<div class="flex flex-col justify-center gap-12">
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
