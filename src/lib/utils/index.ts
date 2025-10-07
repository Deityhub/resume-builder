export function pixelsToPercent(pixels: number, total: number): string {
	return `${(pixels / total) * 100}%`;
}
