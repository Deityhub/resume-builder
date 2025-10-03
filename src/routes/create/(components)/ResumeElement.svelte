<script lang="ts">
	import type { ResumeElement, ResizeDirection } from '$lib/types/resume';
	import { appStore } from '$lib/stores/appStore.svelte.ts';

	interface Props {
		element: ResumeElement;
		isSelected: boolean;
		onResize: (event: MouseEvent, direction: ResizeDirection) => void;
	}

	const { element, isSelected, onResize }: Props = $props();

	// Local reactive state for the text content to enable proper two-way binding
	let textContent = $state('');

	$effect(() => {
		if (element.type === 'text') {
			textContent = element.text;
		}
	});

	// Edge handles for width and height
	const edgeHandles: Array<{ direction: ResizeDirection; class: string; style: string }> = [
		{
			direction: 'n',
			class: 'top-0 left-1/2 -translate-x-1/2 cursor-n-resize',
			style: 'width: 60px; height: 4px;'
		},
		{
			direction: 's',
			class: 'bottom-0 left-1/2 -translate-x-1/2 cursor-s-resize',
			style: 'width: 60px; height: 4px;'
		},
		{
			direction: 'e',
			class: 'right-0 top-1/2 -translate-y-1/2 cursor-e-resize',
			style: 'width: 4px; height: 60px;'
		},
		{
			direction: 'w',
			class: 'left-0 top-1/2 -translate-y-1/2 cursor-w-resize',
			style: 'width: 4px; height: 60px;'
		}
	];

	// Corner handles for proportional resize
	const cornerHandles: Array<{ direction: ResizeDirection; class: string }> = [
		{ direction: 'nw', class: 'top-0 left-0 cursor-nw-resize' },
		{ direction: 'ne', class: 'top-0 right-0 cursor-ne-resize' },
		{ direction: 'sw', class: 'bottom-0 left-0 cursor-sw-resize' },
		{ direction: 'se', class: 'bottom-0 right-0 cursor-se-resize' }
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
			style:font-family="{element.fontFamily}, sans-serif"
			style:font-size="{element.fontSize}px"
			style:font-weight={element.fontWeight}
			style:font-style={element.fontStyle}
			style:text-decoration={element.textDecoration}
			style:text-transform={element.textTransform}
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
		<!-- Edge handles for width/height resize -->
		{#each edgeHandles as handle (handle.direction)}
			<div
				class="absolute bg-blue-500 transition-colors hover:bg-blue-600 {handle.class}"
				style={handle.style}
				onmousedown={(e) => {
					e.stopPropagation();
					onResize(e, handle.direction);
				}}
				role="button"
				tabindex="0"
				onkeydown={null}
			></div>
		{/each}

		<!-- Corner handles for proportional resize -->
		{#each cornerHandles as handle (handle.direction)}
			<div
				class="absolute h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-md transition-colors hover:bg-blue-600 {handle.class}"
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
