<script lang="ts">
	import type { ResumeElement, ResizeDirection } from '$lib/types/resume';
	import { appStore } from '$lib/stores/appStore.svelte.ts';

	interface Props {
		element: ResumeElement;
		isSelected: boolean;
		onResize: (e: MouseEvent, direction: ResizeDirection) => void;
	}

	let { element, isSelected, onResize }: Props = $props();

	// Local reactive state for the text content to enable proper two-way binding
	let textContent = $state(element.type === 'text' ? element.text : '');

	// Keep local state in sync with the element when it changes externally
	$effect(() => {
		if (element.type === 'text') {
			textContent = element.text;
		}
	});

	const resizeHandles: Array<{ direction: ResizeDirection; class: string }> = [
		{ direction: 'nw', class: 'top-0 left-0' },
		{ direction: 'ne', class: 'top-0 right-0' },
		{ direction: 'sw', class: 'bottom-0 left-0' },
		{ direction: 'se', class: 'bottom-0 right-0' }
	];
</script>

<div
	class="relative h-full w-full"
	onclick={() => appStore.selectElement(element)}
	role="button"
	tabindex="0"
	onkeydown={null}
>
	<!-- Element content based on type -->
	{#if element.type === 'text'}
		<div
			class="h-full w-full overflow-hidden p-2"
			style:font-family={element.fontFamily}
			style:font-size="{element.fontSize}px"
			style:font-weight={element.fontWeight}
			style:font-style={element.fontStyle}
			style:color={element.color}
			contenteditable="true"
			bind:textContent
			oninput={() => {
				appStore.updateElement({
					elementId: element.id,
					updates: {
						text: textContent
					},
					pageId: element.pageId
				});
			}}
		></div>
	{:else if element.type === 'shape'}
		<div class="flex h-full w-full items-center justify-center">
			{#if element.shapeType === 'horizontal-line'}
				<div
					class="w-full"
					style:height="{element.strokeWidth}px"
					style:background-color={element.strokeColor}
				></div>
			{:else if element.shapeType === 'vertical-line'}
				<div
					class="h-full"
					style:width="{element.strokeWidth}px"
					style:background-color={element.strokeColor}
				></div>
			{/if}
		</div>
	{:else if element.type === 'image'}
		<div class="flex h-full w-full items-center justify-center bg-gray-100">
			{#if element.src}
				<img src={element.src} alt={element.alt} class="max-h-full max-w-full object-contain" />
			{:else}
				<div class="text-sm text-gray-400">No image</div>
			{/if}
		</div>
	{/if}

	<!-- Resize handles (only show when selected) -->
	{#if isSelected}
		{#each resizeHandles as handle}
			<div
				class="absolute h-2 w-2 border border-white bg-blue-500 cursor-{handle.direction}-resize {handle.class}"
				onmousedown={(e) => {
					e.stopPropagation();
					onResize(e, handle.direction);
				}}
				role="button"
				tabindex="0"
				onkeydown={null}
			></div>
		{/each}
	{/if}
</div>
