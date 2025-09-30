import { describe, it, expect, beforeEach } from 'vitest';
import { appStore } from './appStore.svelte';

describe('appStore - Ruler Boundaries', () => {
	beforeEach(() => {
		// Reset store state by getting a fresh instance
		const pages = appStore.getPages();
		Object.keys(pages).forEach((pageId) => {
			if (pageId !== 'page-1') {
				appStore.deletePage(pageId);
			}
		});
	});

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
		const pages = appStore.getPages();
		const pageId = Object.keys(pages)[0];

		appStore.updateBoundaries(pageId, {
			horizontal: { start: 200, end: 2200 },
			vertical: { start: 100, end: 3408 }
		});

		const updatedPages = appStore.getPages();
		const updatedPage = updatedPages[pageId];

		expect(updatedPage.boundaries.horizontal.start).toBe(200);
		expect(updatedPage.boundaries.horizontal.end).toBe(2200);
	});

	it('should update vertical boundaries', () => {
		const pages = appStore.getPages();
		const pageId = Object.keys(pages)[0];

		appStore.updateBoundaries(pageId, {
			horizontal: { start: 100, end: 2380 },
			vertical: { start: 150, end: 3300 }
		});

		const updatedPages = appStore.getPages();
		const updatedPage = updatedPages[pageId];

		expect(updatedPage.boundaries.vertical.start).toBe(150);
		expect(updatedPage.boundaries.vertical.end).toBe(3300);
	});

	it('should create new pages with default boundaries', () => {
		appStore.addPage();

		const pages = appStore.getPages();
		const newPage = Object.values(pages).find((p) => p.id !== 'page-1');

		expect(newPage).toBeDefined();
		expect(newPage?.boundaries.horizontal.start).toBe(100);
		expect(newPage?.boundaries.horizontal.end).toBe(2380);
		expect(newPage?.boundaries.vertical.start).toBe(100);
		expect(newPage?.boundaries.vertical.end).toBe(3408);
	});

	it('should not update boundaries for non-existent page', () => {
		const pagesBefore = appStore.getPages();

		appStore.updateBoundaries('non-existent-page', {
			horizontal: { start: 200, end: 2200 },
			vertical: { start: 150, end: 3300 }
		});

		const pagesAfter = appStore.getPages();

		// Should remain unchanged
		expect(pagesBefore).toEqual(pagesAfter);
	});
});
