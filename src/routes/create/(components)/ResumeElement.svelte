<script lang="ts">
	import type { ResumeElement, ResizeDirection } from '$lib/types/resume';

	interface Props {
		element: ResumeElement;
		isSelected: boolean;
		onSelect: () => void;
		onDelete: () => void;
		onResize: (e: MouseEvent, direction: ResizeDirection) => void;
	}

	let {
		element,
		isSelected,
		onSelect,
		onDelete,
		onResize
	}: Props = $props();


	const resizeHandles: Array<{ direction: ResizeDirection; class: string }> = [
		{ direction: 'nw', class: 'top-0 left-0' },
		{ direction: 'ne', class: 'top-0 right-0' },
		{ direction: 'sw', class: 'bottom-0 left-0' },
		{ direction: 'se', class: 'bottom-0 right-0' }
	];
</script>

<div
	class="relative w-full h-full"
	onclick={onSelect}
	oncontextmenu={onDelete}
	role="button"
	tabindex="0"
	onkeydown={null}
>
	<!-- Element content based on type -->
	{#if element.type === 'text'}
		<div
			class="w-full h-full p-2 overflow-hidden"
			style="font-family: {element.properties.fontFamily}; font-size: {element.properties.fontSize}px; font-weight: {element.properties.fontWeight}; font-style: {element.properties.fontStyle}; color: {element.properties.color};"
			contenteditable="true"
			oninput={(e) => {
				// This would update the element properties
				console.log('Text changed:', e.currentTarget.textContent);
			}}
		>
			{element.properties.text}
		</div>
	{:else if element.type === 'shape'}
		<div class="w-full h-full flex items-center justify-center">
			{#if element.properties.shapeType === 'horizontal-line'}
				<div
					class="w-full"
					style="height: {element.properties.strokeWidth}px; background-color: {element.properties.strokeColor};"
				></div>
			{:else if element.properties.shapeType === 'vertical-line'}
				<div
					class="h-full"
					style="width: {element.properties.strokeWidth}px; background-color: {element.properties.strokeColor};"
				></div>
			{/if}
		</div>
	{:else if element.type === 'image'}
		<div class="w-full h-full flex items-center justify-center bg-gray-100">
			{#if element.properties.src}
				<img
					src={element.properties.src}
					alt={element.properties.alt}
					class="max-w-full max-h-full object-contain"
				/>
			{:else}
				<div class="text-gray-400 text-sm">No image</div>
			{/if}
		</div>
	{/if}

	<!-- Resize handles (only show when selected) -->
	{#if isSelected}
		{#each resizeHandles as handle}
			<div
				class="absolute w-2 h-2 bg-blue-500 border border-white cursor-{handle.direction}-resize {handle.class}"
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
