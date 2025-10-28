<script lang="ts">
	import { deleteDocument } from '$lib/utils/idb';
	import type { DocumentData } from '$lib/types/canvas';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components';
	import { appStore } from '$lib/stores/appStore.svelte.ts';
	import { Trash2, Pen } from '@lucide/svelte';

	const {
		document,
		fetchDocuments
	}: { document: DocumentData; fetchDocuments: () => Promise<void> } = $props();

	async function handleEdit(document: DocumentData) {
		appStore.setCurrentDocument(document);
		await goto(resolve('/canvas'));
	}

	async function handleDelete(document: DocumentData) {
		if (!confirm(`Delete document "${document.name}"? This cannot be undone.`)) return;
		await deleteDocument(document.id);
		await fetchDocuments();
	}

	function formatDate(timestamp: number) {
		return new Date(timestamp).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div
	class="overflow-hidden rounded-lg bg-white shadow transition-shadow duration-200 hover:shadow-md"
>
	<div class="p-5">
		<div class="flex items-start justify-between">
			<div class="flex-1">
				<h3 class="truncate text-lg font-medium text-gray-900">{document.name}</h3>
				<p class="mt-1 text-sm text-gray-500">
					Updated {formatDate(document.updatedAt)}
				</p>
			</div>
		</div>
		<div class="mt-4 flex items-center justify-between">
			<span
				class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
			>
				<svg
					class="mr-1 h-3 w-3"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
						clip-rule="evenodd"
					/>
				</svg>
				{Object.keys(document.pages).length} pages
			</span>

			<div class="ml-4 flex items-center space-x-2">
				<Button onClick={() => handleEdit(document)} variant="secondary" size="xs">
					<Pen class="mr-2 h-4 w-4" />
					Edit
				</Button>
				<Button onClick={() => handleDelete(document)} variant="secondary-destructive" size="xs">
					<Trash2 class="mr-2 h-4 w-4" />
					Delete
				</Button>
			</div>
		</div>
	</div>
</div>
