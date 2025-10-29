/**
 * Converts a pixel value to a percentage string based on a total dimension.
 * Used for responsive element positioning in the canvas.
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
