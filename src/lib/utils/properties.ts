import type { ElementType, ResumeElement } from '../types/resume';

export function getDefaultProperties({
	type,
	x,
	y,
	pageId
}: {
	type: ElementType;
	x: number;
	y: number;
	pageId: string;
}): ResumeElement {
	const baseElement = {
		id: `element-${Date.now()}`,
		selected: true,
		pageId,
		x,
		y,
		width: 2320,
		height: 500
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
