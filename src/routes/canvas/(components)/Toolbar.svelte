<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	type ElementType = 'text' | 'shape' | 'image';

	const tools = [
		{ type: 'text' as ElementType, label: 'Text', icon: 'T' },
		{ type: 'shape' as ElementType, label: 'Shapes', icon: '◇' },
		{ type: 'image' as ElementType, label: 'Image', icon: '🖼️' }
	];

	let toolbarRef: HTMLDivElement;
	let isDragging = $state(false);
	let isExpanded = $state(false);

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
	class="absolute left-[50%] z-9999 m-auto flex h-auto w-[90vw] translate-x-[-50%] translate-y-[-50%] flex-col border-r border-border bg-background transition-all duration-300 ease-in-out max-sm:top-40 sm:top-28 md:relative md:top-20 md:left-[unset] md:h-full md:translate-none {isExpanded
		? 'md:w-64'
		: 'md:w-20'}"
	class:bg-blue-50={isDragging}
	class:border-blue-300={isDragging}
>
	<div class="absolute top-1/2 -right-4 hidden rounded-xl bg-background md:block">
		<Button onClick={() => (isExpanded = !isExpanded)} variant="text">
			{#if isExpanded}
				<ChevronLeft class="h-7 w-7" />
			{:else}
				<ChevronRight class="h-7 w-7" />
			{/if}
		</Button>
	</div>

	<div class="flex-1 overflow-y-auto px-2 pt-0 md:pt-8 md:pb-4" data-testid="toolbar">
		<div class="flex flex-row justify-center gap-5 space-y-2 md:flex-col md:justify-start md:gap-0">
			{#each tools as tool (tool.type)}
				<div
					data-testid="tool-{tool.type}"
					draggable="true"
					ondragstart={(e) => handleDragStart(e, tool.type)}
					ondragend={handleDragEnd}
					role="button"
					tabindex="0"
					class="group flex cursor-grab items-center gap-3 overflow-hidden rounded-lg p-2 transition-all duration-200 hover:bg-foreground/5 active:cursor-grabbing {isDragging
						? 'scale-105 bg-primary/10'
						: ''}"
					title="Drag {tool.label} to canvas"
					aria-label="Drag {tool.label} tool to canvas"
				>
					<div
						class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-lg font-semibold text-foreground"
					>
						{tool.icon}
					</div>
					<span
						class="hidden text-sm font-medium whitespace-nowrap text-foreground transition-opacity duration-200 md:block"
						class:opacity-0={!isExpanded}
						class:opacity-100={isExpanded}
					>
						{tool.label}
					</span>
				</div>
			{/each}
		</div>
	</div>
</div>
