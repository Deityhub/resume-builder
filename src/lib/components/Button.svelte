<script lang="ts">
	import { type Snippet } from 'svelte';

	type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'text';
	type ButtonType = 'button' | 'submit' | 'reset';
	type ButtonSize = 'xxs' | 'xs' | 's' | 'l' | 'xl' | 'xxl';
	type ButtonProps = {
		variant?: ButtonVariant;
		type?: ButtonType;
		size?: ButtonSize;
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
		size = 's',
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

	const baseClasses = `inline-flex items-center justify-center font-medium rounded-lg transition-colors ${variant !== 'text' && variant !== 'ghost' ? `focus:outline-none` : ''}`;

	const variantClasses: Record<ButtonVariant, string> = {
		primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg',
		secondary: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
		destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg',
		ghost:
			'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent hover:border-gray-300',
		text: 'text-indigo-600 hover:text-indigo-800'
	};

	const getSizeStyles = (size: ButtonSize) => {
		switch (size) {
			case 'xxs':
				return 'py-1/2 px-1 text-[10px] min-h-4';
			case 'xs':
				return 'py-1 px-2 text-xs min-h-6';
			case 's':
				return 'py-2 px-4 text-sm min-h-8';
			case 'l':
				return 'py-3 px-6 text-base min-h-10';
			case 'xl':
				return 'py-4 px-8 text-lg min-h-12';
			case 'xxl':
				return 'py-5 px-10 text-xl min-h-14';
			default:
				return 'py-2 px-4 text-sm min-h-8';
		}
	};

	const getSpinnerSize = (size: ButtonSize) => {
		switch (size) {
			case 'xxs':
				return 'h-3 w-3';
			case 'xs':
				return 'h-3 w-3';
			case 's':
				return 'h-4 w-4';
			case 'l':
				return 'h-5 w-5';
			case 'xl':
				return 'h-6 w-6';
			case 'xxl':
				return 'h-7 w-7';
			default:
				return 'h-4 w-4';
		}
	};

	const sizeStyles = $derived(getSizeStyles(size));
	const spinnerSize = $derived(getSpinnerSize(size));
	const sizeClasses = `text-base ${variant === 'text' ? (noPadding ? '' : 'p-2') : noPadding ? '' : ''}`;
	const disabledClasses = 'opacity-50 cursor-not-allowed';
	const widthClass = fullWidth ? 'w-full' : '';

	const spinnerColor =
		variant === 'primary' || variant === 'destructive' ? 'text-white' : 'text-indigo-600';

	const isDisabled = $derived(disabled || pending);

	const buttonClasses = $derived(
		[
			baseClasses,
			variantClasses[variant],
			sizeClasses,
			isDisabled ? disabledClasses : 'cursor-pointer',
			widthClass,
			className,
			pending ? 'relative' : '',
			sizeStyles
		]
			.filter(Boolean)
			.join(' ')
	);

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
		data-html2canvas-ignore
		{...restProps}
	>
		{#if pending}
			<span class="inline-flex items-center">
				<svg
					class={`mr-2 -ml-1 ${spinnerSize} animate-spin ${spinnerColor}`}
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
	<button
		data-html2canvas-ignore
		{type}
		class={buttonClasses}
		disabled={isDisabled}
		onclick={handleClick}
		{...restProps}
	>
		{#if pending}
			<span class="inline-flex items-center">
				<svg
					class={`mr-2 -ml-1 ${spinnerSize} animate-spin ${spinnerColor}`}
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
