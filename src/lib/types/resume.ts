export type ElementType = 'text' | 'shape' | 'image';
export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

interface BaseElement {
	id: string;
	type: ElementType;
	pageId: string;
	zIndex: number; // For stacking order
	elements: Record<string, ResumeElement>; // Nested child elements
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface TextElement extends BaseElement {
	type: 'text';
	text: string;
	fontFamily: string;
	fontSize: number;
	fontWeight: string;
	fontStyle: string;
	textDecoration?: string;
	textTransform?: string;
	color: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface ShapeElement extends BaseElement {
	type: 'shape';
	shapeType:
		| 'rectangle'
		| 'circle'
		| 'ellipse'
		| 'triangle'
		| 'diamond'
		| 'star'
		| 'hexagon'
		| 'pentagon'
		| 'line-horizontal'
		| 'line-vertical'
		| 'arrow-right'
		| 'arrow-left'
		| 'arrow-up'
		| 'arrow-down';
	strokeColor: string;
	strokeWidth: number;
	strokeOpacity?: number;
	strokeStyle?: 'solid' | 'dashed' | 'dotted';
	fillColor?: string;
	fillOpacity?: number;
	cornerRadius?: number; // For rectangles
	sides?: number; // For polygons
	rotation?: number;
}

export interface ImageElement extends BaseElement {
	type: 'image';
	src: string;
	alt: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

export type ResumeElement = TextElement | ShapeElement | ImageElement;

export interface RulerBoundaries {
	horizontal: {
		start: number;
		end: number;
	};
	vertical: {
		start: number;
		end: number;
	};
}

export interface ResumePage {
	id: string;
	elements: Record<string, ResumeElement>;
	boundaries: RulerBoundaries;
}
