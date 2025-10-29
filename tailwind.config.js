/** @type {import('tailwindcss').Config} */

export default {
	darkMode: 'class', // Enable class-based dark mode
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./src/routes/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
	],
	plugins: [import('tailwindcss-animate')]
};
