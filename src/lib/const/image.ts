export const objectFitOptions = [
	{ value: 'contain', label: 'Contain' },
	{ value: 'cover', label: 'Cover' },
	{ value: 'fill', label: 'Fill' },
	{ value: 'none', label: 'None' },
	{ value: 'scale-down', label: 'Scale Down' }
] as const;

export const borderStyles = [
	{ value: 'solid', label: 'Solid' },
	{ value: 'dashed', label: 'Dashed' },
	{ value: 'dotted', label: 'Dotted' }
] as const;

export const filterDefaults = {
	brightness: 100,
	contrast: 100,
	saturate: 100,
	hueRotate: 0,
	sepia: 0,
	grayscale: 0,
	blur: 0
} as const;
