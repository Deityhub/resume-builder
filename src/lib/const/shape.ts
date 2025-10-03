export const shapeTypes = [
	{ value: 'rectangle', label: 'Rectangle' },
	{ value: 'circle', label: 'Circle' },
	{ value: 'ellipse', label: 'Ellipse' },
	{ value: 'triangle', label: 'Triangle' },
	{ value: 'diamond', label: 'Diamond' },
	{ value: 'hexagon', label: 'Hexagon' },
	{ value: 'pentagon', label: 'Pentagon' },
	{ value: 'line-horizontal', label: 'Horizontal Line' },
	{ value: 'line-vertical', label: 'Vertical Line' },
	{ value: 'arrow-right', label: 'Arrow Right' },
	{ value: 'arrow-left', label: 'Arrow Left' },
	{ value: 'arrow-up', label: 'Arrow Up' },
	{ value: 'arrow-down', label: 'Arrow Down' }
] as const;

export const strokeStyles = [
	{ value: 'solid', label: 'Solid' },
	{ value: 'dashed', label: 'Dashed' },
	{ value: 'dotted', label: 'Dotted' }
] as const;
