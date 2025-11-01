import { CANVAS_HEIGHT, CANVAS_WIDTH, DISPLAY_SCALE } from '$lib/const/dimension';
import type { DocumentPage } from '$lib/types/canvas';
import { toCanvas } from 'html-to-image';

/**
 * Utility function to create a hidden canvas for export purposes
 * This can be used for PDF generation or preview
 */
export async function createExportCanvas(page: DocumentPage): Promise<HTMLCanvasElement | void> {
	const width = CANVAS_WIDTH * DISPLAY_SCALE;
	const height = CANVAS_HEIGHT * DISPLAY_SCALE;

	try {
		const canvasRef = document.getElementById(`canvas-${page.id}`);

		if (!canvasRef) {
			return;
		}

		const canvas = await toCanvas(canvasRef, {
			canvasWidth: width,
			canvasHeight: height,
			backgroundColor: '#ffffff',
			filter: (domNode) => {
				if (!(domNode instanceof Element)) return true;
				return !domNode.hasAttribute('data-html2canvas-ignore');
			}
		});

		return canvas;
	} catch (_error) {
		console.error('Error creating export canvas: ', _error);
	}
}

/**
 * Utility function to get image data URL from a page
 * Useful for preview generation
 */
export async function getPageImageData(page: DocumentPage): Promise<string> {
	const canvas = await createExportCanvas(page);

	if (!canvas) {
		return '';
	}
	return canvas.toDataURL('image/png');
}
