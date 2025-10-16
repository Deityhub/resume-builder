<script lang="ts">
	import { Modal } from '$lib/components';
	import { appStore } from '$lib/stores/appStore.svelte.ts';
	import jsPDF from 'jspdf';
	import { getPageImageData } from '$lib/utils/canvasRenderer';
	import { CANVAS_WIDTH, CANVAS_HEIGHT } from '$lib/const/dimension';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	const { isOpen, onClose }: Props = $props();

	// Canvas dimensions in mm (A4 at 300 DPI)
	const DPI = 300;
	const MM_PER_INCH = 25.4;
	const pageWidth = (CANVAS_WIDTH / DPI) * MM_PER_INCH;
	const pageHeight = (CANVAS_HEIGHT / DPI) * MM_PER_INCH;

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
				// and Convert to image data
				const imgData = await getPageImageData(page);

				previewCanvases.push(imgData);
			}
			previewImages = previewCanvases;
			showPreview = true;
		} catch (_error) {
			alert('Error generating preview. Please try again.');
			console.error('Error generating preview: ', _error);
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
				orientation: pageWidth > pageHeight ? 'landscape' : 'portrait',
				unit: 'mm',
				format: [pageWidth, pageHeight]
			});

			for (let i = 0; i < pages.length; i++) {
				const page = pages[i];
				progress = Math.round(((i + 1) / pages.length) * 100);

				// Use the utility function to create export canvas
				// and Convert to image data
				const imgData = await getPageImageData(page);

				// Add to PDF - use exact canvas dimensions
				if (i > 0) {
					pdf.addPage();
				}

				// Add image at full size (no scaling needed since we're using exact dimensions)
				pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
			}

			// Save the PDF
			pdf.save(`resume-${new Date().toISOString().split('T')[0]}.pdf`);
		} catch (_error) {
			alert('Error generating PDF. Please try again.');
			console.error('Error generating PDF: ', _error);
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
			description={`Here's how your resume will appear in the PDF using the exact canvas dimensions of (${Math.round(pageWidth)}mm × ${Math.round(pageHeight)}mm). ${previewImages.length} page${previewImages.length > 1 ? 's' : ''}.`}
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
			description={`Your resume will be exported as a PDF using the exact canvas dimensions of (${Math.round(pageWidth)}mm × ${Math.round(pageHeight)}mm).`}
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
