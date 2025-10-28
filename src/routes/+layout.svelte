<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	const { children } = $props();
</script>

<svelte:head>
	<title>Lienzo - Create Beautiful Documents</title>
	<meta
		name="description"
		content="A versatile document builder for creating resumes, invoices, letters, and more. Build beautiful, professional documents with our intuitive drag-and-drop canvas."
	/>
	<link rel="icon" href={favicon} />
	<link rel="stylesheet" href="/fonts/fonts.css" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white text-neutral-900">
	<main class="min-h-screen">
		{@render children?.()}
	</main>
</div>
