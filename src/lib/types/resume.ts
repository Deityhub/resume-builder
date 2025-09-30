export type ElementType = 'text' | 'shape' | 'image';
export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

interface BaseElement {
	id: string;
	type: ElementType;
	pageId: string;
	zIndex: number; // For stacking order
	elements: Record<string, ResumeElement>; // Nested child elements
}

export interface TextElement extends BaseElement {
	type: 'text';
	text: string;
	fontFamily: string;
	fontSize: number;
	fontWeight: string;
	fontStyle: string;
	color: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface ShapeElement extends BaseElement {
	type: 'shape';
	shapeType: string;
	strokeColor: string;
	strokeWidth: number;
	x: number;
	y: number;
	width: number;
	height: number;
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
