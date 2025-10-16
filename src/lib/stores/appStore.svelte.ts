import { getDefaultProperties } from '$lib/utils/properties';
import type { ElementType, ResumeElement, ResumePage, RulerBoundaries } from '../types/resume';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../const/dimension';

// Create a writable store for the application state
const createAppStore = () => {
	const getDefaultPage = (id: string): ResumePage => {
		return {
			id,
			elements: {},
			boundaries: {
				horizontal: { start: 100, end: CANVAS_WIDTH - 100 },
				vertical: { start: 100, end: CANVAS_HEIGHT - 100 }
			}
		};
	};

	const firstPageId = crypto.randomUUID();

	let pages: Record<string, ResumePage> = $state({
		[firstPageId]: getDefaultPage(firstPageId)
	});

	let selectedElement: ResumeElement | null = $state(null);

	// Helper to get next zIndex for a page
	const getNextZIndex = (pageId: string): number => {
		const page = pages[pageId];
		const elements = Object.values(page.elements);
		if (elements.length === 0) return 0;
		return Math.max(...elements.map((el) => el.zIndex)) + 1;
	};

	// State getters
	const getPages = () => pages;

	const getSelectedElement = () => selectedElement;

	// Mutations
	const addPage = () => {
		const newPage = getDefaultPage(crypto.randomUUID());
		pages = { ...pages, [newPage.id]: newPage };
	};
	const findElement = (pageId: string, elementId: string): ResumeElement | null => {
		const page = pages[pageId];
		if (!page) return null;

		return page.elements[elementId] || null;
	};

	const addElement = ({
		type,
		x,
		y,
		pageId,
		width,
		height,
		parentElementId = null
	}: {
		type: ElementType;
		x: number;
		y: number;
		pageId: string;
		width?: number;
		height?: number;
		parentElementId?: string | null;
	}) => {
		const page = pages[pageId];
		if (!page) {
			return;
		}

		const newElement: ResumeElement = getDefaultProperties({
			type,
			x,
			y,
			pageId,
			width,
			height,
			zIndex: getNextZIndex(pageId),
			parentElementId
		});

		// Add to page elements with proper reactivity
		pages = {
			...pages,
			[pageId]: {
				...page,
				elements: { ...page.elements, [newElement.id]: newElement }
			}
		};

		// select the new element
		selectElement(newElement);
	};

	const updateElement = ({
		elementId,
		updates,
		pageId
	}: {
		elementId: string;
		updates: Partial<ResumeElement>;
		pageId: string;
	}) => {
		const page = pages[pageId];
		if (!page) return;

		const currentElement = page.elements[elementId];
		if (!currentElement) return;

		const elementType = currentElement.type;
		let updatedElement: ResumeElement;

		switch (elementType) {
			case 'text':
				updatedElement = { ...currentElement, ...updates, type: 'text' };
				break;
			case 'shape':
				updatedElement = { ...currentElement, ...updates, type: 'shape' };
				break;
			case 'image':
				updatedElement = { ...currentElement, ...updates, type: 'image' };
				break;
		}

		if (!updatedElement) {
			// this shouldn't really happen
			return;
		}

		// Update with proper reactivity
		pages = {
			...pages,
			[pageId]: {
				...page,
				elements: { ...page.elements, [elementId]: updatedElement }
			}
		};

		// Update selected reference if needed
		if (selectedElement && selectedElement.id === elementId) {
			selectedElement = updatedElement;
		}
	};

	const selectElement = (element: ResumeElement | null) => {
		selectedElement = element;
	};

	const deleteElement = (elementId: string, pageId: string) => {
		const page = pages[pageId];
		if (!page) {
			return;
		}

		const newElements = { ...page.elements };
		delete newElements[elementId];

		// Update pages with reactivity
		pages = {
			...pages,
			[pageId]: {
				...page,
				elements: newElements
			}
		};

		// Deselect the element after deletion
		if (selectedElement && selectedElement.id === elementId) {
			selectedElement = null;
		}
	};

	const deletePage = (pageId: string) => {
		delete pages[pageId];
	};

	// Move element from one parent to another
	const moveElement = ({
		pageId,
		elementId,
		newParentId,
		newX,
		newY
	}: {
		pageId: string;
		elementId: string;
		newParentId: string | null;
		newX: number;
		newY: number;
	}) => {
		const page = pages[pageId];
		if (!page) return;

		const element = page.elements[elementId];
		if (!element) return;

		// Update position and parent
		const updatedElement = {
			...element,
			x: newX,
			y: newY,
			parentElementId: newParentId
		};

		// Update with proper reactivity
		pages = {
			...pages,
			[pageId]: {
				...page,
				elements: { ...page.elements, [elementId]: updatedElement }
			}
		};
	};

	const updateBoundaries = (pageId: string, boundaries: RulerBoundaries) => {
		const page = pages[pageId];
		if (!page) {
			return;
		}

		// Update with proper reactivity
		pages = {
			...pages,
			[pageId]: {
				...page,
				boundaries
			}
		};
	};

	return {
		// State getters
		getPages,
		getSelectedElement,

		// Mutations
		addPage,
		addElement,
		updateElement,
		selectElement,
		deleteElement,
		deletePage,
		updateBoundaries,
		moveElement,
		findElement
	};
};

// Create and export the store instance
export const appStore = createAppStore();
