<script lang="ts">
	import { Modal } from '$lib/components';
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
		showPreview = false;
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
			showPreview = true;
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

	function handleClose() {
		if (!isGenerating && !isGeneratingPreview) onClose();
	}
</script>

{#if isOpen}
	{#if showPreview}
		<Modal
			open={true}
			title="PDF Preview"
			description={`Here's how your resume will appear in the PDF. ${previewImages.length} page${previewImages.length > 1 ? 's' : ''}.`}
			onCancel={() => {
				showPreview = false;
			}}
			onAccept={confirmAndExportPDF}
			acceptLabel={isGenerating ? 'Generating PDF...' : 'Export PDF'}
			disableActions={isGenerating}
			cancelLabel="Back to Options"
		>
			{#if isGenerating}
				<div class="mb-4">
					<div class="mb-2 flex items-center justify-between">
						<span class="text-sm text-gray-600">Generating PDF...</span>
						<span class="text-sm text-gray-600">{progress}%</span>
					</div>
					<div class="h-2 w-full rounded-full bg-gray-200">
						<div
							class="h-2 rounded-full bg-indigo-600 transition-all duration-300"
							style={`width: ${progress}%`}
						></div>
					</div>
				</div>
			{/if}

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
		</Modal>
	{:else}
		<Modal
			open={true}
			title="Export Resume"
			description={`Your resume will be exported as a PDF with ${Object.values(appStore.getPages()).length} page${Object.values(appStore.getPages()).length > 1 ? 's' : ''}.`}
			onCancel={handleClose}
			onAccept={generatePreview}
			acceptLabel={isGeneratingPreview ? 'Generating Preview...' : 'Preview PDF'}
			disableActions={isGeneratingPreview}
		>
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
		</Modal>
	{/if}
{/if}
