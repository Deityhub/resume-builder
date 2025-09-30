<script lang="ts">
	import { type Snippet } from 'svelte';

	type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'text';
	type ButtonType = 'button' | 'submit' | 'reset';
	type ButtonProps = {
		variant?: ButtonVariant;
		type?: ButtonType;
		href?: string | undefined;
		disabled?: boolean;
		pending?: boolean;
		className?: string;
		fullWidth?: boolean;
		noPadding?: boolean;
		onClick?: (event: MouseEvent) => void;
		children: Snippet;
		'data-testid'?: string;
	};

	const {
		variant = 'primary',
		type = 'button',
		href,
		disabled = false,
		pending = false,
		className = '',
		fullWidth = false,
		noPadding = false,
		onClick,
		children,
		...restProps
	}: ButtonProps = $props();

	const focusRingClass = variant === 'destructive' ? 'focus:ring-red-500' : 'focus:ring-indigo-500';
	const baseClasses = `cursor-pointer inline-flex items-center justify-center font-medium rounded-lg transition-colors ${variant !== 'text' && variant !== 'ghost' ? `focus:outline-none focus:ring-2 focus:ring-offset-2 ${focusRingClass}` : ''}`;

	const variantClasses: Record<ButtonVariant, string> = {
		primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg',
		secondary: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
		destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg',
		ghost:
			'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent hover:border-gray-300',
		text: 'text-indigo-600 hover:text-indigo-800'
	};

	const sizeClasses = `text-base ${variant === 'text' ? (noPadding ? '' : 'p-2') : noPadding ? '' : 'px-6 py-2'}`;
	const disabledClasses = 'opacity-50 cursor-not-allowed';
	const widthClass = fullWidth ? 'w-full' : '';

	const spinnerColor =
		variant === 'primary' || variant === 'destructive' ? 'text-white' : 'text-indigo-600';

	const buttonClasses = $state(
		[
			baseClasses,
			variantClasses[variant],
			sizeClasses,
			disabled || pending ? disabledClasses : '',
			widthClass,
			className,
			pending ? 'relative' : ''
		]
			.filter(Boolean)
			.join(' ')
	);

	const isDisabled = $derived(disabled || pending);

	function handleClick(event: MouseEvent) {
		if (isDisabled) {
			// Block interactions when disabled
			event.preventDefault();
			// Prevent any other listeners on this node from firing
			event.stopImmediatePropagation();
			// Also stop bubbling just in case
			event.stopPropagation();
			return false;
		}

		onClick?.(event);
	}
</script>

{#if href}
	<a
		{href}
		class={buttonClasses}
		aria-disabled={isDisabled}
		tabindex={isDisabled ? -1 : undefined}
		onclick={handleClick}
		{...restProps}
	>
		{#if pending}
			<span class="inline-flex items-center">
				<svg
					class={`mr-2 -ml-1 h-4 w-4 animate-spin ${spinnerColor}`}
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				{@render children?.()}
			</span>
		{:else}
			{@render children?.()}
		{/if}
	</a>
{:else}
	<button {type} class={buttonClasses} disabled={isDisabled} onclick={handleClick} {...restProps}>
		{#if pending}
			<span class="inline-flex items-center">
				<svg
					class={`mr-2 -ml-1 h-4 w-4 animate-spin ${spinnerColor}`}
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				{@render children?.()}
			</span>
		{:else}
			{@render children?.()}
		{/if}
	</button>
{/if}
