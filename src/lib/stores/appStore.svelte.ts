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

	// Helper to update nested elements recursively
	const updateNestedElements = (
		elements: Record<string, ResumeElement>,
		targetId: string,
		updateFn: (element: ResumeElement) => ResumeElement
	): Record<string, ResumeElement> => {
		const result: Record<string, ResumeElement> = {};

		for (const [id, element] of Object.entries(elements)) {
			if (id === targetId) {
				result[id] = updateFn(element);
			} else {
				result[id] = {
					...element,
					elements: updateNestedElements(element.elements, targetId, updateFn)
				};
			}
		}

		return result;
	};

	// Helper to create elements structure without a specific element
	const createElementsWithout = (
		elements: Record<string, ResumeElement>,
		elementId: string
	): Record<string, ResumeElement> => {
		const result: Record<string, ResumeElement> = {};

		for (const [id, element] of Object.entries(elements)) {
			if (id !== elementId) {
				result[id] = {
					...element,
					elements: createElementsWithout(element.elements, elementId)
				};
			}
		}

		return result;
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
				// Update the entire pages object with proper reactivity
				pages = {
					...pages,
					[pageId]: {
						...page,
						elements: updateNestedElements(
							page.elements,
							parentElementId,
							(parent: ResumeElement) => ({
								...parent,
								elements: { ...parent.elements, [newElement.id]: newElement }
							})
						)
					}
				};
			} else {
				// Parent not found, add to page root with proper reactivity
				pages = {
					...pages,
					[pageId]: {
						...page,
						elements: { ...page.elements, [newElement.id]: newElement }
					}
				};
			}
		} else {
			// Add to page root with proper reactivity
			pages = {
				...pages,
				[pageId]: {
					...page,
					elements: { ...page.elements, [newElement.id]: newElement }
				}
			};
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
				} as ResumeElement;
				break;
			case 'shape':
				updatedElement = {
					...currentElement,
					...updates,
					type: 'shape'
				} as ResumeElement;
				break;
			case 'image':
				updatedElement = {
					...currentElement,
					...updates,
					type: 'image'
				} as ResumeElement;
				break;
		}

		// Update the page elements (this triggers reactivity)
		pages = {
			...pages,
			[pageId]: {
				...page,
				elements: {
					...page.elements,
					[elementId]: updatedElement
				}
			}
		};

		// If this is the currently selected element, update the selectedElement reference
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

		// Create new elements object without the deleted element
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

		// Create new elements structure without the moved element
		const newElements = createElementsWithout(page.elements, elementId);

		// Add to new parent
		if (newParentId) {
			const newParent = findElement(pageId, newParentId);
			if (newParent) {
				// Update the entire pages object with proper reactivity
				pages = {
					...pages,
					[pageId]: {
						...page,
						elements: updateNestedElements(newElements, newParentId, (parent: ResumeElement) => ({
							...parent,
							elements: { ...parent.elements, [element.id]: element }
						}))
					}
				};
			} else {
				// Parent not found, add to page root
				pages = {
					...pages,
					[pageId]: {
						...page,
						elements: { ...newElements, [element.id]: element }
					}
				};
			}
		} else {
			// Add back to page root
			pages = {
				...pages,
				[pageId]: {
					...page,
					elements: { ...newElements, [element.id]: element }
				}
			};
		}
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
