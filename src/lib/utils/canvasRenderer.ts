import { CANVAS_HEIGHT, CANVAS_WIDTH, DISPLAY_SCALE } from '$lib/const/dimension';
import type {
	ImageElement,
	ResumeElement,
	ResumePage,
	ShapeElement,
	TextElement
} from '$lib/types/resume';
import html2canvas from 'html2canvas';
import { pixelsToPercent } from '.';

/**
 * Utility function to render a page's elements into a DOM container
 * This creates a WYSIWYG representation of the resume page for export/preview
 *
 * @param container - The DOM element to render into
 * @param page - The page data containing elements to render
 */
export function renderPageToCanvas(container: HTMLElement, page: ResumePage): void {
	// Clear existing content
	container.innerHTML = '';
	container.style.position = 'relative';
	container.style.backgroundColor = '#ffffff';

	// Recursive function to flatten nested elements by z-index
	function getAllElements(elements: Record<string, ResumeElement>): ResumeElement[] {
		const result: ResumeElement[] = [];
		for (const el of Object.values(elements)) {
			result.push(el);
			result.push(...getAllElements(el.elements));
		}
		return result;
	}

	// Get all elements sorted by z-index (bottom to top)
	const allElements = getAllElements(page.elements).sort((a, b) => a.zIndex - b.zIndex);

	// Render each element
	for (const element of allElements) {
		const elementDiv = createElementDiv(element);
		container.appendChild(elementDiv);
	}
}

/**
 * Create a DOM element representing a resume element
 */
function createElementDiv(element: ResumeElement): HTMLElement {
	const div = document.createElement('div');

	// Base positioning and sizing
	div.style.position = 'absolute';
	div.style.left = pixelsToPercent(element.x, CANVAS_WIDTH);
	div.style.top = pixelsToPercent(element.y, CANVAS_HEIGHT);
	div.style.width = pixelsToPercent(element.width, CANVAS_WIDTH);
	div.style.height = pixelsToPercent(element.height, CANVAS_HEIGHT);
	div.style.zIndex = element.zIndex.toString();

	// Apply element-specific styling based on type
	switch (element.type) {
		case 'text':
			renderTextElement(div, element);
			break;
		case 'shape':
			renderShapeElement(div, element);
			break;
		case 'image':
			renderImageElement(div, element);
			break;
	}

	return div;
}

/**
 * Render text element with exact styling
 */
function renderTextElement(div: HTMLElement, element: TextElement): void {
	div.style.fontFamily = `${element.fontFamily}, sans-serif`;
	div.style.fontSize = `${element.fontSize}px`;
	div.style.fontWeight = element.fontWeight;
	div.style.fontStyle = element.fontStyle;
	div.style.textDecoration = element.textDecoration || 'none';
	div.style.textTransform = element.textTransform || 'none';
	div.style.color = element.color;

	// Handle text content
	div.textContent = element.text;
	div.style.overflow = 'hidden';
}

/**
 * Render shape element with SVG - handles all supported shapes with exact styling
 */
function renderShapeElement(div: HTMLElement, element: ShapeElement): void {
	div.style.display = 'flex';
	div.style.alignItems = 'center';
	div.style.justifyContent = 'center';
	div.style.overflow = 'hidden';

	// Create SVG namespace element
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.style.width = '100%';
	svg.style.height = '100%';

	// Apply rotation if specified
	svg.style.transform = `rotate(${element.rotation || 0}deg)`;

	// Set viewBox to include stroke width for proper rendering
	const strokeWidth = element.strokeWidth || 1;
	const viewBoxX = -strokeWidth / 2;
	const viewBoxY = -strokeWidth / 2;
	const viewBoxWidth = element.width + strokeWidth;
	const viewBoxHeight = element.height + strokeWidth;

	svg.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);

	// Create shape based on type with exact same styling as ResumeElement.svelte
	switch (element.shapeType) {
		case 'rectangle':
			createRectangle(svg, element);
			break;
		case 'circle':
			createCircle(svg, element);
			break;
		case 'ellipse':
			createEllipse(svg, element);
			break;
		case 'triangle':
			createTriangle(svg, element);
			break;
		case 'diamond':
			createDiamond(svg, element);
			break;
		case 'hexagon':
			createHexagon(svg, element);
			break;
		case 'pentagon':
			createPentagon(svg, element);
			break;
		case 'line-horizontal':
			createHorizontalLine(svg, element);
			break;
		case 'line-vertical':
			createVerticalLine(svg, element);
			break;
		case 'arrow-right':
			createArrowRight(svg, element);
			break;
		case 'arrow-left':
			createArrowLeft(svg, element);
			break;
		case 'arrow-up':
			createArrowUp(svg, element);
			break;
		case 'arrow-down':
			createArrowDown(svg, element);
			break;
	}

	div.appendChild(svg);
}

