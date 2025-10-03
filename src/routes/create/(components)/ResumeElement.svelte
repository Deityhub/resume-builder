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
		<div class="flex h-full w-full items-center justify-center overflow-hidden">
			<svg
				class="h-full w-full"
				style:transform="rotate({element.rotation || 0}deg)"
				viewBox="{-element.strokeWidth / 2} {-element.strokeWidth / 2} {element.width +
					element.strokeWidth} {element.height + element.strokeWidth}"
				xmlns="http://www.w3.org/2000/svg"
			>
				{#if element.shapeType === 'rectangle'}
					<rect
						width={element.width}
						height={element.height}
						fill={element.fillColor || 'none'}
						fill-opacity={element.fillOpacity || 0}
						stroke={element.strokeColor}
						stroke-width={element.strokeWidth}
						stroke-opacity={element.strokeOpacity || 1}
						stroke-dasharray={element.strokeStyle === 'dashed'
							? '5,5'
							: element.strokeStyle === 'dotted'
								? '2,2'
								: 'none'}
						rx={element.cornerRadius ? `${(element.width * element.cornerRadius) / 100}px` : '0px'}
						ry={element.cornerRadius ? `${(element.height * element.cornerRadius) / 100}px` : '0px'}
					/>
				{:else if element.shapeType === 'circle'}
					<circle
						cx={element.width / 2}
						cy={element.height / 2}
						r={Math.min(element.width, element.height) / 2 - element.strokeWidth / 2}
						fill={element.fillColor || 'none'}
						fill-opacity={element.fillOpacity || 0}
						stroke={element.strokeColor}
						stroke-width={element.strokeWidth}
						stroke-opacity={element.strokeOpacity || 1}
						stroke-dasharray={element.strokeStyle === 'dashed'
							? '5,5'
							: element.strokeStyle === 'dotted'
								? '2,2'
								: 'none'}
					/>
				{:else if element.shapeType === 'ellipse'}
					<ellipse
						cx={element.width / 2}
						cy={element.height / 2}
						rx={element.width / 2}
						ry={element.height / 2}
						fill={element.fillColor || 'none'}
						fill-opacity={element.fillOpacity || 0}
						stroke={element.strokeColor}
						stroke-width={element.strokeWidth}
						stroke-opacity={element.strokeOpacity || 1}
						stroke-dasharray={element.strokeStyle === 'dashed'
							? '5,5'
							: element.strokeStyle === 'dotted'
								? '2,2'
								: 'none'}
					/>
				{:else if element.shapeType === 'triangle'}
					<polygon
						points="{element.width / 2},0 {element.width},{element.height} 0,{element.height}"
						fill={element.fillColor || 'none'}
						fill-opacity={element.fillOpacity || 0}
						stroke={element.strokeColor}
						stroke-width={element.strokeWidth}
						stroke-opacity={element.strokeOpacity || 1}
						stroke-dasharray={element.strokeStyle === 'dashed'
							? '5,5'
							: element.strokeStyle === 'dotted'
								? '2,2'
								: 'none'}
					/>
				{:else if element.shapeType === 'diamond'}
					<polygon
						points="{element.width / 2},0 {element.width},{element.height / 2} {element.width /
							2},{element.height} 0,{element.height / 2}"
						fill={element.fillColor || 'none'}
						fill-opacity={element.fillOpacity || 0}
						stroke={element.strokeColor}
						stroke-width={element.strokeWidth}
						stroke-opacity={element.strokeOpacity || 1}
						stroke-dasharray={element.strokeStyle === 'dashed'
							? '5,5'
							: element.strokeStyle === 'dotted'
								? '2,2'
								: 'none'}
					/>
				{:else if element.shapeType === 'star'}
					<polygon
						points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
						fill={element.fillColor || 'none'}
						fill-opacity={element.fillOpacity || 0}
						stroke={element.strokeColor}
						stroke-width={element.strokeWidth}
						stroke-opacity={element.strokeOpacity || 1}
						stroke-dasharray={element.strokeStyle === 'dashed'
							? '5,5'
							: element.strokeStyle === 'dotted'
								? '2,2'
								: 'none'}
						transform="scale({element.width / 100}) translate({element.width * 0.5 -
							50}, {element.height * 0.5 - 45})"
					/>
				{:else if element.shapeType === 'hexagon'}
					<polygon
						points="{element.width / 2},0 {element.width * 0.75},{element.height *
							0.25} {element.width * 0.75},{element.height * 0.75} {element.width /
							2},{element.height} {element.width * 0.25},{element.height * 0.75} {element.width *
							0.25},{element.height * 0.25}"
						fill={element.fillColor || 'none'}
						fill-opacity={element.fillOpacity || 0}
						stroke={element.strokeColor}
						stroke-width={element.strokeWidth}
						stroke-opacity={element.strokeOpacity || 1}
						stroke-dasharray={element.strokeStyle === 'dashed'
							? '5,5'
							: element.strokeStyle === 'dotted'
								? '2,2'
								: 'none'}
					/>
				{:else if element.shapeType === 'pentagon'}
					<polygon
						points="{element.width / 2},0 {element.width * 0.85},{element.height *
							0.3} {element.width * 0.95},{element.height * 0.8} {element.width *
							0.5},{element.height} {element.width * 0.05},{element.height * 0.8} {element.width *
							0.15},{element.height * 0.3}"
						fill={element.fillColor || 'none'}
						fill-opacity={element.fillOpacity || 0}
						stroke={element.strokeColor}
						stroke-width={element.strokeWidth}
						stroke-opacity={element.strokeOpacity || 1}
						stroke-dasharray={element.strokeStyle === 'dashed'
							? '5,5'
							: element.strokeStyle === 'dotted'
								? '2,2'
								: 'none'}
					/>
				{:else if element.shapeType === 'line-horizontal'}
					<line
						x1="0"
						y1={element.height / 2}
						x2={element.width}
						y2={element.height / 2}
						stroke={element.strokeColor}
						stroke-width={element.strokeWidth}
						stroke-opacity={element.strokeOpacity || 1}
						stroke-dasharray={element.strokeStyle === 'dashed'
							? '5,5'
							: element.strokeStyle === 'dotted'
								? '2,2'
								: 'none'}
					/>
				{:else if element.shapeType === 'line-vertical'}
					<line
						x1={element.width / 2}
						y1="0"
						x2={element.width / 2}
						y2={element.height}
						stroke={element.strokeColor}
						stroke-width={element.strokeWidth}
						stroke-opacity={element.strokeOpacity || 1}
						stroke-dasharray={element.strokeStyle === 'dashed'
							? '5,5'
							: element.strokeStyle === 'dotted'
								? '2,2'
								: 'none'}
					/>
				{:else if element.shapeType === 'arrow-right'}
					<polygon
						points="0,{element.height / 2} {element.width * 0.7},{element.height /
							2} {element.width * 0.7},0 {element.width},{element.height / 2} {element.width *
							0.7},{element.height} {element.width * 0.7},{element.height / 2}"
						fill={element.fillColor || element.strokeColor}
						fill-opacity={element.fillOpacity || 1}
						stroke={element.strokeColor}
						stroke-width={element.strokeWidth}
						stroke-opacity={element.strokeOpacity || 1}
					/>
				{:else if element.shapeType === 'arrow-left'}
					<polygon
						points="{element.width},{element.height / 2} {element.width * 0.3},{element.height /
							2} {element.width * 0.3},0 0,{element.height / 2} {element.width *
							0.3},{element.height} {element.width * 0.3},{element.height / 2}"
						fill={element.fillColor || element.strokeColor}
						fill-opacity={element.fillOpacity || 1}
						stroke={element.strokeColor}
						stroke-width={element.strokeWidth}
						stroke-opacity={element.strokeOpacity || 1}
					/>
				{:else if element.shapeType === 'arrow-up'}
					<polygon
						points="{element.width / 2},0 {element.width / 2},{element.height *
							0.7} 0,{element.height * 0.7} {element.width /
							2},{element.height} {element.width},{element.height * 0.7} {element.width /
							2},{element.height * 0.7}"
						fill={element.fillColor || element.strokeColor}
						fill-opacity={element.fillOpacity || 1}
						stroke={element.strokeColor}
						stroke-width={element.strokeWidth}
						stroke-opacity={element.strokeOpacity || 1}
					/>
				{:else if element.shapeType === 'arrow-down'}
					<polygon
						points="{element.width / 2},{element.height} {element.width / 2},{element.height *
							0.3} 0,{element.height * 0.3} {element.width / 2},0 {element.width},{element.height *
							0.3} {element.width / 2},{element.height * 0.3}"
						fill={element.fillColor || element.strokeColor}
						fill-opacity={element.fillOpacity || 1}
						stroke={element.strokeColor}
						stroke-width={element.strokeWidth}
						stroke-opacity={element.strokeOpacity || 1}
					/>
				{/if}
			</svg>
		</div>
	{:else if element.type === 'image'}
		<div
			class="flex h-full w-full items-center justify-center overflow-hidden"
			style:background-color={element.backgroundColor || 'transparent'}
			style:border-radius={`${element.borderRadius || 0}%`}
			style:opacity={element.opacity || 1}
			style:border={`${element.borderWidth || 0}px ${element.borderStyle || 'solid'} ${element.borderColor || '#000000'}`}
			style:box-shadow={element.boxShadow || ''}
			style:background-image={element.src ? `url(${element.src})` : 'none'}
			style:background-size={element.objectFit === 'contain'
				? 'contain'
				: element.objectFit === 'cover'
					? 'cover'
					: element.objectFit === 'fill'
						? '100% 100%'
						: element.objectFit === 'scale-down'
							? 'auto'
							: 'auto'}
			style:background-position="center"
			style:background-repeat="no-repeat"
		>
			<!-- Hidden img for accessibility and image loading -->
			{#if element.src}
				<img src={element.src} alt={element.alt} style="display: none;" />
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
