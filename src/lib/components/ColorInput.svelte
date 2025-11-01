<script lang="ts">
	export type ColorInputProps = {
		value: string;
		onChange: (value: string) => void;
		label?: string;
		testId?: string;
		class?: string;
	};

	const {
		value = '#000000',
		onChange,
		label = '',
		testId = 'color-input',
		class: _ = ''
	}: ColorInputProps = $props();

	const inputId = `color-input-${crypto.randomUUID()}`;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		onChange(target.value);
	}
</script>

<div class="relative flex w-full flex-col items-start gap-1">
	{#if label}
		<label for={inputId} class="text-background-foreground block text-sm">
			{label}
		</label>
	{/if}
	<div class="relative flex w-full items-center">
		<input
			id={inputId}
			type="color"
			{value}
			oninput={handleInput}
			class="h-8 w-full cursor-pointer appearance-none rounded border border-input bg-transparent p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border [&::-webkit-color-swatch]:border-input [&::-webkit-color-swatch-wrapper]:p-0"
			data-testid={testId}
			aria-label={`${label} color picker`}
		/>
	</div>
</div>
