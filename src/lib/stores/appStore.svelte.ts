import { getDefaultProperties } from '$lib/utils/properties';
import type {
	ElementType,
	ResumeData,
	ResumeElement,
	ResumePage,
	RulerBoundaries
} from '../types/resume';
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

	let currentResume: ResumeData = $state({
		id: crypto.randomUUID(),
		name: '', // the user should set this value
		pages: {
			[firstPageId]: getDefaultPage(firstPageId)
		},
		createdAt: Date.now(),
		updatedAt: Date.now()
	});

	let selectedElement: ResumeElement | null = $state(null);

	// Helper to get next zIndex for a page
	const getNextZIndex = (pageId: string): number => {
		const page = getPage(pageId);
		if (!page) return 0;

		const elements = Object.values(page.elements);
		if (elements.length === 0) return 0;

		return Math.max(...elements.map((el) => el.zIndex)) + 1;
	};

	// Layering helpers
	const getZIndexRange = (pageId: string): { min: number; max: number } => {
		const page = getPage(pageId);
		if (!page) return { min: 0, max: 0 };

		const elements = Object.values(page.elements);
		if (elements.length === 0) return { min: 0, max: 0 };

		const zIndices = elements.map((el) => el.zIndex);
		return { min: Math.min(...zIndices), max: Math.max(...zIndices) };
	};

	const bringToFront = (elementId: string, pageId: string) => {
		const element = findElement(pageId, elementId);
		if (!element) return;

		const elementZIndex = element.zIndex;
		const { max } = getZIndexRange(pageId);

		if (elementZIndex === max) return;
		updateElement({ elementId, updates: { zIndex: max + 1 }, pageId });
	};

	const sendToBack = (elementId: string, pageId: string) => {
		const { min } = getZIndexRange(pageId);
		updateElement({ elementId, updates: { zIndex: Math.max(0, min - 1) }, pageId });
	};

	const bringForward = (elementId: string, pageId: string) => {
		const element = findElement(pageId, elementId);
		if (!element) return;

		const currentZ = element.zIndex;
		updateElement({ elementId, updates: { zIndex: currentZ + 1 }, pageId });
	};

	const sendBackward = (elementId: string, pageId: string) => {
		const element = findElement(pageId, elementId);
		if (!element) return;

		const currentZ = element.zIndex;
		updateElement({ elementId, updates: { zIndex: Math.max(0, currentZ - 1) }, pageId });
	};

	// State getters
	const getPages = () => currentResume.pages;

	const initNewResume = () => {
		const pageId = crypto.randomUUID();

		currentResume = {
			id: crypto.randomUUID(),
			name: '', // the user should set this value
			pages: {
				[pageId]: getDefaultPage(pageId)
			},
			createdAt: Date.now(),
			updatedAt: Date.now()
		};

		selectElement(null);
	};

	const getCurrentResume = () => currentResume;

	const getPage = (pageId: string) => currentResume.pages[pageId];

	const getSelectedElement = () => selectedElement;

	// Mutations
	const setCurrentResume = (resume: ResumeData) => {
		currentResume = { ...resume };
	};

	const updateResumePages = (pages: Record<string, ResumePage>) => {
		currentResume = { ...currentResume, pages };
	};

	const updateCurrentResume = (resume: Partial<ResumeData>) => {
		currentResume = { ...currentResume, ...resume };
	};

	const addPage = () => {
		const newPage = getDefaultPage(crypto.randomUUID());
		updateResumePages({ ...currentResume.pages, [newPage.id]: newPage });
	};

	const findElement = (pageId: string, elementId: string): ResumeElement | null => {
		const page = getPage(pageId);
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
		const page = getPage(pageId);
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
		updateResumePages({
			...currentResume.pages,
			[pageId]: {
				...page,
				elements: { ...page.elements, [newElement.id]: newElement }
			}
		});

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
		const page = getPage(pageId);
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
		updateResumePages({
			...currentResume.pages,
			[pageId]: {
				...page,
				elements: { ...page.elements, [elementId]: updatedElement }
			}
		});

		// Update selected reference if needed
		if (selectedElement && selectedElement.id === elementId) {
			selectElement(updatedElement);
		}
	};

	const selectElement = (element: ResumeElement | null) => {
		selectedElement = element;
	};

	const deleteElement = (elementId: string, pageId: string) => {
		const page = getPage(pageId);
		if (!page) {
			return;
		}

		const newElements = { ...page.elements };
		delete newElements[elementId];

		// Update pages with reactivity
		updateResumePages({
			...currentResume.pages,
			[pageId]: {
				...page,
				elements: newElements
			}
		});

		// Deselect the element after deletion
		if (selectedElement && selectedElement.id === elementId) {
			selectElement(null);
		}
	};

	const deletePage = (pageId: string) => {
		delete currentResume.pages[pageId];
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
		const page = getPage(pageId);
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
		updateResumePages({
			...currentResume.pages,
			[pageId]: {
				...page,
				elements: { ...page.elements, [elementId]: updatedElement }
			}
		});
	};

	const updateBoundaries = (pageId: string, boundaries: RulerBoundaries) => {
		const page = getPage(pageId);
		if (!page) {
			return;
		}

		// Update with proper reactivity
		updateResumePages({
			...currentResume.pages,
			[pageId]: {
				...page,
				boundaries
			}
		});
	};

	return {
		// State getters
		getPages,
		getSelectedElement,
		getCurrentResume,

		// Mutations
		setCurrentResume,
		addPage,
		addElement,
		updateElement,
		selectElement,
		deleteElement,
		deletePage,
		updateBoundaries,
		moveElement,
		findElement,
		updateCurrentResume,
		initNewResume,

		// Layering
		bringToFront,
		sendToBack,
		bringForward,
		sendBackward,
		getZIndexRange
	};
};

// Create and export the store instance
export const appStore = createAppStore();
