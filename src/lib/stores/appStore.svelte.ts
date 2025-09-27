import { getDefaultProperties } from '$lib/utils/properties';
import type { ElementType, ResumeElement, ResumePage } from '../types/resume';

// Create a writable store for the application state
const createAppStore = () => {
	let pages: Record<string, ResumePage> = $state({
		'page-1': {
			id: 'page-1',
			elements: {}
		}
	});

	let selectedElement: ResumeElement | null = $state(null);

	// Actions
	const getPages = () => pages;

	const getSelectedElement = () => selectedElement;

	const addPage = () => {
		const newPage: ResumePage = {
			id: `page-${Date.now()}`,
			elements: {}
		};
		pages = { ...pages, [newPage.id]: newPage };
	};

	const addElement = ({
		type,
		x,
		y,
		pageId
	}: {
		type: ElementType;
		x: number;
		y: number;
		pageId: string;
	}) => {
		const page = pages[pageId];
		if (!page) {
			return;
		}

		const newElement: ResumeElement = getDefaultProperties({
			type,
			x,
			y,
			pageId
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
		deletePage
	};
};

// Create and export the store instance
export const appStore = createAppStore();