/**
 * Create rectangle SVG element
 */
function createRectangle(svg: SVGSVGElement, element: ShapeElement): void {
	const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

	rect.setAttribute('width', element.width.toString());
	rect.setAttribute('height', element.height.toString());
	rect.setAttribute('x', '0');
	rect.setAttribute('y', '0');

	// Fill properties
	rect.setAttribute('fill', element.fillColor || 'none');
	rect.setAttribute('fill-opacity', (element.fillOpacity || 0).toString());

	// Stroke properties
	rect.setAttribute('stroke', element.strokeColor || '#000000');
	rect.setAttribute('stroke-width', (element.strokeWidth || 1).toString());
	rect.setAttribute('stroke-opacity', (element.strokeOpacity || 1).toString());

	// Stroke style
	if (element.strokeStyle === 'dashed') {
		rect.setAttribute('stroke-dasharray', '5,5');
	} else if (element.strokeStyle === 'dotted') {
		rect.setAttribute('stroke-dasharray', '2,2');
	} else {
		rect.setAttribute('stroke-dasharray', 'none');
	}

	// Corner radius for rounded rectangles
	rect.setAttribute(
		'rx',
		element.cornerRadius ? `${(element.width * element.cornerRadius) / 100}px` : '0px'
	);
	rect.setAttribute(
		'ry',
		element.cornerRadius ? `${(element.height * element.cornerRadius) / 100}px` : '0px'
	);

	svg.appendChild(rect);
}

/**
 * Create circle SVG element
 */
function createCircle(svg: SVGSVGElement, element: ShapeElement): void {
	const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

	const cx = element.width / 2;
	const cy = element.height / 2;
	const radius = Math.min(element.width, element.height) / 2 - element.strokeWidth / 2;

	circle.setAttribute('cx', cx.toString());
	circle.setAttribute('cy', cy.toString());
	circle.setAttribute('r', radius.toString());

	// Fill properties
	circle.setAttribute('fill', element.fillColor || 'none');
	circle.setAttribute('fill-opacity', (element.fillOpacity || 0).toString());

	// Stroke properties
	circle.setAttribute('stroke', element.strokeColor || '#000000');
	circle.setAttribute('stroke-width', (element.strokeWidth || 1).toString());
	circle.setAttribute('stroke-opacity', (element.strokeOpacity || 1).toString());
	circle.setAttribute(
		'stroke-dasharray',
		element.strokeStyle === 'dashed' ? '5,5' : element.strokeStyle === 'dotted' ? '2,2' : 'none'
	);

	svg.appendChild(circle);
}

/**
 * Create ellipse SVG element
 */
function createEllipse(svg: SVGSVGElement, element: ShapeElement): void {
	const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');

	ellipse.setAttribute('cx', (element.width / 2).toString());
	ellipse.setAttribute('cy', (element.height / 2).toString());
	ellipse.setAttribute('rx', (element.width / 2).toString());
	ellipse.setAttribute('ry', (element.height / 2).toString());

	// Fill properties
	ellipse.setAttribute('fill', element.fillColor || 'none');
	ellipse.setAttribute('fill-opacity', (element.fillOpacity || 0).toString());

	// Stroke properties
	ellipse.setAttribute('stroke', element.strokeColor || '#000000');
	ellipse.setAttribute('stroke-width', (element.strokeWidth || 1).toString());
	ellipse.setAttribute('stroke-opacity', (element.strokeOpacity || 1).toString());
	ellipse.setAttribute(
		'stroke-dasharray',
		element.strokeStyle === 'dashed' ? '5,5' : element.strokeStyle === 'dotted' ? '2,2' : 'none'
	);

	svg.appendChild(ellipse);
}

