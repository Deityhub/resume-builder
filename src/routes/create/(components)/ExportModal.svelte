<script lang="ts">
	import { Button } from '$lib/components';
	import { appStore } from '$lib/stores/appStore.svelte.ts';
	import jsPDF from 'jspdf';
	import { createExportCanvas } from '$lib/utils/canvasRenderer';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	const { isOpen, onClose }: Props = $props();

	// A4 dimensions in mm
	const pageWidth = 210;
	const pageHeight = 297;

	let isGenerating = $state(false);
	let progress = $state(0);
	let showPreview = $state(false);
	let previewImages = $state<string[]>([]);
	let isGeneratingPreview = $state(false);

	async function generatePreview() {
		if (isGeneratingPreview) return;

		isGeneratingPreview = true;
		showPreview = false; // Hide initial view

		try {
			const pages = Object.values(appStore.getPages());
			const previewCanvases: string[] = [];

			for (let i = 0; i < pages.length; i++) {
				const page = pages[i];

				// Use the utility function to create export canvas
				const canvas = await createExportCanvas(page);

				// Convert to data URL for preview
				const imgData = canvas.toDataURL('image/png');
				previewCanvases.push(imgData);
			}

			previewImages = previewCanvases;
			showPreview = true; // Show preview modal
		} catch (_error) {
			alert('Error generating preview. Please try again.');
		} finally {
			isGeneratingPreview = false;
		}
	}

	async function confirmAndExportPDF() {
		if (isGenerating) return;

		isGenerating = true;

		try {
			const pages = Object.values(appStore.getPages());
			const pdf = new jsPDF({
				orientation: 'portrait',
				unit: 'mm',
				format: 'a4'
			});

			for (let i = 0; i < pages.length; i++) {
				const page = pages[i];
				progress = Math.round(((i + 1) / pages.length) * 100);

				// Use the utility function to create export canvas
				const canvas = await createExportCanvas(page);

				// Convert to image data
				const imgData = canvas.toDataURL('image/png');

				// Add to PDF - scale to fit A4 while maintaining aspect ratio
				if (i > 0) {
					pdf.addPage();
				}

				// Calculate dimensions to fit A4 while maintaining aspect ratio
				const aspectRatio = page.boundaries.horizontal.end / page.boundaries.vertical.end;
				const maxWidth = pageWidth - 20; // 10mm margin on each side
				const maxHeight = pageHeight - 20; // 10mm margin top and bottom

				let imgWidth, imgHeight;
				if (aspectRatio > maxWidth / maxHeight) {
					// Image is wider, fit to width
					imgWidth = maxWidth;
					imgHeight = maxWidth / aspectRatio;
				} else {
					// Image is taller, fit to height
					imgHeight = maxHeight;
					imgWidth = maxHeight * aspectRatio;
				}

				// Center the image on the page
				const x = (pageWidth - imgWidth) / 2;
				const y = (pageHeight - imgHeight) / 2;

				pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
			}

			// Save the PDF
			pdf.save(`resume-${new Date().toISOString().split('T')[0]}.pdf`);
		} catch (_error) {
			alert('Error generating PDF. Please try again.');
		} finally {
			isGenerating = false;
			progress = 0;
			showPreview = false;
			onClose();
		}
	}

	function closePreview() {
		showPreview = false;
		previewImages = [];
	}

	function handleClose() {
		if (!isGenerating) {
			onClose();
		}
	}

	function handleBackdropKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && !isGenerating) {
			onClose();
		}
	}
</script>

{#if isOpen}
	<!-- Main Modal Backdrop -->
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
		onclick={handleClose}
		onkeydown={handleBackdropKeydown}
		role="button"
		tabindex="0"
		aria-label="Close modal"
	>
		{#if showPreview}
			<!-- Preview Modal -->
			<div
				class="mx-4 w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl"
				onclick={(e) => e.stopPropagation()}
				role="button"
				tabindex="0"
				onkeydown={null}
			>
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-lg font-semibold">PDF Preview</h2>
					<Button onClick={closePreview} disabled={isGeneratingPreview} variant="text">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							></path>
						</svg>
					</Button>
				</div>

				<div class="mb-6">
					<p class="mb-4 text-gray-600">
						Here's how your resume will appear in the PDF. {previewImages.length} page{previewImages.length >
						1
							? 's'
							: ''}.
					</p>

					<!-- Preview Images -->
					<div
						class="grid max-h-[calc(100vh-24rem)] gap-4 overflow-y-auto"
						class:grid-cols-1={previewImages.length === 1}
						class:grid-cols-2={previewImages.length > 1}
					>
						{#each previewImages as previewImage, index (index)}
							<div class="rounded-lg border border-gray-200 bg-gray-50 p-2">
								<div class="mb-2 text-sm text-gray-500">Page {index + 1}</div>
								<img
									src={previewImage}
									alt={`Resume preview page ${index + 1}`}
									class="h-auto w-full rounded border border-gray-300 shadow-sm"
									style="max-height: 400px; object-fit: contain;"
								/>
							</div>
						{/each}
					</div>
				</div>

				{#if isGenerating}
					<div class="mb-4">
						<div class="mb-2 flex items-center justify-between">
							<span class="text-sm text-gray-600">Generating PDF...</span>
							<span class="text-sm text-gray-600">{progress}%</span>
						</div>
						<div class="h-2 w-full rounded-full bg-gray-200">
							<div
								class="h-2 rounded-full bg-indigo-600 transition-all duration-300"
								style="width: {progress}%"
							></div>
						</div>
					</div>
				{/if}

				<div class="flex justify-end gap-3">
					<Button variant="ghost" onClick={closePreview} disabled={isGenerating}>
						Back to Options
					</Button>
					<Button
						variant="primary"
						onClick={confirmAndExportPDF}
						disabled={isGenerating}
						pending={isGenerating}
					>
						{#if isGenerating}
							Generating PDF...
						{:else}
							Export PDF
						{/if}
					</Button>
				</div>
			</div>
		{:else}
			<!-- Initial Export Options Modal -->
			<div
				class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
				onclick={(e) => e.stopPropagation()}
				role="button"
				tabindex="0"
				onkeydown={null}
			>
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-lg font-semibold">Export Resume</h2>
					<Button onClick={handleClose} disabled={isGeneratingPreview} variant="text">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							></path>
						</svg>
					</Button>
				</div>

				<div class="mb-6">
					<p class="mb-4 text-gray-600">
						Your resume will be exported as a PDF with {Object.values(appStore.getPages()).length} page{Object.values(
							appStore.getPages()
						).length > 1
							? 's'
							: ''}.
					</p>

					{#if isGeneratingPreview}
						<div class="mb-4">
							<div class="mb-2 flex items-center justify-between">
								<span class="text-sm text-gray-600">Generating Preview...</span>
							</div>
							<div class="h-2 w-full rounded-full bg-gray-200">
								<div class="h-2 animate-pulse rounded-full bg-indigo-600" style="width: 100%"></div>
							</div>
						</div>
					{/if}
				</div>

				<div class="flex justify-end gap-3">
					<Button variant="ghost" onClick={handleClose} disabled={isGeneratingPreview}
						>Cancel</Button
					>
					<Button
						variant="primary"
						onClick={generatePreview}
						disabled={isGeneratingPreview}
						pending={isGeneratingPreview}
					>
						{#if isGeneratingPreview}
							Generating Preview...
						{:else}
							Preview PDF
						{/if}
					</Button>
				</div>
			</div>
		{/if}
	</div>
{/if}
