<script lang="ts">
	import {
		fontFamilies,
		fontSizes,
		fontWeights,
		fontStyles,
		textDecorations,
		textTransforms
	} from '$lib/const/font';
	import { appStore } from '$lib/stores/appStore.svelte.ts';

	const selectedElement = $derived(appStore.getSelectedElement());

	function handlePropertyChange(property: string, value: string | number) {
		if (!selectedElement) return;

		appStore.updateElement({
			elementId: selectedElement.id,
			updates: { [property]: value },
			pageId: selectedElement.pageId
		});
	}
</script>

<div
	class="w-80 overflow-y-auto border-l border-gray-200 bg-white p-4"
	data-testid="property-panel"
>
	{#if selectedElement}
		<div class="space-y-4">
			<h3 class="mb-4 text-lg font-semibold text-gray-800" data-testid="property-panel-title">
				{selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Properties
			</h3>

			<!-- Position and Size -->
			<div class="space-y-2">
				<h4 class="font-medium text-gray-700">Position & Size</h4>
				<div class="grid grid-cols-2 gap-2">
					<div>
						<span class="block text-sm text-gray-600">X</span>
						<input
							data-testid="input-x"
							type="number"
							value={selectedElement.x}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('x', parseInt(e.currentTarget.value))}
						/>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Y</span>
						<input
							data-testid="input-y"
							type="number"
							value={selectedElement.y}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('y', parseInt(e.currentTarget.value))}
						/>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Width</span>
						<input
							data-testid="input-width"
							type="number"
							value={selectedElement.width}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('width', parseInt(e.currentTarget.value))}
						/>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Height</span>
						<input
							data-testid="input-height"
							type="number"
							value={selectedElement.height}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('height', parseInt(e.currentTarget.value))}
						/>
					</div>
				</div>
			</div>

			<!-- Text Properties -->
			{#if selectedElement.type === 'text'}
				<div class="space-y-2">
					<h4 class="font-medium text-gray-700">Text Properties</h4>

					<!-- For now there's no point showing the text field here again since it's editable directly in the element. -->
					<!-- <div>
						<span class="block text-sm text-gray-600">Text</span>
						<textarea
							value={selectedElement.text}
							class="w-full resize-none rounded border px-2 py-1 text-sm"
							rows="3"
							onchange={(e) => handlePropertyChange('text', e.currentTarget.value)}
						></textarea>
					</div> -->

					<div>
						<span class="block text-sm text-gray-600">Font Family</span>
						<select
							data-testid="select-font-family"
							value={selectedElement.fontFamily}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('fontFamily', e.currentTarget.value)}
						>
							{#each fontFamilies as font (font)}
								<option value={font}>{font}</option>
							{/each}
						</select>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Font Size</span>
						<select
							data-testid="select-font-size"
							value={selectedElement.fontSize}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('fontSize', parseInt(e.currentTarget.value))}
						>
							{#each fontSizes as size (size)}
								<option value={size}>{size}px</option>
							{/each}
						</select>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Font Weight</span>
						<select
							data-testid="select-font-weight"
							value={selectedElement.fontWeight}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('fontWeight', e.currentTarget.value)}
						>
							{#each fontWeights as weight (weight.value)}
								<option value={weight.value}>{weight.label}</option>
							{/each}
						</select>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Font Style</span>
						<select
							data-testid="select-font-style"
							value={selectedElement.fontStyle}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('fontStyle', e.currentTarget.value)}
						>
							{#each fontStyles as style (style.value)}
								<option value={style.value}>{style.label}</option>
							{/each}
						</select>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Text Decoration</span>
						<select
							data-testid="select-text-decoration"
							value={selectedElement.textDecoration || 'none'}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('textDecoration', e.currentTarget.value)}
						>
							{#each textDecorations as decoration (decoration.value)}
								<option value={decoration.value}>{decoration.label}</option>
							{/each}
						</select>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Text Transform</span>
						<select
							data-testid="select-text-transform"
							value={selectedElement.textTransform || 'none'}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('textTransform', e.currentTarget.value)}
						>
							{#each textTransforms as transform (transform.value)}
								<option value={transform.value}>{transform.label}</option>
							{/each}
						</select>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Color</span>
						<input
							data-testid="input-color"
							type="color"
							value={selectedElement.color}
							class="h-8 w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('color', e.currentTarget.value)}
						/>
					</div>
				</div>
			{/if}

			<!-- Shape Properties -->
			{#if selectedElement.type === 'shape'}
				<div class="space-y-2">
					<h4 class="font-medium text-gray-700">Shape Properties</h4>
					<div>
						<span class="block text-sm text-gray-600">Shape Type</span>
						<select
							data-testid="select-shape-type"
							value={selectedElement.shapeType}
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
							data-testid="input-stroke-color"
							type="color"
							value={selectedElement.strokeColor}
							class="h-8 w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('strokeColor', e.currentTarget.value)}
						/>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Stroke Width</span>
						<input
							data-testid="input-stroke-width"
							type="range"
							min="1"
							max="10"
							value={selectedElement.strokeWidth}
							class="w-full"
							onchange={(e) => handlePropertyChange('strokeWidth', parseInt(e.currentTarget.value))}
						/>
					</div>
				</div>
			{/if}

			<!-- Image Properties -->
			{#if selectedElement.type === 'image'}
				<div class="space-y-2">
					<h4 class="font-medium text-gray-700">Image Properties</h4>
					<div>
						<span class="block text-sm text-gray-600">Image URL</span>
						<input
							data-testid="input-image-src"
							type="url"
							value={selectedElement.src}
							class="w-full rounded border px-2 py-1 text-sm"
							placeholder="https://example.com/image.jpg"
							onchange={(e) => handlePropertyChange('src', e.currentTarget.value)}
						/>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Alt Text</span>
						<input
							data-testid="input-image-alt"
							type="text"
							value={selectedElement.alt}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('alt', e.currentTarget.value)}
						/>
					</div>
				</div>
			{/if}

			<!-- Delete Button -->
			<div class="pt-4">
				<button
					data-testid="delete-element-btn"
					onclick={() => appStore.deleteElement(selectedElement.id, selectedElement.pageId)}
					class="w-full rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
				>
					Delete Element
				</button>
			</div>
		</div>
	{:else}
		<div class="py-8 text-center text-gray-400" data-testid="no-selection-message">
			Select an element to edit its properties
		</div>
	{/if}
</div>