/**
 * Create triangle SVG element
 */
function createTriangle(svg: SVGSVGElement, element: ShapeElement): void {
	const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

	const points = `${element.width / 2},0 ${element.width},${element.height} 0,${element.height}`;
	triangle.setAttribute('points', points);

	// Fill properties
	triangle.setAttribute('fill', element.fillColor || 'none');
	triangle.setAttribute('fill-opacity', (element.fillOpacity || 0).toString());

	// Stroke properties
	triangle.setAttribute('stroke', element.strokeColor || '#000000');
	triangle.setAttribute('stroke-width', (element.strokeWidth || 1).toString());
	triangle.setAttribute('stroke-opacity', (element.strokeOpacity || 1).toString());
	triangle.setAttribute(
		'stroke-dasharray',
		element.strokeStyle === 'dashed' ? '5,5' : element.strokeStyle === 'dotted' ? '2,2' : 'none'
	);

	svg.appendChild(triangle);
}

/**
 * Create diamond SVG element
 */
function createDiamond(svg: SVGSVGElement, element: ShapeElement): void {
	const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

	const points = `${element.width / 2},0 ${element.width},${element.height / 2} ${element.width / 2},${element.height} 0,${element.height / 2}`;
	diamond.setAttribute('points', points);

	// Fill properties
	diamond.setAttribute('fill', element.fillColor || 'none');
	diamond.setAttribute('fill-opacity', (element.fillOpacity || 0).toString());

	// Stroke properties
	diamond.setAttribute('stroke', element.strokeColor || '#000000');
	diamond.setAttribute('stroke-width', (element.strokeWidth || 1).toString());
	diamond.setAttribute('stroke-opacity', (element.strokeOpacity || 1).toString());
	diamond.setAttribute(
		'stroke-dasharray',
		element.strokeStyle === 'dashed' ? '5,5' : element.strokeStyle === 'dotted' ? '2,2' : 'none'
	);

	svg.appendChild(diamond);
}

/**
 * Create hexagon SVG element
 */
function createHexagon(svg: SVGSVGElement, element: ShapeElement): void {
	const hexagon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

	const points = `${element.width / 2},0 ${element.width * 0.75},${element.height * 0.25} ${element.width * 0.75},${element.height * 0.75} ${element.width / 2},${element.height} ${element.width * 0.25},${element.height * 0.75} ${element.width * 0.25},${element.height * 0.25}`;
	hexagon.setAttribute('points', points);

	// Fill properties
	hexagon.setAttribute('fill', element.fillColor || 'none');
	hexagon.setAttribute('fill-opacity', (element.fillOpacity || 0).toString());

	// Stroke properties
	hexagon.setAttribute('stroke', element.strokeColor || '#000000');
	hexagon.setAttribute('stroke-width', (element.strokeWidth || 1).toString());
	hexagon.setAttribute('stroke-opacity', (element.strokeOpacity || 1).toString());
	hexagon.setAttribute(
		'stroke-dasharray',
		element.strokeStyle === 'dashed' ? '5,5' : element.strokeStyle === 'dotted' ? '2,2' : 'none'
	);

	svg.appendChild(hexagon);
}

/**
 * Create pentagon SVG element
 */
function createPentagon(svg: SVGSVGElement, element: ShapeElement): void {
	const pentagon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

	const points = `${element.width / 2},0 ${element.width * 0.85},${element.height * 0.3} ${element.width * 0.95},${element.height * 0.8} ${element.width * 0.5},${element.height} ${element.width * 0.05},${element.height * 0.8} ${element.width * 0.15},${element.height * 0.3}`;
	pentagon.setAttribute('points', points);

	// Fill properties
	pentagon.setAttribute('fill', element.fillColor || 'none');
	pentagon.setAttribute('fill-opacity', (element.fillOpacity || 0).toString());

	// Stroke properties
	pentagon.setAttribute('stroke', element.strokeColor || '#000000');
	pentagon.setAttribute('stroke-width', (element.strokeWidth || 1).toString());
	pentagon.setAttribute('stroke-opacity', (element.strokeOpacity || 1).toString());
	pentagon.setAttribute(
		'stroke-dasharray',
		element.strokeStyle === 'dashed' ? '5,5' : element.strokeStyle === 'dotted' ? '2,2' : 'none'
	);

	svg.appendChild(pentagon);
}

