<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { resolve } from '$app/paths';
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
	class="relative flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out"
	class:w-64={isExpanded}
	class:w-20={!isExpanded}
	class:bg-blue-50={isDragging}
	class:border-blue-300={isDragging}
>
	<!-- Branding -->
	<div class="flex items-center justify-between border-b border-gray-200 px-4 py-4">
		<div
			onclick={() => goto(resolve('/'))}
			class="flex cursor-pointer items-center gap-2 overflow-hidden"
			role="button"
			tabindex="0"
			aria-label="Go to home"
			onkeydown={null}
		>
			<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center">
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					class="text-indigo-600"
				>
					<path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
					<path
						d="M2 17L12 22L22 17"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M2 12L12 17L22 12"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
			<span
				class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-semibold whitespace-nowrap text-transparent transition-opacity duration-200"
				class:opacity-0={!isExpanded}
				class:opacity-100={isExpanded}
			>
				Lienzo
			</span>
		</div>
	</div>
	<Button
		onClick={() => (isExpanded = !isExpanded)}
		variant="text"
		className="absolute top-1/2 -right-4 bg-gray-50"
	>
		{#if isExpanded}
			<ChevronLeft class="h-7 w-7" />
		{:else}
			<ChevronRight class="h-7 w-7" />
		{/if}
	</Button>

	<div class="flex-1 overflow-y-auto px-2 py-4" data-testid="toolbar">
		<div class="space-y-2">
			{#each tools as tool (tool.type)}
				<div
					data-testid="tool-{tool.type}"
					draggable="true"
					ondragstart={(e) => handleDragStart(e, tool.type)}
					ondragend={handleDragEnd}
					role="button"
					tabindex="0"
					class="group flex cursor-grab items-center gap-3 overflow-hidden rounded-lg p-2 transition-all duration-200 hover:bg-gray-100 active:cursor-grabbing"
					class:bg-blue-200={isDragging}
					class:scale-105={isDragging}
					title="Drag {tool.label} to canvas"
					aria-label="Drag {tool.label} tool to canvas"
				>
					<div
						class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg font-semibold text-gray-700 group-hover:bg-gray-200"
					>
						{tool.icon}
					</div>
					<span
						class="text-sm font-medium whitespace-nowrap text-gray-700 transition-opacity duration-200"
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
