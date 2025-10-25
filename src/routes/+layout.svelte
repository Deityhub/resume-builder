<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	const { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="stylesheet" href="/fonts/fonts.css" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-blue-50 to-white text-neutral-900">
	<main class="min-h-screen">
		{@render children?.()}
	</main>
</div>