/**
 * Create horizontal line SVG element
 */
function createHorizontalLine(svg: SVGSVGElement, element: ShapeElement): void {
	const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

	line.setAttribute('x1', '0');
	line.setAttribute('y1', (element.height / 2).toString());
	line.setAttribute('x2', element.width.toString());
	line.setAttribute('y2', (element.height / 2).toString());

	line.setAttribute('stroke', element.strokeColor || '#000000');
	line.setAttribute('stroke-width', (element.strokeWidth || 1).toString());
	line.setAttribute('stroke-opacity', (element.strokeOpacity || 1).toString());
	line.setAttribute(
		'stroke-dasharray',
		element.strokeStyle === 'dashed' ? '5,5' : element.strokeStyle === 'dotted' ? '2,2' : 'none'
	);

	svg.appendChild(line);
}

/**
 * Create vertical line SVG element
 */
function createVerticalLine(svg: SVGSVGElement, element: ShapeElement): void {
	const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

	line.setAttribute('x1', (element.width / 2).toString());
	line.setAttribute('y1', '0');
	line.setAttribute('x2', (element.width / 2).toString());
	line.setAttribute('y2', element.height.toString());

	line.setAttribute('stroke', element.strokeColor || '#000000');
	line.setAttribute('stroke-width', (element.strokeWidth || 1).toString());
	line.setAttribute('stroke-opacity', (element.strokeOpacity || 1).toString());
	line.setAttribute(
		'stroke-dasharray',
		element.strokeStyle === 'dashed' ? '5,5' : element.strokeStyle === 'dotted' ? '2,2' : 'none'
	);

	svg.appendChild(line);
}

/**
 * Create right arrow SVG element
 */
function createArrowRight(svg: SVGSVGElement, element: ShapeElement): void {
	const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

	const points = `0,${element.height / 2} ${element.width * 0.7},${element.height / 2} ${element.width * 0.7},0 ${element.width},${element.height / 2} ${element.width * 0.7},${element.height} ${element.width * 0.7},${element.height / 2}`;
	arrow.setAttribute('points', points);

	// Fill properties - use strokeColor if no fillColor specified
	const fillColor = element.fillColor || element.strokeColor;
	arrow.setAttribute('fill', fillColor);
	arrow.setAttribute('fill-opacity', (element.fillOpacity || 1).toString());

	// Stroke properties
	arrow.setAttribute('stroke', element.strokeColor || '#000000');
	arrow.setAttribute('stroke-width', (element.strokeWidth || 1).toString());
	arrow.setAttribute('stroke-opacity', (element.strokeOpacity || 1).toString());

	svg.appendChild(arrow);
}

/**
 * Create left arrow SVG element
 */
function createArrowLeft(svg: SVGSVGElement, element: ShapeElement): void {
	const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

	const points = `${element.width},${element.height / 2} ${element.width * 0.3},${element.height / 2} ${element.width * 0.3},0 0,${element.height / 2} ${element.width * 0.3},${element.height} ${element.width * 0.3},${element.height / 2}`;
	arrow.setAttribute('points', points);

	// Fill properties - use strokeColor if no fillColor specified
	const fillColor = element.fillColor || element.strokeColor;
	arrow.setAttribute('fill', fillColor);
	arrow.setAttribute('fill-opacity', (element.fillOpacity || 1).toString());

	// Stroke properties
	arrow.setAttribute('stroke', element.strokeColor || '#000000');
	arrow.setAttribute('stroke-width', (element.strokeWidth || 1).toString());
	arrow.setAttribute('stroke-opacity', (element.strokeOpacity || 1).toString());

	svg.appendChild(arrow);
}

/**
 * Create up arrow SVG element
 */
