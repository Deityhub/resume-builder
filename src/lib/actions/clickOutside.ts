import type { Action } from 'svelte/action';

type ClickOutsideOptions = {
	enabled?: boolean;
	handler: (event: MouseEvent | TouchEvent) => void;
};

export const clickOutside: Action<HTMLElement, ClickOutsideOptions> = (node, options) => {
	const { enabled = true, handler } = options;

	function handleClick(event: MouseEvent | TouchEvent) {
		if (!node.contains(event.target as Node)) {
			handler(event);
		}
	}

	function update({ enabled, handler }: ClickOutsideOptions) {
		document.removeEventListener('mousedown', handleClick, true);
		document.removeEventListener('click', handleClick, true);
		document.removeEventListener('touchstart', handleClick, true);

		if (enabled) {
			document.addEventListener('mousedown', handleClick, true);
			document.addEventListener('click', handleClick, true);
			document.addEventListener('touchstart', handleClick, true);
		}

		return { enabled, handler };
	}

	update({ enabled, handler });

	return {
		update,
		destroy() {
			document.removeEventListener('mousedown', handleClick, true);
			document.removeEventListener('click', handleClick, true);
			document.removeEventListener('touchstart', handleClick, true);
		}
	};
};
