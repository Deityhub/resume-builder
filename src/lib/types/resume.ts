export type ElementType = 'text' | 'shape' | 'image';
export type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se';

interface BaseElement {
	id: string;
	type: ElementType;
	pageId: string;
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

export interface ResumePage {
	id: string;
	elements: Record<string, ResumeElement>;
}
