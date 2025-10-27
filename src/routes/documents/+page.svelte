<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllResumes, deleteResume, isIndexedDBSupported } from '$lib/utils/idb';
	import type { ResumeData } from '$lib/types/canvas';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components';
	import { appStore } from '$lib/stores/appStore.svelte.ts';
	let resumes = $state<ResumeData[]>([]);
	let loading = $state(true);
	let error = $state('');

	async function fetchResumes() {
		loading = true;
		try {
			resumes = await getAllResumes();
			error = '';
		} catch (_error) {
			console.error('Error loading resumes:', _error);
			error = 'Failed to load resumes. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function handleCreateNew() {
		// Set the new resume in the store
		appStore.initNewResume();

		// Navigate to create page
		await goto(resolve('/canvas'));
	}

	async function handleEdit(resume: ResumeData) {
		// load resume and navigate to create page
		appStore.setCurrentResume(resume);
		await goto(resolve('/canvas'));
	}

	async function handleDelete(resume: ResumeData) {
		// TODO: show a modal here instead
		if (!confirm(`Delete resume "${resume.name}"? This cannot be undone.`)) return;

		await deleteResume(resume.id);
		await fetchResumes();
	}

	async function handleHomeNavigation() {
		await goto(resolve('/'));
	}

	onMount(() => {
		if (!isIndexedDBSupported()) {
			return goto(resolve('/'));
		}
		fetchResumes();
	});
</script>

<div class="flex min-h-screen flex-col justify-between p-6 text-center">
	<div class="mx-auto w-full max-w-2xl py-10">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-2xl font-bold">Saved Resumes</h1>
			<Button onClick={handleCreateNew} variant="secondary">Create New Resume</Button>
		</div>
		{#if loading}
			<div>Loading...</div>
		{:else if error}
			<div class="text-red-500">{error}</div>
		{:else if resumes.length === 0}
			<div class="text-gray-500">No resumes saved yet.</div>
		{:else}
			<ul class="space-y-4">
				{#each resumes as resume (resume.id)}
					<li class="flex items-center justify-between rounded border p-4 text-left">
						<div>
							<div class="font-semibold">{resume.name}</div>
							<div class="text-xs text-gray-500">
								Last updated: {new Date(resume.updatedAt).toLocaleString()}
							</div>
						</div>
						<div class="flex gap-2">
							<Button onClick={() => handleEdit(resume)}>Edit</Button>
							<Button onClick={() => handleDelete(resume)} variant="destructive">Delete</Button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<!-- Footer -->
	<div class="mt-8 border-t border-gray-200 pt-6">
		<div class="flex justify-center">
			<Button onClick={handleHomeNavigation} variant="text" data-testid="home-btn">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-2 h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
					/>
				</svg>
				Back to Home
			</Button>
		</div>
	</div>
</div>
