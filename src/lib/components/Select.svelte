<script lang="ts">
	import { clickOutside } from '$lib/actions';
	import { uuidv4 } from '$lib/utils/uuid';

	export type Option<T = string> = {
		value: T;
		label: string;
		fontFamily?: string;
		[key: string]: unknown;
	};

	type Props<T = string> = {
		value: T;
		options: Option<T>[];
		placeholder?: string;
		testId?: string;
		onChange?: (value: T) => void;
		label?: string;
	};

	const {
		value,
		options = [],
		placeholder = 'Select an option',
		testId = '',
		onChange,
		label = ''
	}: Props = $props();

	let isOpen = $state(false);
	let containerElement: HTMLDivElement | null = null;
	const inputId = `select-input-${uuidv4()}`;

	function handleSelect(option: Option) {
		onChange?.(option.value);
		isOpen = false;
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function handleClickOutside() {
		isOpen = false;
	}

	$effect(() => {
		if (isOpen) {
			const selectedElement = containerElement?.querySelector('[data-selected]');
			selectedElement?.scrollIntoView({ block: 'nearest' });
		}
	});

	const selectedOption = $derived(options.find((option) => option.value === value) || options[0]);
</script>

<div
	class="relative flex w-full flex-col items-start gap-1"
	bind:this={containerElement}
	use:clickOutside={{ enabled: isOpen, handler: handleClickOutside }}
>
	{#if label}
		<label for={inputId} class="text-background-foreground block text-sm">
			{label}
		</label>
	{/if}
	<div
		role="button"
		id={inputId}
		tabindex="0"
		class="flex h-9 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
		onclick={toggleDropdown}
		data-testid={testId}
		onkeydown={(e) => e.key === 'Enter' && toggleDropdown()}
	>
		<span class="truncate">
			{#if selectedOption}
				{selectedOption.label}
			{:else}
				<span class="text-muted-foreground">{placeholder}</span>
			{/if}
		</span>
		<svg
			class="ml-2 h-4 w-4 text-muted-foreground transition-transform"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			class:rotate-180={isOpen}
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</div>

	{#if isOpen}
		<div
			class="ring-opacity-5 absolute top-16 z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover py-1 text-sm shadow-lg ring-1 ring-ring focus:outline-none"
			role="listbox"
		>
			{#each options as option (option.value)}
				<div
					role="button"
					tabindex="0"
					class="relative m-1 flex cursor-pointer items-center rounded-sm bg-primary/4 px-3 py-2 text-sm text-muted-foreground outline-none select-none hover:bg-primary/10 {value ===
					option.value
						? 'bg-primary/10'
						: ''}"
					onclick={(e) => {
						e.stopPropagation();
						handleSelect(option);
					}}
					onkeydown={(e) => e.key === 'Enter' && handleSelect(option)}
					data-selected={value === option.value ? '' : undefined}
					data-testid={`${testId}-option-${option.value}`}
				>
					<span class="block truncate" style:font-family={option.fontFamily}>
						{option.label}
					</span>

					{#if value === option.value}
						<span class="absolute right-2 flex items-center text-primary">
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</span>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
