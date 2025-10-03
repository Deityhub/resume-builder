export const fontFamilies = [
	'Inter',
	'Arial',
	'Helvetica',
	'Times New Roman',
	'Georgia',
	'Verdana',
	'Courier New',
	'Roboto',
	'Open Sans',
	'Montserrat',
	'Poppins',
	'Raleway',
	'Merriweather',
	'Playfair Display',
	'Source Sans Pro',
	'Nunito',
	'Lato',
	'Roboto Condensed',
	'Oswald',
	'PT Sans',
	'Roboto Slab'
] as const;

export const fontSizes = [
	8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 44, 48, 52, 56, 60,
	64, 72, 80, 88, 96
] as const;

export const fontWeights = [
	{ value: '100', label: 'Thin (100)' },
	{ value: '200', label: 'Extra Light (200)' },
	{ value: '300', label: 'Light (300)' },
	{ value: '400', label: 'Regular (400)' },
	{ value: '500', label: 'Medium (500)' },
	{ value: '600', label: 'Semi Bold (600)' },
	{ value: '700', label: 'Bold (700)' },
	{ value: '800', label: 'Extra Bold (800)' },
	{ value: '900', label: 'Black (900)' }
] as const;

export const fontStyles = [
	{ value: 'normal', label: 'Normal' },
	{ value: 'italic', label: 'Italic' },
	{ value: 'oblique', label: 'Oblique' }
] as const;

export const textDecorations = [
	{ value: 'none', label: 'None' },
	{ value: 'underline', label: 'Underline' },
	{ value: 'overline', label: 'Overline' },
	{ value: 'line-through', label: 'Line Through' }
] as const;

export const textTransforms = [
	{ value: 'none', label: 'None' },
	{ value: 'uppercase', label: 'Uppercase' },
	{ value: 'lowercase', label: 'Lowercase' },
	{ value: 'capitalize', label: 'Capitalize' },
	{ value: 'full-width', label: 'Full Width' }
] as const;
