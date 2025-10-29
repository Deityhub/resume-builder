import { writable } from 'svelte/store';

// Check localStorage or system preference
const isBrowser = typeof window !== 'undefined';
const storedTheme = isBrowser ? localStorage.getItem('theme') : null;
const prefersDark = isBrowser && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Use writable() for a store
export const theme = writable(storedTheme || (prefersDark ? 'dark' : 'light'));

// Subscribe to changes and update localStorage and HTML class
theme.subscribe((value) => {
	if (isBrowser) {
		localStorage.setItem('theme', value);
		document.documentElement.classList.toggle('dark', value === 'dark');
	}
});

// Function to toggle the theme
export function toggleTheme() {
	theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
}
