<script lang="ts">
	import ResumeCanvas from './(components)/ResumeCanvas.svelte';
	import Toolbar from './(components)/Toolbar.svelte';
	import PropertyPanel from './(components)/PropertyPanel.svelte';
	import { Button } from '$lib';
	import type { ResumeElement, ResumePage, ElementType, TextElement, ShapeElement, ImageElement } from '$lib/types/resume';

	let pages: ResumePage[] = $state([
		{
			id: 'page-1',
			elements: []
		}
	]);

	let selectedElement: ResumeElement | null = $state(null);

	// Canvas dimensions (A4 at 300 DPI)
	const CANVAS_WIDTH = 2480; // A4 width in pixels at 300 DPI
	const CANVAS_HEIGHT = 3508; // A4 height in pixels at 300 DPI

	function addPage() {
		const newPage: ResumePage = {
			id: `page-${Date.now()}`,
			elements: []
		};
		pages = [...pages, newPage];
	}
	function addElement({
		type,
		x,
		y,
		pageId
	}: {
		type: ElementType;
		x: number;
		y: number;
		pageId: string;
	}) {
		const currentPage = pages.find((page) => page.id === pageId);
		if (!currentPage) return;

		const baseElement = {
			id: `element-${Date.now()}`,
			x,
			y,
			width: CANVAS_WIDTH - 164.6,
			height: 493.8,
			pageId: currentPage.id
		};

		let newElement: ResumeElement;
		
		switch (type) {
			case 'text': {
				const properties = getDefaultProperties('text') as TextElement['properties'];
				newElement = {
					...baseElement,
					type: 'text',
					properties
				};
				break;
			}
			case 'shape': {
				const properties = getDefaultProperties('shape') as ShapeElement['properties'];
				newElement = {
					...baseElement,
					type: 'shape',
					properties
				};
				break;
			}
			case 'image': {
				const properties = getDefaultProperties('image') as ImageElement['properties'];
				newElement = {
					...baseElement,
					type: 'image',
					properties
				};
				break;
			}
			default: {
				const _exhaustiveCheck: never = type;
				throw new Error(`Unknown element type: ${_exhaustiveCheck}`);
			}
		}

		currentPage.elements = [...currentPage.elements, newElement];
		selectedElement = newElement;
	}

	function getDefaultProperties(type: 'text' | 'shape' | 'image') {
		switch (type) {
			case 'text':
				return {
					text: 'Your text here',
					fontFamily: 'Inter',
					fontSize: 16,
					fontWeight: 'normal',
					fontStyle: 'normal',
					color: '#000000'
				};
			case 'shape':
				return {
					shapeType: 'horizontal-line',
					strokeColor: '#000000',
					strokeWidth: 2
				};
			case 'image':
				return {
					src: '',
					alt: 'Image'
				};
			default: {
				const _exhaustiveCheck: never = type;
				throw new Error(`Unknown element type: ${_exhaustiveCheck}`);
			}
		}
	}

	function selectElement(element: ResumeElement | null) {
		selectedElement = element;
	}

	function updateElement({
		elementId,
		updates,
		pageId
	}: {
		elementId: string;
		updates: Partial<ResumeElement>;
		pageId: string;
	}) {
		const currentPage = pages.find((page) => page.id === pageId);
		if (!currentPage) return;

		currentPage.elements = currentPage.elements.map((el) => {
			if (el.id !== elementId) return el;
			
			// Create a new object with the updated properties
			const updatedElement = { ...el, ...updates };
			
			// Ensure the properties object is properly typed
			if (updates.properties) {
				updatedElement.properties = { ...el.properties, ...updates.properties };
			}
			
			return updatedElement as ResumeElement;
		});
	}

	function deleteElement(element: ResumeElement) {
		const currentPage = pages.find((page) => page.id === element.pageId);
		if (!currentPage) return;

		currentPage.elements = currentPage.elements.filter((el) => el.id !== element.id);
		if (selectedElement?.id === element.id) {
			selectedElement = null;
		}
	}

	function deletePage(pageId: string) {
		if (pages.length <= 1) return; // Don't delete if only one page exists

		pages = pages.filter((page) => page.id !== pageId);
	}

	function updateElementProperties({
		elementId,
		properties,
		pageId
	}: {
		elementId: string;
		properties: Record<string, any>;
		pageId: string;
	}) {
		const currentPage = pages.find((page) => page.id === pageId);
		if (!currentPage) return;

		currentPage.elements = currentPage.elements.map((el) => {
			if (el.id !== elementId) return el;
			
			// Create a new properties object with the updated values
			const updatedProperties = { ...el.properties, ...properties };
			
			// Return a new element with the updated properties
			return { ...el, properties: updatedProperties } as ResumeElement;
		});
	}

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

			addElement({
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

			<Button onClick={addPage} variant="secondary">Add Page</Button>
		</div>

		<!-- Canvas -->
		<div class="flex-1 overflow-auto p-8">
			<div class="flex flex-col justify-center gap-12">
				{#each pages as page (page.id)}
					<ResumeCanvas
						{page}
						{selectedElement}
						{selectElement}
						{updateElement}
						{deleteElement}
						{deletePage}
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
	<PropertyPanel bind:element={selectedElement} {updateElementProperties} {deleteElement} />
</div>
