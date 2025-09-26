<script lang="ts">
	import type { ResumeElement } from '$lib/types/resume';

	interface PropertyPanelProps {
		element: ResumeElement | null;
		updateElementProperties: (params: {
			elementId: string;
			properties: Record<string, string | number | boolean | undefined>;
			pageId: string;
		}) => void;
		deleteElement: (element: ResumeElement) => void;
	}

	let {
		element = $bindable(),
		updateElementProperties,
		deleteElement
	}: PropertyPanelProps = $props();

	const fontFamilies = [
		'Inter',
		'Arial',
		'Helvetica',
		'Times New Roman',
		'Georgia',
		'Verdana',
		'Courier New'
	];

	const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

	function handlePropertyChange(property: string, value: any) {
		if (!element) return;

		updateElementProperties({
			elementId: element.id,
			properties: { [property]: value },
			pageId: element.pageId
		});
	}
</script>

<div class="w-80 overflow-y-auto border-l border-gray-200 bg-white p-4">
	{#if element}
		<div class="space-y-4">
			<h3 class="mb-4 text-lg font-semibold text-gray-800">
				{element.type.charAt(0).toUpperCase() + element.type.slice(1)} Properties
			</h3>

			<!-- Position and Size -->
			<div class="space-y-2">
				<h4 class="font-medium text-gray-700">Position & Size</h4>
				<div class="grid grid-cols-2 gap-2">
					<div>
						<span class="block text-sm text-gray-600">X</span>
						<input
							type="number"
							bind:value={element.x}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('x', parseInt(e.currentTarget.value))}
						/>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Y</span>
						<input
							type="number"
							bind:value={element.y}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('y', parseInt(e.currentTarget.value))}
						/>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Width</span>
						<input
							type="number"
							bind:value={element.width}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('width', parseInt(e.currentTarget.value))}
						/>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Height</span>
						<input
							type="number"
							bind:value={element.height}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('height', parseInt(e.currentTarget.value))}
						/>
					</div>
				</div>
			</div>

			<!-- Text Properties -->
			{#if element.type === 'text'}
				<div class="space-y-2">
					<h4 class="font-medium text-gray-700">Text Properties</h4>
					<div>
						<span class="block text-sm text-gray-600">Text</span>
						<textarea
							value={element.properties.text}
							class="w-full resize-none rounded border px-2 py-1 text-sm"
							rows="3"
							onchange={(e) => handlePropertyChange('text', e.currentTarget.value)}
						></textarea>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Font Family</span>
						<select
							value={element.properties.fontFamily}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('fontFamily', e.currentTarget.value)}
						>
							{#each fontFamilies as font}
								<option value={font}>{font}</option>
							{/each}
						</select>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Font Size</span>
						<select
							value={element.properties.fontSize}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('fontSize', parseInt(e.currentTarget.value))}
						>
							{#each fontSizes as size}
								<option value={size}>{size}px</option>
							{/each}
						</select>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Font Weight</span>
						<select
							value={element.properties.fontWeight}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('fontWeight', e.currentTarget.value)}
						>
							<option value="normal">Normal</option>
							<option value="bold">Bold</option>
						</select>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Font Style</span>
						<select
							value={element.properties.fontStyle}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('fontStyle', e.currentTarget.value)}
						>
							<option value="normal">Normal</option>
							<option value="italic">Italic</option>
						</select>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Color</span>
						<input
							type="color"
							value={element.properties.color}
							class="h-8 w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('color', e.currentTarget.value)}
						/>
					</div>
				</div>
			{/if}

			<!-- Shape Properties -->
			{#if element.type === 'shape'}
				<div class="space-y-2">
					<h4 class="font-medium text-gray-700">Shape Properties</h4>
					<div>
						<span class="block text-sm text-gray-600">Shape Type</span>
						<select
							value={element.properties.shapeType}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('shapeType', e.currentTarget.value)}
						>
							<option value="horizontal-line">Horizontal Line</option>
							<option value="vertical-line">Vertical Line</option>
						</select>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Stroke Color</span>
						<input
							type="color"
							value={element.properties.strokeColor}
							class="h-8 w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('strokeColor', e.currentTarget.value)}
						/>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Stroke Width</span>
						<input
							type="range"
							min="1"
							max="10"
							value={element.properties.strokeWidth}
							class="w-full"
							onchange={(e) => handlePropertyChange('strokeWidth', parseInt(e.currentTarget.value))}
						/>
						<span class="text-sm text-gray-600">{element.properties.strokeWidth}px</span>
					</div>
				</div>
			{/if}

			<!-- Image Properties -->
			{#if element.type === 'image'}
				<div class="space-y-2">
					<h4 class="font-medium text-gray-700">Image Properties</h4>
					<div>
						<span class="block text-sm text-gray-600">Image URL</span>
						<input
							type="url"
							value={element.properties.src}
							class="w-full rounded border px-2 py-1 text-sm"
							placeholder="https://example.com/image.jpg"
							onchange={(e) => handlePropertyChange('src', e.currentTarget.value)}
						/>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Alt Text</span>
						<input
							type="text"
							value={element.properties.alt}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('alt', e.currentTarget.value)}
						/>
					</div>
				</div>
			{/if}

			<!-- Delete Button -->
			<div class="border-t pt-4">
				<button
					onclick={() => deleteElement(element)}
					class="w-full rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
				>
					Delete Element
				</button>
			</div>
		</div>
	{:else}
		<div class="py-8 text-center text-gray-400">Select an element to edit its properties</div>
	{/if}
</div>
