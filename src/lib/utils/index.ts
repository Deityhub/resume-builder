import type { ResumeElement } from '$lib/types/resume';

/**
 * Converts a pixel value to a percentage string based on a total dimension.
 * Used for responsive element positioning in the resume canvas.
 *
 * @param pixels - The pixel value to convert
 * @param total - The total dimension (width or height) to calculate percentage against
 * @returns A percentage string with % suffix (e.g., "50%")
 *
 * @example
 * ```ts
 * pixelsToPercent(50, 100) // returns "50%"
 * pixelsToPercent(25, 200) // returns "12.5%"
 * ```
 */
export function pixelsToPercent(pixels: number, total: number): string {
	return `${(pixels / total) * 100}%`;
}

/**
 * Recursively retrieves all elements from a nested element structure.
 * Flattens the hierarchical element tree into a single array, including nested children.
 *
 * @param elements - Record of resume elements, potentially containing nested elements
 * @returns Array of all elements in the tree, parent elements followed by their children
 *
 * @example
 * ```ts
 * const elements = {
 *   "id1": { id: "id1", elements: { "id2": { id: "id2", elements: {} } } }
 * };
 * getAllElements(elements) // returns [element1, element2]
 * ```
 */
export function getAllElements(elements: Record<string, ResumeElement>): ResumeElement[] {
	const result: ResumeElement[] = [];
	for (const el of Object.values(elements)) {
		result.push(el);
		result.push(...getAllElements(el.elements));
	}
	return result;
}
