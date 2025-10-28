<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { appStore } from '$lib/stores/appStore.svelte.ts';
	import { ArrowRight, Download, Layers, Zap } from '@lucide/svelte';

	const steps = [
		{ number: '1', title: 'Start', desc: "Click 'Start Building' to enter the editor" },
		{ number: '2', title: 'Create', desc: 'Add text, shapes, and images to your canvas' },
		{ number: '3', title: 'Design', desc: 'Drag, drop, and arrange elements freely' },
		{ number: '4', title: 'Export', desc: 'Download your document as a PDF' }
	];

	const currentYear: number = new Date().getFullYear();
</script>

<div>
	<!-- header section -->
	<header class="sticky top-0 z-50 border-b border-blue-100 bg-white/80 backdrop-blur-md">
		<div class="container mx-auto flex items-center justify-between px-4 py-4">
			<div class="flex items-center gap-3">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						class="text-indigo-600"
					>
						<path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
						<path
							d="M2 17L12 22L22 17"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M2 12L12 17L22 12"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</div>
				<span
					class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent"
				>
					Lienzo
				</span>
			</div>
			<div class="flex items-center gap-4">
				<Button href="/documents" variant="text">My Documents</Button>
				<Button onClick={() => appStore.initNewDocument()} href="/canvas" variant="primary"
					>Start Building</Button
				>
			</div>
		</div>
	</header>

	<!-- hero section -->
	<section class="container mx-auto px-4 py-20 text-center">
		<div class="animate-slide-up">
			<h1
				class="mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-5xl font-bold text-transparent md:text-6xl"
			>
				Create Beautiful Documents
			</h1>
			<p class="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
				A versatile document builder for creating resumes, invoices, letters, and more. Build
				beautiful, professional documents in minutes with our intuitive drag-and-drop canvas.
			</p>
		</div>
	</section>

	<!-- feature section -->
	<section class="bg-white/50 py-20">
		<div class="container mx-auto px-4">
			<h2 class="mb-16 text-center text-3xl font-bold md:text-4xl">Powerful Features</h2>
			<div class="grid gap-8 md:grid-cols-3">
				<div
					class="group rounded-xl border border-blue-100 p-8 transition-all hover:border-blue-300 hover:shadow-lg"
				>
					<div
						class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 transition-transform group-hover:scale-110"
					>
						<Zap class="h-6 w-6 text-blue-600" />
					</div>
					<h3 class="mb-3 text-xl font-semibold">Drag & Drop</h3>
					<p class="text-gray-600">
						Easily drag and drop text, shapes, and images onto your canvas. Perfect positioning
						without any technical skills.
					</p>
				</div>

				<div
					class="group rounded-xl border border-blue-100 p-8 transition-all hover:border-purple-300 hover:shadow-lg"
				>
					<div
						class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 transition-transform group-hover:scale-110"
					>
						<Layers class="h-6 w-6 text-purple-600" />
					</div>
					<h3 class="mb-3 text-xl font-semibold">Multiple Elements</h3>
					<p class="text-gray-600">
						Work with text blocks, geometric shapes, and custom images. Customize colors, sizes, and
						properties for each element.
					</p>
				</div>

				<div
					class="group rounded-xl border border-blue-100 p-8 transition-all hover:border-blue-300 hover:shadow-lg"
				>
					<div
						class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 transition-transform group-hover:scale-110"
					>
						<Download class="h-6 w-6 text-blue-600" />
					</div>
					<h3 class="mb-3 text-xl font-semibold">Export to PDF</h3>
					<p class="text-gray-600">
						Download your finished document as a professional PDF file. Ready to share or print
						instantly.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- How It Works -->
	<section class="container mx-auto px-4 py-20">
		<h2 class="mb-16 text-center text-3xl font-bold md:text-4xl">How It Works</h2>
		<div class="grid gap-4 md:grid-cols-4">
			{#each steps as step (step.number)}
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-lg font-bold text-white"
					>
						{step.number}
					</div>
					<h3 class="mb-2 font-semibold">{step.title}</h3>
					<p class="text-sm text-gray-600">{step.desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- CTA Section -->
	<section class="bg-gradient-to-r from-blue-600 to-purple-600 py-20 text-white">
		<div class="container mx-auto px-4 text-center">
			<h2 class="mb-4 text-4xl font-bold">Ready to create your document?</h2>
			<p class="mb-8 text-lg text-blue-100">
				Start building beautiful documents today, completely free.
			</p>
			<Button
				onClick={() => appStore.initNewDocument()}
				href="/canvas"
				variant="secondary"
				className="bg-white"
			>
				Start Building Now
				<ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
			</Button>
		</div>
	</section>

	<!-- Footer -->
	<footer class="border-t border-blue-100 bg-white/50 py-8">
		<div class="container mx-auto px-4 text-center text-gray-600">
			<p>&copy; {currentYear} Lienzo. Create beautiful documents with ease.</p>
		</div>
	</footer>
</div>
