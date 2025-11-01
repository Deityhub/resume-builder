<script lang="ts">
	import { clickOutside } from '$lib/actions';

	type TOption = {
		label: string;
		value: number;
	};

	type TProps = {
		value: number;
		options?: TOption[];
		min?: number;
		max?: number;
		step?: number;
		placeholder?: string;
		testId?: string;
		label?: string;
		handleInput?: (value: number) => void;
	};

	const {
		value,
		options = [],
		min = 1,
		max = Infinity,
		step = 1,
		placeholder = '',
		testId = '',
		label = '',
		handleInput
	}: TProps = $props();

	let isDropdownOpen = $state(false);
	let containerElement: HTMLDivElement;
	const inputId = `number-input-${crypto.randomUUID()}`;

	function handleOnInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const newValue = parseFloat(target.value);

		if (!isNaN(newValue) && newValue >= min && newValue <= max) {
			handleInput?.(newValue);
		} else {
			target.value = value.toString();
			handleInput?.(value);
		}
	}

	function selectOption(option: TOption) {
		handleInput?.(option.value);
		isDropdownOpen = false;
	}

	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;
	}

	function handleClickOutside() {
		isDropdownOpen = false;
	}

	$effect(() => {
		if (isDropdownOpen) {
			const selectedElement = containerElement?.querySelector('[data-selected]');
			selectedElement?.scrollIntoView({ block: 'nearest' });
		}
	});
</script>

<div
	class="relative flex w-full flex-col items-start gap-1"
	bind:this={containerElement}
	use:clickOutside={{ enabled: isDropdownOpen, handler: handleClickOutside }}
>
	{#if label}
		<label for={inputId} class="text-background-foreground block text-sm">
			{label}
		</label>
	{/if}

	<input
		type="number"
		id={inputId}
		{value}
		oninput={handleOnInput}
		class="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
		{min}
		{max}
		{step}
		{placeholder}
		data-testid={testId}
		onkeydown={(e) => e.key === 'Enter' && e.preventDefault()}
		onclick={(e) => {
			// Only toggle if clicking on the input itself, not the spinner buttons
			const target = e.target as HTMLInputElement;
			const rect = target.getBoundingClientRect();
			const isSpinnerClick = e.clientX > rect.right - 40; // 40px is approximately the width of the spinner buttons

			if (!isSpinnerClick) {
				toggleDropdown();
			}
		}}
	/>

	{#if isDropdownOpen && options.length > 0}
		<div
			class="ring-opacity-5 absolute top-16 z-10 mt-1 max-h-60 w-full flex-col gap-6 overflow-auto rounded-md border border-border bg-popover py-1 text-sm shadow-lg ring-1 ring-ring focus:outline-none"
		>
			{#each options as option (option)}
				<span
					class="relative m-1 block h-auto cursor-pointer rounded-sm bg-primary/4 px-2 py-1 text-sm text-muted-foreground hover:bg-primary/10 {option.value ===
					value
						? 'bg-primary/10'
						: ''}"
					onclick={() => selectOption(option)}
					onkeydown={(e) => e.key === 'Enter' && selectOption(option)}
					role="button"
					tabindex={0}
					data-selected={value === option.value ? '' : undefined}
					data-testid={`${testId}-option-${option.value}`}
				>
					{option.label}

					{#if value === option.value}
						<span class="absolute top-1/4 right-2 flex items-center text-primary">
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
				</span>
			{/each}
		</div>
	{/if}
</div>
