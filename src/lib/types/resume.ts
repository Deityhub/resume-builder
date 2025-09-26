export type ElementType = 'text' | 'shape' | 'image';
export type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se';

interface BaseElement {
	id: string;
	type: ElementType;
	x: number;
	y: number;
	width: number;
	height: number;
	selected?: boolean;
	pageId: string;
}

export interface TextElement extends BaseElement {
	type: 'text';
	properties: {
		text: string;
		fontFamily: string;
		fontSize: number;
		fontWeight: string;
		fontStyle: string;
		color: string;
	};
}

export interface ShapeElement extends BaseElement {
	type: 'shape';
	properties: {
		shapeType: string;
		strokeColor: string;
		strokeWidth: number;
	};
}

export interface ImageElement extends BaseElement {
	type: 'image';
	properties: {
		src: string;
		alt: string;
	};
}

export type ResumeElement = TextElement | ShapeElement | ImageElement;

export interface ResumePage {
	id: string;
	elements: ResumeElement[];
}
