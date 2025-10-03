import { describe, it, expect, beforeEach } from 'vitest';
import { appStore } from './appStore.svelte';

describe('appStore', () => {
	let firstPageId: string;

	beforeEach(() => {
		// Get the first page ID
		const pages = appStore.getPages();
		firstPageId = Object.keys(pages)[0];

		// Clean up any additional pages
		Object.keys(pages).forEach((pageId) => {
			if (pageId !== firstPageId) {
				appStore.deletePage(pageId);
			}
		});

		// Clear elements from first page
		const firstPage = pages[firstPageId];
		Object.keys(firstPage.elements).forEach((elementId) => {
			appStore.deleteElement(elementId, firstPageId);
		});
	});

	describe('Page Management', () => {
		it('should initialize with one page', () => {
			const pages = appStore.getPages();
			expect(Object.keys(pages).length).toBe(1);
		});

		it('should create page with UUID', () => {
			const pages = appStore.getPages();
			const firstPage = Object.values(pages)[0];

			// UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
			expect(firstPage.id).toMatch(
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
			);
		});

		it('should add new page', () => {
			appStore.addPage();
			const pages = appStore.getPages();
			expect(Object.keys(pages).length).toBe(2);
		});

		it('should delete page', () => {
			appStore.addPage();
			const pages = appStore.getPages();
			const secondPageId = Object.keys(pages).find((id) => id !== firstPageId)!;

			appStore.deletePage(secondPageId);
			const updatedPages = appStore.getPages();
			expect(Object.keys(updatedPages).length).toBe(1);
		});

		it('should create new pages with default boundaries', () => {
			appStore.addPage();
			const pages = appStore.getPages();
			const newPage = Object.values(pages).find((p) => p.id !== firstPageId);

			expect(newPage).toBeDefined();
			expect(newPage?.boundaries.horizontal.start).toBe(100);
			expect(newPage?.boundaries.horizontal.end).toBe(2380);
			expect(newPage?.boundaries.vertical.start).toBe(100);
			expect(newPage?.boundaries.vertical.end).toBe(3408);
		});
	});

	describe('Ruler Boundaries', () => {
		it('should initialize with default boundaries', () => {
			const pages = appStore.getPages();
			const firstPage = Object.values(pages)[0];

			expect(firstPage.boundaries).toBeDefined();
			expect(firstPage.boundaries.horizontal.start).toBe(100);
			expect(firstPage.boundaries.horizontal.end).toBe(2380);
			expect(firstPage.boundaries.vertical.start).toBe(100);
			expect(firstPage.boundaries.vertical.end).toBe(3408);
		});

		it('should update horizontal boundaries', () => {
			appStore.updateBoundaries(firstPageId, {
				horizontal: { start: 200, end: 2200 },
				vertical: { start: 100, end: 3408 }
			});

			const pages = appStore.getPages();
			const updatedPage = pages[firstPageId];

			expect(updatedPage.boundaries.horizontal.start).toBe(200);
			expect(updatedPage.boundaries.horizontal.end).toBe(2200);
		});

		it('should update vertical boundaries', () => {
			appStore.updateBoundaries(firstPageId, {
				horizontal: { start: 100, end: 2380 },
				vertical: { start: 150, end: 3300 }
			});

			const pages = appStore.getPages();
			const updatedPage = pages[firstPageId];

			expect(updatedPage.boundaries.vertical.start).toBe(150);
			expect(updatedPage.boundaries.vertical.end).toBe(3300);
		});

		it('should not update boundaries for non-existent page', () => {
			const pagesBefore = appStore.getPages();

			appStore.updateBoundaries('non-existent-page', {
				horizontal: { start: 200, end: 2200 },
				vertical: { start: 150, end: 3300 }
			});

			const pagesAfter = appStore.getPages();
			expect(pagesBefore).toEqual(pagesAfter);
		});
	});

	describe('Element Management', () => {
		it('should add text element', () => {
			appStore.addElement({
				type: 'text',
				x: 100,
				y: 100,
				pageId: firstPageId,
				width: 200,
				height: 50
			});

			const pages = appStore.getPages();
			const elements = Object.values(pages[firstPageId].elements);

			expect(elements.length).toBe(1);
			expect(elements[0].type).toBe('text');
			expect(elements[0].x).toBe(100);
			expect(elements[0].y).toBe(100);
		});

		it('should add shape element', () => {
			appStore.addElement({
				type: 'shape',
				x: 150,
				y: 150,
				pageId: firstPageId,
				width: 300,
				height: 2
			});

			const pages = appStore.getPages();
			const elements = Object.values(pages[firstPageId].elements);

			expect(elements.length).toBe(1);
			expect(elements[0].type).toBe('shape');
		});

		it('should add image element', () => {
			appStore.addElement({
				type: 'image',
				x: 200,
				y: 200,
				pageId: firstPageId,
				width: 150,
				height: 150
			});

			const pages = appStore.getPages();
			const elements = Object.values(pages[firstPageId].elements);

			expect(elements.length).toBe(1);
			expect(elements[0].type).toBe('image');
		});

		it('should generate UUID for elements', () => {
			appStore.addElement({
				type: 'text',
				x: 100,
				y: 100,
				pageId: firstPageId
			});

			const pages = appStore.getPages();
			const element = Object.values(pages[firstPageId].elements)[0];

			expect(element.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
		});

		it('should assign zIndex to elements', () => {
			appStore.addElement({
				type: 'text',
				x: 100,
				y: 100,
				pageId: firstPageId
			});

			appStore.addElement({
				type: 'shape',
				x: 150,
				y: 150,
				pageId: firstPageId
			});

			const pages = appStore.getPages();
			const elements = Object.values(pages[firstPageId].elements);

			expect(elements[0].zIndex).toBe(0);
			expect(elements[1].zIndex).toBe(1);
		});

		it('should update element properties', () => {
			appStore.addElement({
				type: 'text',
				x: 100,
				y: 100,
				pageId: firstPageId
			});

			const pages = appStore.getPages();
			const elementId = Object.keys(pages[firstPageId].elements)[0];

			appStore.updateElement({
				elementId,
				updates: { x: 200, y: 250 },
				pageId: firstPageId
			});

			const updatedPages = appStore.getPages();
			const updatedElement = updatedPages[firstPageId].elements[elementId];

			expect(updatedElement.x).toBe(200);
			expect(updatedElement.y).toBe(250);
		});

		it('should delete element', () => {
			appStore.addElement({
				type: 'text',
				x: 100,
				y: 100,
				pageId: firstPageId
			});

			const pages = appStore.getPages();
			const elementId = Object.keys(pages[firstPageId].elements)[0];

			appStore.deleteElement(elementId, firstPageId);

			const updatedPages = appStore.getPages();
			expect(Object.keys(updatedPages[firstPageId].elements).length).toBe(0);
		});
	});

	describe('Element Selection', () => {
		it('should select element', () => {
			appStore.addElement({
				type: 'text',
				x: 100,
				y: 100,
				pageId: firstPageId
			});

			const selectedElement = appStore.getSelectedElement();
			expect(selectedElement).not.toBeNull();
			expect(selectedElement?.type).toBe('text');
		});

		it('should deselect element', () => {
			appStore.addElement({
				type: 'text',
				x: 100,
				y: 100,
				pageId: firstPageId
			});

			appStore.selectElement(null);
			const selectedElement = appStore.getSelectedElement();
			expect(selectedElement).toBeNull();
		});
	});

	describe('Nested Elements', () => {
		it('should add element with parent', () => {
			// Add parent element
			appStore.addElement({
				type: 'text',
				x: 100,
				y: 100,
				pageId: firstPageId,
				width: 400,
				height: 300
			});

			let pages = appStore.getPages();
			const parentId = Object.keys(pages[firstPageId].elements)[0];

			// Add child element
			appStore.addElement({
				type: 'shape',
				x: 150,
				y: 150,
				pageId: firstPageId,
				width: 200,
				height: 2,
				parentElementId: parentId
			});

			pages = appStore.getPages();
			const parent = pages[firstPageId].elements[parentId];
			expect(Object.keys(parent.elements).length).toBe(1);
		});

		it('should find nested element', () => {
			// Add parent
			appStore.addElement({
				type: 'text',
				x: 100,
				y: 100,
				pageId: firstPageId
			});

			let pages = appStore.getPages();
			const parentId = Object.keys(pages[firstPageId].elements)[0];

			// Add child
			appStore.addElement({
				type: 'shape',
				x: 150,
				y: 150,
				pageId: firstPageId,
				parentElementId: parentId
			});

			pages = appStore.getPages();
			const parent = pages[firstPageId].elements[parentId];
			const childId = Object.keys(parent.elements)[0];

			const foundElement = appStore.findElement(firstPageId, childId);
			expect(foundElement).not.toBeNull();
			expect(foundElement?.type).toBe('shape');
		});

		it('should move element between parents', () => {
			// Add two parent elements
			appStore.addElement({
				type: 'text',
				x: 100,
				y: 100,
				pageId: firstPageId
			});

			appStore.addElement({
				type: 'text',
				x: 500,
				y: 500,
				pageId: firstPageId
			});

			let pages = appStore.getPages();
			const elementIds = Object.keys(pages[firstPageId].elements);
			const parent1Id = elementIds[0];
			const parent2Id = elementIds[1];

			// Add child to parent1
			appStore.addElement({
				type: 'shape',
				x: 150,
				y: 150,
				pageId: firstPageId,
				parentElementId: parent1Id
			});

			pages = appStore.getPages();
			const parent1 = pages[firstPageId].elements[parent1Id];
			const childId = Object.keys(parent1.elements)[0];

			// Move child to parent2
			appStore.moveElement({
				pageId: firstPageId,
				elementId: childId,
				newParentId: parent2Id,
				newX: 550,
				newY: 550
			});

			pages = appStore.getPages();
			const updatedParent1 = pages[firstPageId].elements[parent1Id];
			const updatedParent2 = pages[firstPageId].elements[parent2Id];

			expect(Object.keys(updatedParent1.elements).length).toBe(0);
			expect(Object.keys(updatedParent2.elements).length).toBe(1);
		});
	});
});
