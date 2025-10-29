<script lang="ts">
	import '../app.css';

	const { children } = $props();
</script>

<svelte:head>
	<title>Lienzo - A modern document builder</title>
	<meta
		name="description"
		content="A versatile document builder for creating resumes, invoices, letters, and more. Build beautiful, professional documents with our intuitive drag-and-drop canvas."
	/>
	<link rel="stylesheet" href="/fonts/fonts.css" />
</svelte:head>

<div class="min-h-screen bg-primary/8 text-foreground">
	<main class="min-h-screen">
		{@render children?.()}
	</main>
</div>