function createArrowUp(svg: SVGSVGElement, element: ShapeElement): void {
	const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

	const points = `${element.width / 2},0 ${element.width / 2},${element.height * 0.7} 0,${element.height * 0.7} ${element.width / 2},${element.height} ${element.width},${element.height * 0.7} ${element.width / 2},${element.height * 0.7}`;
	arrow.setAttribute('points', points);

	// Fill properties - use strokeColor if no fillColor specified
	const fillColor = element.fillColor || element.strokeColor;
	arrow.setAttribute('fill', fillColor);
	arrow.setAttribute('fill-opacity', (element.fillOpacity || 1).toString());

	// Stroke properties
	arrow.setAttribute('stroke', element.strokeColor || '#000000');
	arrow.setAttribute('stroke-width', (element.strokeWidth || 1).toString());
	arrow.setAttribute('stroke-opacity', (element.strokeOpacity || 1).toString());

	svg.appendChild(arrow);
}

/**
 * Create down arrow SVG element
 */
function createArrowDown(svg: SVGSVGElement, element: ShapeElement): void {
	const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

	const points = `${element.width / 2},${element.height} ${element.width / 2},${element.height * 0.3} 0,${element.height * 0.3} ${element.width / 2},0 ${element.width},${element.height * 0.3} ${element.width / 2},${element.height * 0.3}`;
	arrow.setAttribute('points', points);

	// Fill properties - use strokeColor if no fillColor specified
	const fillColor = element.fillColor || element.strokeColor;
	arrow.setAttribute('fill', fillColor);
	arrow.setAttribute('fill-opacity', (element.fillOpacity || 1).toString());

	// Stroke properties
	arrow.setAttribute('stroke', element.strokeColor || '#000000');
	arrow.setAttribute('stroke-width', (element.strokeWidth || 1).toString());
	arrow.setAttribute('stroke-opacity', (element.strokeOpacity || 1).toString());

	svg.appendChild(arrow);
}

/**
 * Render image element with styling
 */
function renderImageElement(div: HTMLElement, element: ImageElement): void {
	div.style.display = 'flex';
	div.style.alignItems = 'center';
	div.style.justifyContent = 'center';
	div.style.overflow = 'hidden';

	div.style.backgroundColor = element.backgroundColor || 'transparent';
	div.style.border = `${element.borderWidth || 0}px ${element.borderStyle || 'solid'} ${element.borderColor || '#000000'}`;
	div.style.borderRadius = `${element.borderRadius || 0}%`;
	div.style.opacity = (element.opacity || 1).toString();
	div.style.boxShadow = element.boxShadow || '';

	if (element.src) {
		div.style.backgroundImage = `url(${element.src})`;
		div.style.backgroundSize = getBackgroundSize(element.objectFit);
		div.style.backgroundPosition = 'center';
		div.style.backgroundRepeat = 'no-repeat';
	}
}

/**
 * Get CSS background-size value based on object-fit property
 */
function getBackgroundSize(objectFit?: string): string {
	switch (objectFit) {
		case 'contain':
			return 'contain';
		case 'cover':
			return 'cover';
		case 'fill':
			return '100% 100%';
		case 'scale-down':
			return 'auto';
		default:
			return 'auto';
	}
}

/**
 * Utility function to create a hidden canvas for export purposes
 * This can be used for PDF generation or preview
 */
export async function createExportCanvas(page: ResumePage): Promise<HTMLCanvasElement> {
	const width = CANVAS_WIDTH * DISPLAY_SCALE;
	const height = CANVAS_HEIGHT * DISPLAY_SCALE;

	// Create a temporary container
	const container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.left = '-9999px';
	container.style.top = '-9999px';
	container.style.width = `${width}px`;
	container.style.height = `${height}px`;
	document.body.appendChild(container);

	try {
		// Render the page into the container
		renderPageToCanvas(container, page);

		// Use html2canvas to capture the rendered content
		// const { default: html2canvas } = await import('html2canvas');
		const canvas = await html2canvas(container, {
			backgroundColor: '#ffffff',
			scale: 2, // High quality for export
			useCORS: true,
			allowTaint: false,
			width: width,
			height: height,
			// Ensure clean capture without UI elements
			ignoreElements: (element) => {
				return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
			}
		});

		return canvas;
	} finally {
		// Clean up the temporary container
		document.body.removeChild(container);
	}
}

/**
 * Utility function to get image data URL from a page
 * Useful for preview generation
 */
export async function getPageImageData(page: ResumePage): Promise<string> {
	const canvas = await createExportCanvas(page);
	return canvas.toDataURL('image/png');
}
