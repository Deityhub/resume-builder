import { expect, test } from '@playwright/test';

test.describe('Document Builder E2E Tests', () => {
	test('home page loads correctly', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toContainText('Create Beautiful Documents');
		await expect(page.getByRole('link', { name: 'Start Building' }).first()).toBeVisible();
	});

	test('navigate to create page', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: 'Start Building' }).first().click();
		await expect(page).toHaveURL(/.*canvas/);
	});

	test('create page has toolbar and canvas', async ({ page }) => {
		await page.goto('/canvas');

		// Check for toolbar
		await expect(page.getByTestId('toolbar')).toBeVisible();

		// Check for canvas
		await expect(page.getByTestId('document-canvas')).toBeVisible();
	});

	test('add page button works', async ({ page }) => {
		await page.goto('/canvas');

		// Initially should have 1 page
		const pageCount = page.getByTestId('page-count');
		await expect(pageCount).toContainText('1 Page');

		// Click add page
		await page.getByTestId('add-page-btn').click();

		// Should now have 2 pages
		await expect(pageCount).toContainText('2 Pages');
	});

	test('drag and drop text element', async ({ page }) => {
		await page.goto('/canvas');

		// Get the text tool
		const textTool = page.getByTestId('tool-text');

		// Get the canvas
		const canvas = page.getByTestId('document-canvas');

		// Drag text tool to canvas
		await textTool.dragTo(canvas, {
			targetPosition: { x: 200, y: 200 }
		});

		// Property panel should show text properties
		await expect(page.getByTestId('property-panel-title')).toContainText('Text Properties');
	});

	test('element selection and deselection', async ({ page }) => {
		await page.goto('/canvas');

		// Add an element
		const textTool = page.getByTestId('tool-text');
		const canvas = page.getByTestId('document-canvas');
		await textTool.dragTo(canvas, {
			targetPosition: { x: 200, y: 200 }
		});

		// Element should be selected
		await expect(page.getByTestId('property-panel-title')).toContainText('Text Properties');

		// Click on empty canvas area to deselect
		await canvas.click({ position: { x: 50, y: 50 } });

		// Should show default message
		await expect(page.getByTestId('no-selection-message')).toBeHidden();
	});

	test('resize handles appear on selected element', async ({ page }) => {
		await page.goto('/canvas');

		// Add an element
		const textTool = page.getByTestId('tool-text');
		const canvas = page.getByTestId('document-canvas');
		await textTool.dragTo(canvas, {
			targetPosition: { x: 300, y: 300 }
		});

		// Resize handles should be visible (corner and edge handles)
		const edgeResize = page.getByTestId('resize-handle-n');
		const cornerResize = page.getByTestId('resize-handle-nw');
		await expect(edgeResize).toBeVisible();
		await expect(cornerResize).toBeVisible();
	});

	test('delete element', async ({ page }) => {
		await page.goto('/canvas');

		// Add an element
		const textTool = page.getByTestId('tool-text');
		const canvas = page.getByTestId('document-canvas');
		await textTool.dragTo(canvas, {
			targetPosition: { x: 200, y: 200 }
		});

		// Click delete button
		await page.getByTestId('delete-element-btn').click();

		// Should show empty canvas message
		await expect(page.locator('text=Drag and drop elements')).toBeVisible();
	});

	test('update text element properties', async ({ page }) => {
		await page.goto('/canvas');

		// Add text element
		const textTool = page.getByTestId('tool-text');
		const canvas = page.getByTestId('document-canvas');
		await textTool.dragTo(canvas, {
			targetPosition: { x: 200, y: 200 }
		});

		// Wait for property panel to be visible
		await expect(page.getByTestId('property-panel-title')).toContainText('Text Properties');

		// Test font family change
		const fontFamilySelect = page.getByTestId('select-font-family');
		await fontFamilySelect.selectOption('Arial');
		await expect(fontFamilySelect).toHaveValue('Arial');

		// Test font size change
		const fontSizeSelect = page.getByTestId('select-font-size');
		await fontSizeSelect.selectOption('24');
		await expect(fontSizeSelect).toHaveValue('24');

		// Test font weight change
		const fontWeightSelect = page.getByTestId('select-font-weight');
		await fontWeightSelect.selectOption('400');
		await expect(fontWeightSelect).toHaveValue('400');

		// Test font style change
		const fontStyleSelect = page.getByTestId('select-font-style');
		await fontStyleSelect.selectOption('normal');
		await expect(fontStyleSelect).toHaveValue('normal');

		// Test color change
		const colorInput = page.getByTestId('input-color');
		await colorInput.fill('#ff0000');
		await expect(colorInput).toHaveValue('#ff0000');
	});

	test('update position and size properties', async ({ page }) => {
		await page.goto('/canvas');

		// Add text element
		const textTool = page.getByTestId('tool-text');
		const canvas = page.getByTestId('document-canvas');
		await textTool.dragTo(canvas, {
			targetPosition: { x: 200, y: 200 }
		});

		// Update X position
		const xInput = page.getByTestId('input-x');
		await xInput.fill('150');
		await expect(xInput).toHaveValue('150');

		// Update Y position
		const yInput = page.getByTestId('input-y');
		await yInput.fill('250');
		await expect(yInput).toHaveValue('250');

		// Update width
		const widthInput = page.getByTestId('input-width');
		await widthInput.fill('300');
		await expect(widthInput).toHaveValue('300');

		// Update height
		const heightInput = page.getByTestId('input-height');
		await heightInput.fill('100');
		await expect(heightInput).toHaveValue('100');
	});

	test('update shape element properties', async ({ page }) => {
		await page.goto('/canvas');

		// Add shape element
		const shapeTool = page.getByTestId('tool-shape');
		const canvas = page.getByTestId('document-canvas');
		await shapeTool.dragTo(canvas, {
			targetPosition: { x: 200, y: 200 }
		});

		// Wait for property panel to be visible
		await expect(page.getByTestId('property-panel-title')).toContainText('Shape Properties');

		// Test shape type change
		const shapeTypeSelect = page.getByTestId('select-shape-type');
		await shapeTypeSelect.selectOption('line-vertical');
		await expect(shapeTypeSelect).toHaveValue('line-vertical');

		// Test stroke color change
		const strokeColorInput = page.getByTestId('input-stroke-color');
		await strokeColorInput.fill('#0000ff');
		await expect(strokeColorInput).toHaveValue('#0000ff');

		// Test stroke width change
		const strokeWidthInput = page.getByTestId('input-stroke-width');
		await strokeWidthInput.fill('5');
		await expect(strokeWidthInput).toHaveValue('5');
	});

	test('update image element properties', async ({ page }) => {
		await page.goto('/canvas');

		// Add image element
		const imageTool = page.getByTestId('tool-image');
		const canvas = page.getByTestId('document-canvas');
		await imageTool.dragTo(canvas, {
			targetPosition: { x: 200, y: 200 }
		});

		// Wait for property panel to be visible
		await expect(page.getByTestId('property-panel-title')).toContainText('Image Properties');

		// Test image URL change
		const srcInput = page.getByTestId('input-image-src');
		await srcInput.fill('https://example.com/test.jpg');
		await expect(srcInput).toHaveValue('https://example.com/test.jpg');

		// Test alt text change
		const altInput = page.getByTestId('input-image-alt');
		await altInput.fill('Test image');
		await expect(altInput).toHaveValue('Test image');
	});

	test('rulers are visible', async ({ page }) => {
		await page.goto('/canvas');

		// Check for ruler elements
		const rulers = page.getByTestId(/ruler/);
		await expect(rulers.first()).toBeVisible();
	});

	test('boundary visualization is visible', async ({ page }) => {
		await page.goto('/canvas');

		// Check for boundary box (blue dashed border)
		const boundary = page.getByTestId(/boundary/);
		await expect(boundary).toBeVisible();
	});

	test('navigate to documents page', async ({ page }) => {
		await page.goto('/documents');
		await expect(page).toHaveURL(/.*documents/);
		await expect(page.locator('h1')).toContainText('Documents');
	});

	test('multiple element types can be added', async ({ page }) => {
		await page.goto('/canvas');

		const canvas = page.getByTestId('document-canvas');

		// Add text element
		const textTool = page.getByTestId('tool-text');
		await textTool.dragTo(canvas, {
			targetPosition: { x: 200, y: 200 }
		});

		// Deselect
		await canvas.click({ position: { x: 50, y: 50 } });

		// Add shape element
		const shapeTool = page.getByTestId('tool-shape');
		await shapeTool.dragTo(canvas, {
			targetPosition: { x: 200, y: 400 }
		});

		// Should show shape properties
		await expect(page.getByTestId('property-panel-title')).toContainText('Shape Properties');
	});
});
