<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllResumes, deleteResume, isIndexedDBSupported } from '$lib/utils/idb';
	import type { ResumeData } from '$lib/types/resume';
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
		await goto(resolve('/create'));
	}

	async function handleEdit(resume: ResumeData) {
		// load resume and navigate to create page
		appStore.setCurrentResume(resume);
		await goto(resolve('/create'));
	}

	async function handleDelete(resume: ResumeData) {
		// TODO: show a modal here instead
		if (!confirm(`Delete resume "${resume.name}"? This cannot be undone.`)) return;

		await deleteResume(resume.id);
		await fetchResumes();
	}

	onMount(() => {
		if (!isIndexedDBSupported()) {
			return goto(resolve('/'));
		}
		fetchResumes();
	});
</script>

<div class="mx-auto max-w-2xl py-10">
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
				<li class="flex items-center justify-between rounded border p-4">
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
