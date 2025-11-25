/**
 * Generates a UUID v4
 * @returns A random UUID v4 string
 */
export function uuidv4(): string {
	// Check for crypto.getRandomValues since it's more widely supported
	if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
		// @ts-expect-error - Some environments might not have the full crypto type
		return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: string) => {
			const randomValue = crypto.getRandomValues(new Uint8Array(1))[0];
			return (parseInt(c) ^ (randomValue & (15 >> (parseInt(c) / 4)))).toString(16);
		});
	}

	// Fallback for non-secure environments (should be rare)
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
