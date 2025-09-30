import { getDefaultProperties } from '$lib/utils/properties';
import type { ElementType, ResumeElement, ResumePage, RulerBoundaries } from '../types/resume';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../const/dimension';

// Create a writable store for the application state
const createAppStore = () => {
	const firstPageId = crypto.randomUUID();
	let pages: Record<string, ResumePage> = $state({
		[firstPageId]: {
			id: firstPageId,
			elements: {},
			boundaries: {
				horizontal: { start: 100, end: CANVAS_WIDTH - 100 },
				vertical: { start: 100, end: CANVAS_HEIGHT - 100 }
			}
		}
	});

	let selectedElement: ResumeElement | null = $state(null);

	// Helper to get next zIndex for a page
	const getNextZIndex = (pageId: string): number => {
		const page = pages[pageId];
		if (!page) return 0;
		const elements = Object.values(page.elements);
		if (elements.length === 0) return 0;
		return Math.max(...elements.map((el) => el.zIndex)) + 1;
	};

	// State getters
	const getPages = () => pages;

	const getSelectedElement = () => selectedElement;

	// Mutations
	const addPage = () => {
		const newPage: ResumePage = {
			id: crypto.randomUUID(),
			elements: {},
			boundaries: {
				horizontal: { start: 100, end: CANVAS_WIDTH - 100 },
				vertical: { start: 100, end: CANVAS_HEIGHT - 100 }
			}
		};
		pages = { ...pages, [newPage.id]: newPage };
	};

	// Helper to find an element by ID (searches recursively through nested elements)
	const findElement = (pageId: string, elementId: string): ResumeElement | null => {
		const page = pages[pageId];
		if (!page) return null;

		const searchInElements = (elements: Record<string, ResumeElement>): ResumeElement | null => {
			for (const el of Object.values(elements)) {
				if (el.id === elementId) return el;
				const found = searchInElements(el.elements);
				if (found) return found;
			}
			return null;
		};

		return searchInElements(page.elements);
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
			zIndex: getNextZIndex(pageId)
		});

		// Add to parent element or page root
		if (parentElementId) {
			const parentElement = findElement(pageId, parentElementId);
			if (parentElement) {
				parentElement.elements = { ...parentElement.elements, [newElement.id]: newElement };
			} else {
				// Parent not found, add to page root
				page.elements = { ...page.elements, [newElement.id]: newElement };
			}
		} else {
			page.elements = { ...page.elements, [newElement.id]: newElement };
		}

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
		if (!page) {
			return;
		}

		const currentElement = page.elements[elementId];
		if (!currentElement) {
			// we shouldn't get to this point, since you can't update element not in the view
			return;
		}

		const elementType = currentElement.type;
		let updatedElement: ResumeElement;

		switch (elementType) {
			case 'text':
				updatedElement = {
					...currentElement,
					...updates,
					type: 'text'
				};
				break;
			case 'shape':
				updatedElement = {
					...currentElement,
					...updates,
					type: 'shape'
				};
				break;
			case 'image':
				updatedElement = {
					...currentElement,
					...updates,
					type: 'image'
				};
				break;
		}

		page.elements[elementId] = updatedElement;
	};

	const selectElement = (element: ResumeElement | null) => {
		selectedElement = element;
	};

	const deleteElement = (elementId: string, pageId: string) => {
		const page = pages[pageId];
		if (!page) {
			return;
		}

		delete page.elements[elementId];

		// Deselect the element after deletion
		selectElement(null);
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

		// Find and remove element from current location
		const removeFromElements = (elements: Record<string, ResumeElement>): ResumeElement | null => {
			if (elements[elementId]) {
				const element = elements[elementId];
				delete elements[elementId];
				return element;
			}
			for (const el of Object.values(elements)) {
				const found = removeFromElements(el.elements);
				if (found) return found;
			}
			return null;
		};

		const element = removeFromElements(page.elements);
		if (!element) return;

		// Update position
		element.x = newX;
		element.y = newY;

		// Add to new parent
		if (newParentId) {
			const newParent = findElement(pageId, newParentId);
			if (newParent) {
				newParent.elements = { ...newParent.elements, [element.id]: element };
			} else {
				// Parent not found, add to page root
				page.elements = { ...page.elements, [element.id]: element };
			}
		} else {
			page.elements = { ...page.elements, [element.id]: element };
		}
	};

	const updateBoundaries = (pageId: string, boundaries: RulerBoundaries) => {
		const page = pages[pageId];
		if (!page) {
			return;
		}

		page.boundaries = boundaries;
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
