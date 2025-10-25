/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
	darkMode: 'class', // Enable class-based dark mode
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./src/routes/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
	],
	theme: {
		extend: {
			colors: {
				// Primary color palette
				primary: {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9',
					600: '#0284c7',
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e',
					950: '#082f49'
				},
				// Secondary color palette
				secondary: {
					50: '#f5f3ff',
					100: '#ede9fe',
					200: '#ddd6fe',
					300: '#c4b5fd',
					400: '#a78bfa',
					500: '#8b5cf6',
					600: '#7c3aed',
					700: '#6d28d9',
					800: '#5b21b6',
					900: '#4c1d95',
					950: '#2e1065'
				},
				// Neutral colors with dark mode variants
				neutral: {
					50: '#f9fafb',
					100: '#f3f4f6',
					200: '#e5e7eb',
					300: '#d1d5db',
					400: '#9ca3af',
					500: '#6b7280',
					600: '#4b5563',
					700: '#374151',
					800: '#1f2937',
					900: '#111827',
					950: '#030712'
				},
				// Success, Warning, Error colors
				success: colors.emerald,
				warning: colors.amber,
				error: colors.rose
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				display: ['Inter', 'sans-serif']
			},
			boxShadow: {
				soft: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
				'soft-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.15)'
			},
			transitionProperty: {
				width: 'width',
				spacing: 'margin, padding'
			}
		}
	},
	plugins: [import('@tailwindcss/typography'), import('@tailwindcss/forms')]
};
