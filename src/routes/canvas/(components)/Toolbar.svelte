<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { Icons } from '$lib/icons';
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
	class="relative flex h-full flex-col border-r border-border bg-background transition-all duration-300 ease-in-out"
	class:w-64={isExpanded}
	class:w-20={!isExpanded}
	class:bg-blue-50={isDragging}
	class:border-blue-300={isDragging}
>
	<!-- Branding -->
	<div class="flex items-center justify-between p-4">
		<div
			onclick={() => goto(resolve('/'))}
			class="flex cursor-pointer items-center gap-2 overflow-hidden"
			role="button"
			tabindex="0"
			aria-label="Go to home"
			onkeydown={null}
		>
			<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center">
				<Icons.Logo />
			</div>
			<span
				class="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-xl font-semibold whitespace-nowrap text-transparent transition-opacity duration-200"
				class:opacity-0={!isExpanded}
				class:opacity-100={isExpanded}
			>
				Lienzo
			</span>
		</div>
	</div>
	<div class="absolute top-1/2 -right-4 rounded-xl bg-background">
		<Button onClick={() => (isExpanded = !isExpanded)} variant="text">
			{#if isExpanded}
				<ChevronLeft class="h-7 w-7" />
			{:else}
				<ChevronRight class="h-7 w-7" />
			{/if}
		</Button>
	</div>

	<div class="flex-1 overflow-y-auto px-2 pb-4" data-testid="toolbar">
		<div class="space-y-2">
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
						class="text-sm font-medium whitespace-nowrap text-foreground transition-opacity duration-200"
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
