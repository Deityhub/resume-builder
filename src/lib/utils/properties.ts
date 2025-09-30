import type { ElementType, ResumeElement } from '../types/resume';
import { CANVAS_WIDTH } from '../const/dimension';

export function getDefaultProperties({
	type,
	x,
	y,
	pageId,
	width = CANVAS_WIDTH - 200, // Default to canvas width minus margins
	height = 500,
}: {
	type: ElementType;
	x: number;
	y: number;
	pageId: string;
	width?: number;
	height?: number;
}): ResumeElement {
	const baseElement = {
		id: `element-${Date.now()}`,
		selected: true,
		pageId,
		x,
		y,
		width,
		height,
	};

	switch (type) {
		case 'text':
			return {
				...baseElement,
				type: 'text',
				text: 'Your text here',
				fontFamily: 'Inter',
				fontSize: 16,
				fontWeight: 'normal',
				fontStyle: 'normal',
				color: '#000000'
			};
		case 'shape':
			return {
				...baseElement,
				type: 'shape',
				shapeType: 'horizontal-line',
				strokeColor: '#000000',
				strokeWidth: 2
			};
		case 'image':
			return {
				...baseElement,
				type: 'image',
				src: '',
				alt: 'Image'
			};
	}
}
