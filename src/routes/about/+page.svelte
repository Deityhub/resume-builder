<script>
	import Button from '$lib/components/Button.svelte';
</script>

<div class="mx-auto min-h-screen max-w-4xl p-6 pt-12">
	<div class="my-8">
		<Button href="/" variant="text" noPadding>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-2 h-5 w-5"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
					clip-rule="evenodd"
				/>
			</svg>
			Back to Home
		</Button>
	</div>

	<h1 class="mb-6 text-4xl font-bold text-gray-800">About Our Resume Builder</h1>

	<div class="prose prose-lg text-gray-600">
		<p class="mb-4">
			Welcome to our Resume Builder, a powerful tool designed to help you create professional
			resumes quickly and easily. Whether you're a seasoned professional or just starting your
			career, our platform provides everything you need to create a resume that stands out.
		</p>

		<h2 class="mt-8 mb-4 text-2xl font-semibold text-gray-800">Our Mission</h2>
		<p class="mb-4">
			We believe that everyone deserves access to professional resume-building tools that help them
			showcase their skills and experience effectively. Our mission is to simplify the resume
			creation process while maintaining the highest standards of quality and professionalism.
		</p>

		<h2 class="mt-8 mb-4 text-2xl font-semibold text-gray-800">Features</h2>
		<ul class="mb-6 list-disc space-y-2 pl-6">
			<li>Easy-to-use interface</li>
			<li>Professional resume templates</li>
			<li>Customizable sections</li>
			<li>Real-time preview</li>
			<li>Multiple export formats</li>
		</ul>

		<h2 class="mt-8 mb-4 text-2xl font-semibold text-gray-800">Get Started</h2>
		<p class="mb-6">
			Ready to create your professional resume? <Button href="/create" variant="text" noPadding
				>Get started now</Button
			>
		</p>
	</div>
</div>
