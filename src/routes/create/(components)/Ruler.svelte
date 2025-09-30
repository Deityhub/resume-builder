<script lang="ts">
	interface RulerProps {
		orientation: 'horizontal' | 'vertical';
		size: number;
		displaySize: number;
		startAnchor: number;
		endAnchor: number;
		onAnchorChange: (start: number, end: number) => void;
	}

	const { orientation, size, displaySize, startAnchor, endAnchor, onAnchorChange }: RulerProps =
		$props();

	let isDraggingStart = $state(false);
	let isDraggingEnd = $state(false);
	let rulerRef: HTMLDivElement;

	const RULER_SIZE = 30; // pixels
	const MAJOR_TICK_INTERVAL = 100; // Major tick every 100px
	const MINOR_TICK_INTERVAL = 50; // Minor tick every 50px
	const TINY_TICK_INTERVAL = 10; // Tiny tick every 10px

	// Generate tick marks with different sizes
	const majorTicks = $derived(
		Array.from(
			{ length: Math.floor(size / MAJOR_TICK_INTERVAL) + 1 },
			(_, i) => i * MAJOR_TICK_INTERVAL
		)
	);

	const minorTicks = $derived(
		Array.from(
			{ length: Math.floor(size / MINOR_TICK_INTERVAL) + 1 },
			(_, i) => i * MINOR_TICK_INTERVAL
		).filter((tick) => tick % MAJOR_TICK_INTERVAL !== 0)
	);

	const tinyTicks = $derived(
		Array.from(
			{ length: Math.floor(size / TINY_TICK_INTERVAL) + 1 },
			(_, i) => i * TINY_TICK_INTERVAL
		).filter((tick) => tick % MINOR_TICK_INTERVAL !== 0)
	);

	function handleStartAnchorMouseDown(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDraggingStart = true;
	}

	function handleEndAnchorMouseDown(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDraggingEnd = true;
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDraggingStart && !isDraggingEnd) return;

		const rect = rulerRef.getBoundingClientRect();
		let position: number;

		if (orientation === 'horizontal') {
			const relativePos = event.clientX - rect.left;
			const scale = size / displaySize;
			position = relativePos * scale;
		} else {
			const relativePos = event.clientY - rect.top;
			const scale = size / displaySize;
			position = relativePos * scale;
		}

		// Clamp position to ruler bounds
		position = Math.max(0, Math.min(size, position));

		if (isDraggingStart) {
			// Ensure start anchor doesn't go past end anchor
			const newStart = Math.min(position, endAnchor - 50);
			onAnchorChange(newStart, endAnchor);
		} else if (isDraggingEnd) {
			// Ensure end anchor doesn't go before start anchor
			const newEnd = Math.max(position, startAnchor + 50);
			onAnchorChange(startAnchor, newEnd);
		}
	}

	function handleMouseUp() {
		isDraggingStart = false;
		isDraggingEnd = false;
	}

	$effect(() => {
		if (isDraggingStart || isDraggingEnd) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);

			return () => {
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};
		}
	});

	// Calculate percentage positions for anchors
	const startPercent = $derived((startAnchor / size) * 100);
	const endPercent = $derived((endAnchor / size) * 100);
</script>

<div
	bind:this={rulerRef}
	class="relative border-gray-300 bg-gray-100 select-none"
	class:h-full={orientation === 'vertical'}
	class:w-full={orientation === 'horizontal'}
	class:border-r={orientation === 'vertical'}
	class:border-b={orientation === 'horizontal'}
	style:width={orientation === 'vertical' ? `${RULER_SIZE}px` : `${displaySize}px`}
	style:height={orientation === 'horizontal' ? `${RULER_SIZE}px` : `${displaySize}px`}
