import { getDefaultProperties } from '$lib/utils/properties';
import type { ElementType, ResumeElement, ResumePage, RulerBoundaries } from '../types/resume';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../const/dimension';

// Create a writable store for the application state
const createAppStore = () => {
	let pages: Record<string, ResumePage> = $state({
		'page-1': {
			id: 'page-1',
			elements: {},
			boundaries: {
				horizontal: { start: 100, end: CANVAS_WIDTH - 100 },
				vertical: { start: 100, end: CANVAS_HEIGHT - 100 }
			}
		}
	});

	let selectedElement: ResumeElement | null = $state(null);

	// Actions
	const getPages = () => pages;

	const getSelectedElement = () => selectedElement;

	const addPage = () => {
		const newPage: ResumePage = {
			id: `page-${Date.now()}`,
			elements: {},
			boundaries: {
				horizontal: { start: 100, end: CANVAS_WIDTH - 100 },
				vertical: { start: 100, end: CANVAS_HEIGHT - 100 }
			}
		};
		pages = { ...pages, [newPage.id]: newPage };
	};

	const addElement = ({
		type,
		x,
		y,
		pageId,
		width,
		height
	}: {
		type: ElementType;
		x: number;
		y: number;
		pageId: string;
		width?: number;
		height?: number;
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
			height
		});

		page.elements = { ...page.elements, [newElement.id]: newElement };

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
		updateBoundaries
	};
};

// Create and export the store instance
export const appStore = createAppStore();
