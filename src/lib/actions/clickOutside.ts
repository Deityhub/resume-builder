import type { ActionReturn } from 'svelte/action';

export function clickOutside(
	node: HTMLElement,
	options: {
		enabled?: boolean;
		handler: (event: CustomEvent) => void;
	}
): ActionReturn<{ enabled: boolean }> {
	const handleClick = (event: MouseEvent) => {
		if (!node.contains(event.target as Node) && !event.defaultPrevented) {
			const customEvent = new CustomEvent('clickOutside', {
				detail: { target: event.target }
			});
			options.handler(customEvent);
		}
	};

	function update({ enabled = true }) {
		if (enabled) {
			// Use setTimeout to avoid immediate trigger
			setTimeout(() => document.addEventListener('click', handleClick, true));
		} else {
			document.removeEventListener('click', handleClick, true);
		}
	}

	update({ enabled: options.enabled ?? true });

	return {
		update: (newOptions) =>
			update({
				enabled: newOptions.enabled ?? true
			}),
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}
