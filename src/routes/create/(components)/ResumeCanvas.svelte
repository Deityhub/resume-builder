<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import ResumeElementComponent from './ResumeElement.svelte';
	import type { ResumeElement, ResumePage, ResizeDirection } from '$lib/types/resume';
	import { appStore } from '$lib/stores/appStore.svelte.ts';

	let selectedElement = $derived(appStore.getSelectedElement());

	interface ResumeCanvasProps {
		page: ResumePage;
		showDeleteButton: boolean;
		width: number;
		height: number;
		onDragover: (event: DragEvent) => void;
		onDrop: (event: DragEvent) => void;
	}

	let {
		page,
		showDeleteButton = false,
		width,
		height,
		onDragover,
		onDrop
	}: ResumeCanvasProps = $props();

	let canvasRef: HTMLDivElement;
	let isDragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });

	// Convert pixel coordinates to percentage for responsive design
	function pixelsToPercent(pixels: number, total: number): string {
		return `${(pixels / total) * 100}%`;
	}

	function handleCanvasClick(event: MouseEvent) {
		if (event.target === canvasRef) {
			appStore.selectElement(null);
		}
	}

	function handleElementMove(event: MouseEvent, element: ResumeElement) {
		if (isDragging && element) {
			const rect = canvasRef.getBoundingClientRect();
			const scaleX = width / rect.width;
			const scaleY = height / rect.height;

			const deltaX = (event.clientX - dragStart.x) * scaleX;
			const deltaY = (event.clientY - dragStart.y) * scaleY;

			appStore.updateElement({
				elementId: element.id,
				updates: {
					x: Math.max(0, Math.min(width - element.width, element.x + deltaX)),
					y: Math.max(0, Math.min(height - element.height, element.y + deltaY))
				},
				pageId: element.pageId
			});

			dragStart = { x: event.clientX, y: event.clientY };
		}
	}

	function handleElementResize(
		event: MouseEvent,
		element: ResumeElement,
		direction: ResizeDirection
	) {
		event.stopPropagation();

		const rect = canvasRef.getBoundingClientRect();
		const scaleX = width / rect.width;
		const scaleY = height / rect.height;

		const startX = event.clientX;
		const startY = event.clientY;

		function onMouseMove(e: MouseEvent) {
			const deltaX = (e.clientX - startX) * scaleX;
			const deltaY = (e.clientY - startY) * scaleY;

			let newWidth = element.width;
			let newHeight = element.height;
			let newX = element.x;
			let newY = element.y;

			switch (direction) {
				case 'se': // Southeast
					newWidth = Math.max(20, element.width + deltaX);
					newHeight = Math.max(20, element.height + deltaY);
					break;
				case 'sw': // Southwest
					newWidth = Math.max(20, element.width - deltaX);
					newX = Math.max(0, element.x + deltaX);
					newHeight = Math.max(20, element.height + deltaY);
					break;
				case 'ne': // Northeast
					newWidth = Math.max(20, element.width + deltaX);
					newHeight = Math.max(20, element.height - deltaY);
					newY = Math.max(0, element.y + deltaY);
					break;
				case 'nw': // Northwest
					newWidth = Math.max(20, element.width - deltaX);
					newX = Math.max(0, element.x + deltaX);
					newHeight = Math.max(20, element.height - deltaY);
					newY = Math.max(0, element.y + deltaY);
					break;
			}

			appStore.updateElement({
				elementId: element.id,
				updates: {
					x: newX,
					y: newY,
					width: newWidth,
					height: newHeight
				},
				pageId: element.pageId
			});
		}

		function onMouseUp() {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}
</script>

<div
	bind:this={canvasRef}
	class="relative overflow-hidden border-2 border-gray-300 bg-white shadow-lg"
	style:width={pixelsToPercent(width, width)}
	style:height={pixelsToPercent(height, height)}
	style:aspect-ratio="{width}/{height}"
	onclick={handleCanvasClick}
	role="button"
	tabindex="0"
	onkeydown={null}
	ondragover={onDragover}
	ondrop={onDrop}
>
	<!-- Delete Page Button -->
	{#if showDeleteButton}
		<Button
			variant="destructive"
			onClick={(e) => {
				e.stopPropagation();
				appStore.deletePage(page.id);
			}}
			className="absolute top-2 right-2 z-20"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
				/>
			</svg>
		</Button>
	{/if}

	<!-- Render all elements -->
	{#each Object.values(page.elements) as element (element.id)}
		{@const isSelected = selectedElement?.id === element.id}
		<div
			role="button"
			tabindex="0"
			onkeydown={null}
			class="absolute cursor-move select-none"
			class:hover:ring-2={isSelected}
			class:hover:ring-blue-500={isSelected}
			class:ring-2={isSelected}
			class:ring-blue-500={isSelected}
			style:left={pixelsToPercent(element.x, width)}
			style:top={pixelsToPercent(element.y, height)}
			style:width={pixelsToPercent(element.width, width)}
			style:height={pixelsToPercent(element.height, height)}
			onmousedown={(e) => {
				isDragging = true;
				dragStart = { x: e.clientX, y: e.clientY };
			}}
			onmousemove={(e) => handleElementMove(e, element)}
			onmouseup={() => {
				isDragging = false;
			}}
		>
			<ResumeElementComponent
				{element}
				{isSelected}
				onResize={(event, direction) => handleElementResize(event, element, direction)}
			/>
		</div>
	{/each}

	<!-- Selection outline for empty canvas -->
	{#if !selectedElement && Object.values(page.elements).length === 0}
		<div
			class="absolute inset-4 flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400"
		>
			Drag and drop elements from toolbar to create them
		</div>
	{/if}
</div>

<style>
	.hover\:ring-2:hover {
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
	}
</style>
