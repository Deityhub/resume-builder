<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { appStore } from '$lib/stores/appStore.svelte.ts';
</script>

<div class="flex min-h-screen flex-col justify-between p-6 text-center">
	<div class="mx-auto mt-56 max-w-3xl">
		<h1 class="mb-6 text-5xl font-bold text-gray-800">Resume Builder</h1>
		<p class="mb-8 text-xl leading-relaxed text-gray-600">
			Create professional resumes in minutes with our easy-to-use tool. Stand out to employers with
			a polished, well-structured resume.
		</p>

		<div class="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
			<Button onClick={() => appStore.initNewResume()} href="/create" variant="primary"
				>Create Your Resume</Button
			>
			<Button href="/saved" variant="secondary">View Resumes</Button>
		</div>
	</div>

	<div class="border-t border-gray-200 pt-8">
		<p class="mb-4 text-gray-500">Learn more about our platform</p>
		<Button href="/about" variant="text" className="inline-flex items-center">
			About Us
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="ml-1 h-5 w-5"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</Button>
	</div>
</div>
