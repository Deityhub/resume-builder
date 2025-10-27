<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllResumes, isIndexedDBSupported } from '$lib/utils/idb';
	import type { ResumeData } from '$lib/types/canvas';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components';
	import { appStore } from '$lib/stores/appStore.svelte.ts';
	import Document from './(components)/Document.svelte';

	let resumes = $state<ResumeData[]>([]);
	let loading = $state(true);
	let error = $state('');
	let searchQuery = $state('');

	async function fetchResumes() {
		loading = true;
		try {
			resumes = await getAllResumes();
			error = '';
		} catch (_error) {
			console.error('Error loading documents:', _error);
			error = 'Failed to load documents. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function handleCreateNew() {
		appStore.initNewResume();
		await goto(resolve('/canvas'));
	}

	// Filter documents based on search query
	const filteredResumes = $derived(
		resumes.filter((resume) => resume.name.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	onMount(() => {
		if (!isIndexedDBSupported()) {
			return goto(resolve('/'));
		}
		fetchResumes();
	});
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="border-b border-blue-100 bg-white/80 backdrop-blur-md">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
			<div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<div class="flex items-center space-x-4">
					<Button onClick={() => goto(resolve('/'))} variant="text" size="xs" className="-ml-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
								clip-rule="evenodd"
							/>
						</svg>
					</Button>
					<div>
						<h1 class="text-2xl font-bold text-gray-900">Documents</h1>
						<p class="mt-1 text-sm text-gray-500">View and manage your documents</p>
					</div>
				</div>
				<div class="flex w-full items-center gap-4 sm:w-auto">
					<div class="relative flex-1 sm:w-64">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<svg
								class="h-5 w-5 text-gray-400"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Search documents..."
							class="block w-full rounded-md border-0 py-1.5 pr-3 pl-10 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:ring-inset sm:text-sm sm:leading-6"
						/>
					</div>
					<Button onClick={handleCreateNew} variant="primary" className="whitespace-nowrap">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-2 h-4 w-4"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
								clip-rule="evenodd"
							/>
						</svg>
						New Document
					</Button>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		{#if loading}
			<div class="flex h-64 items-center justify-center">
				<div class="text-center">
					<div class="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
					<p class="mt-3 text-gray-600">Loading documents...</p>
				</div>
			</div>
		{:else if error}
			<div class="rounded-md bg-red-50 p-4">
				<div class="flex">
					<div class="flex-shrink-0">
						<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-800">{error}</h3>
					</div>
				</div>
			</div>
		{:else if filteredResumes.length === 0}
			<div
				class="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center"
			>
				<svg
					class="mx-auto h-12 w-12 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<h3 class="mt-2 text-sm font-medium text-gray-900">No documents</h3>
				<p class="mt-1 text-sm text-gray-500">
					{searchQuery
						? 'No documents match your search.'
						: 'Get started by creating a new document.'}
				</p>
				<div class="mt-6">
					<Button onClick={handleCreateNew} variant="primary">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-2 -ml-1 h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
								clip-rule="evenodd"
							/>
						</svg>
						New Document
					</Button>
				</div>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each filteredResumes as resume (resume.id)}
					<Document {resume} {fetchResumes} />
				{/each}
			</div>
		{/if}
	</main>
</div>
