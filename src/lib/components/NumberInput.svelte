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
		handleInput
	}: TProps = $props();

	let isDropdownOpen = $state(false);
	let containerElement: HTMLDivElement;

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
</script>

<div
	class="relative w-full"
	bind:this={containerElement}
	use:clickOutside={{ enabled: isDropdownOpen, handler: handleClickOutside }}
>
	<input
		type="number"
		{value}
		oninput={handleOnInput}
		class="w-full rounded border border-input bg-transparent px-2 py-1 text-sm ring-1 ring-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
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
			const isSpinnerClick = e.clientX > rect.right - 20; // 20px is approximately the width of the spinner buttons

			if (!isSpinnerClick) {
				toggleDropdown();
			}
		}}
	/>

	{#if isDropdownOpen && options.length > 0}
		<div
			class="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full flex-col gap-6 overflow-auto rounded-md border border-border bg-popover py-1 text-sm shadow-lg ring-1 ring-primary focus:outline-none"
		>
			{#each options as option (option)}
				<span
					class="m-1 block h-auto cursor-pointer rounded-sm bg-primary/4 px-2 py-1 text-sm text-muted-foreground hover:bg-primary/10 {option.value ===
					value
						? 'bg-primary/10'
						: ''}"
					onclick={() => selectOption(option)}
					onkeydown={(e) => e.key === 'Enter' && selectOption(option)}
					role="button"
					tabindex={0}
				>
					{option.label}
				</span>
			{/each}
		</div>
	{/if}
</div>