>
	<!-- Major tick marks (tallest) -->
	{#each majorTicks as tick (tick)}
		{#if orientation === 'horizontal'}
			<div
				class="absolute bottom-0 w-[1px] bg-gray-500"
				style:left="{(tick / size) * 100}%"
				style:height="12px"
			></div>
		{:else}
			<div
				class="absolute right-0 h-[1px] bg-gray-500"
				style:top="{(tick / size) * 100}%"
				style:width="12px"
			></div>
		{/if}
	{/each}

	<!-- Minor tick marks (medium) -->
	{#each minorTicks as tick (tick)}
		{#if orientation === 'horizontal'}
			<div
				class="absolute bottom-0 w-[1px] bg-gray-400"
				style:left="{(tick / size) * 100}%"
				style:height="8px"
			></div>
		{:else}
			<div
				class="absolute right-0 h-[1px] bg-gray-400"
				style:top="{(tick / size) * 100}%"
				style:width="8px"
			></div>
		{/if}
	{/each}

	<!-- Tiny tick marks (shortest) -->
	{#each tinyTicks as tick (tick)}
		{#if orientation === 'horizontal'}
			<div
				class="absolute bottom-0 w-[1px] bg-gray-300"
				style:left="{(tick / size) * 100}%"
				style:height="4px"
			></div>
		{:else}
			<div
				class="absolute right-0 h-[1px] bg-gray-300"
				style:top="{(tick / size) * 100}%"
				style:width="4px"
			></div>
		{/if}
	{/each}

	<!-- Boundary region highlight -->
	{#if orientation === 'horizontal'}
		<div
			class="absolute top-0 h-full bg-blue-100 opacity-30"
			style:left="{startPercent}%"
			style:width="{endPercent - startPercent}%"
		></div>
	{:else}
		<div
			class="absolute left-0 w-full bg-blue-100 opacity-30"
			style:top="{startPercent}%"
			style:height="{endPercent - startPercent}%"
		></div>
	{/if}

	<!-- Start anchor (triangle marker) -->
	{#if orientation === 'horizontal'}
		<div
			role="button"
			tabindex="0"
			onkeydown={null}
			class="absolute z-10 cursor-grab active:cursor-grabbing"
			style:left="calc({startPercent}% - 6px)"
			style:top="0"
			onmousedown={handleStartAnchorMouseDown}
		>
			<svg width="12" height="12" viewBox="0 0 12 12" class="hover:opacity-80">
				<path d="M 0 0 L 12 0 L 6 12 Z" fill="#4285f4" />
			</svg>
		</div>
	{:else}
		<div
			role="button"
			tabindex="0"
			onkeydown={null}
			class="absolute z-10 cursor-grab active:cursor-grabbing"
			style:left="0"
			style:top="calc({startPercent}% - 6px)"
			onmousedown={handleStartAnchorMouseDown}
		>
			<svg width="12" height="12" viewBox="0 0 12 12" class="hover:opacity-80">
				<path d="M 0 0 L 0 12 L 12 6 Z" fill="#4285f4" />
			</svg>
		</div>
	{/if}

	<!-- End anchor (triangle marker) -->
	{#if orientation === 'horizontal'}
		<div
			role="button"
			tabindex="0"
			onkeydown={null}
			class="absolute z-10 cursor-grab active:cursor-grabbing"
			style:left="calc({endPercent}% - 6px)"
			style:top="0"
			onmousedown={handleEndAnchorMouseDown}
		>
			<svg width="12" height="12" viewBox="0 0 12 12" class="hover:opacity-80">
				<path d="M 0 0 L 12 0 L 6 12 Z" fill="#ea4335" />
			</svg>
		</div>
	{:else}
		<div
			role="button"
			tabindex="0"
			onkeydown={null}
			class="absolute z-10 cursor-grab active:cursor-grabbing"
			style:left="0"
			style:top="calc({endPercent}% - 6px)"
			onmousedown={handleEndAnchorMouseDown}
		>
			<svg width="12" height="12" viewBox="0 0 12 12" class="hover:opacity-80">
				<path d="M 0 0 L 0 12 L 12 6 Z" fill="#ea4335" />
			</svg>
		</div>
	{/if}
</div>
