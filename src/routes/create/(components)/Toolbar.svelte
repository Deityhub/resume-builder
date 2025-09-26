<script lang="ts">
	type ElementType = 'text' | 'shape' | 'image';

	const tools = [
		{ type: 'text' as ElementType, label: 'Text', icon: 'T' },
		{ type: 'shape' as ElementType, label: 'Shape', icon: '━' },
		{ type: 'image' as ElementType, label: 'Image', icon: '🖼️' }
	];

	let toolbarRef: HTMLDivElement;
	let isDragging = $state(false);

	function handleDragStart(event: DragEvent, type: ElementType) {
		if (!event.dataTransfer) return;

		event.dataTransfer.effectAllowed = 'copy';
		event.dataTransfer.setData('application/json', JSON.stringify({ type }));

		isDragging = true;
	}

	function handleDragEnd() {
		isDragging = false;
	}
</script>

<div
	bind:this={toolbarRef}
	class="flex w-16 flex-col items-center border-r border-gray-200 bg-white py-4"
	class:bg-blue-50={isDragging}
	class:border-blue-300={isDragging}
>
	<div class="space-y-2">
		{#each tools as tool}
			<div
				draggable="true"
				ondragstart={(e) => handleDragStart(e, tool.type)}
				ondragend={handleDragEnd}
				role="button"
				tabindex="0"
				class="flex h-12 w-12 cursor-grab items-center justify-center rounded bg-gray-100 text-lg font-semibold transition-all duration-200 hover:bg-gray-200 active:cursor-grabbing"
				class:bg-blue-200={isDragging}
				class:scale-110={isDragging}
				title="Drag {tool.label} to canvas"
				aria-label="Drag {tool.label} tool to canvas"
			>
				{tool.icon}
			</div>
		{/each}
	</div>
</div>

<style>
	.cursor-grab {
		cursor: grab;
	}

	.cursor-grab:active {
		cursor: grabbing;
	}
</style>
