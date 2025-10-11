<script lang="ts">
	import {
		fontFamilies,
		fontSizes,
		fontWeights,
		fontStyles,
		textDecorations,
		textTransforms,
		textAlignments
	} from '$lib/const/font';
	import { shapeTypes, strokeStyles } from '$lib/const/shape';
	import { objectFitOptions, borderStyles } from '$lib/const/image';
	import { appStore } from '$lib/stores/appStore.svelte.ts';
	import { slide } from 'svelte/transition';

	const selectedElement = $derived(appStore.getSelectedElement());

	function handlePropertyChange(property: string, value: string | number | object) {
		if (!selectedElement) return;

		appStore.updateElement({
			elementId: selectedElement.id,
			updates: { [property]: value },
			pageId: selectedElement.pageId
		});
	}
</script>

{#if selectedElement}
	<div
		transition:slide={{ duration: 300, axis: 'x' }}
		class="w-80 overflow-y-auto border-l border-gray-200 bg-white p-4"
		data-testid="property-panel"
	>
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
							oninput={(e) => handlePropertyChange('color', e.currentTarget.value)}
						/>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Text Alignment</span>
						<select
							data-testid="select-text-alignment"
							value={selectedElement.textAlign || 'left'}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('textAlign', e.currentTarget.value)}
						>
							{#each textAlignments as alignment (alignment.value)}
								<option value={alignment.value}>{alignment.label}</option>
							{/each}
						</select>
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
							{#each shapeTypes as shape (shape.value)}
								<option value={shape.value}>{shape.label}</option>
							{/each}
						</select>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Stroke Color</span>
						<input
							data-testid="input-stroke-color"
							type="color"
							value={selectedElement.strokeColor}
							class="h-8 w-full rounded border px-2 py-1 text-sm"
							oninput={(e) => handlePropertyChange('strokeColor', e.currentTarget.value)}
						/>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Stroke Width</span>
						<input
							data-testid="input-stroke-width"
							type="range"
							min="1"
							max="20"
							value={selectedElement.strokeWidth}
							class="w-full"
							oninput={(e) => handlePropertyChange('strokeWidth', parseInt(e.currentTarget.value))}
						/>
						<span class="text-sm text-gray-600">{selectedElement.strokeWidth}px</span>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Stroke Style</span>
						<select
							data-testid="select-stroke-style"
							value={selectedElement.strokeStyle || 'solid'}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('strokeStyle', e.currentTarget.value)}
						>
							{#each strokeStyles as style (style.value)}
								<option value={style.value}>{style.label}</option>
							{/each}
						</select>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Stroke Opacity</span>
						<input
							data-testid="input-stroke-opacity"
							type="range"
							min="0"
							max="1"
							step="0.1"
							value={selectedElement.strokeOpacity || 1}
							class="w-full"
							oninput={(e) =>
								handlePropertyChange('strokeOpacity', parseFloat(e.currentTarget.value))}
						/>
						<span class="text-sm text-gray-600"
							>{((selectedElement.strokeOpacity || 1) * 100).toFixed(0)}%</span
						>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Fill Color</span>
						<input
							data-testid="input-fill-color"
							type="color"
							value={selectedElement.fillColor || '#ffffff'}
							class="h-8 w-full rounded border px-2 py-1 text-sm"
							oninput={(e) => handlePropertyChange('fillColor', e.currentTarget.value)}
						/>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Fill Opacity</span>
						<input
							data-testid="input-fill-opacity"
							type="range"
							min="0"
							max="1"
							step="0.1"
							value={selectedElement.fillOpacity || 0}
							class="w-full"
							oninput={(e) =>
								handlePropertyChange('fillOpacity', parseFloat(e.currentTarget.value))}
						/>
						<span class="text-sm text-gray-600"
							>{((selectedElement.fillOpacity || 0) * 100).toFixed(0)}%</span
						>
					</div>
					{#if selectedElement.shapeType === 'rectangle'}
						<div>
							<span class="block text-sm text-gray-600">Corner Radius</span>
							<input
								data-testid="input-corner-radius"
								type="range"
								min="0"
								max="100"
								value={selectedElement.cornerRadius || 0}
								class="w-full"
								oninput={(e) =>
									handlePropertyChange('cornerRadius', parseInt(e.currentTarget.value))}
							/>
							<span class="text-sm text-gray-600">{selectedElement.cornerRadius || 0}%</span>
						</div>
					{/if}
					<div>
						<span class="block text-sm text-gray-600">Rotation</span>
						<input
							data-testid="input-rotation"
							type="range"
							min="0"
							max="360"
							value={selectedElement.rotation || 0}
							class="w-full"
							oninput={(e) => handlePropertyChange('rotation', parseInt(e.currentTarget.value))}
						/>
						<span class="text-sm text-gray-600">{selectedElement.rotation || 0}°</span>
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
					<div>
						<span class="block text-sm text-gray-600">Object Fit</span>
						<select
							data-testid="select-object-fit"
							value={selectedElement.objectFit || 'contain'}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('objectFit', e.currentTarget.value)}
						>
							{#each objectFitOptions as option (option.value)}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Border Radius</span>
						<input
							data-testid="input-border-radius"
							type="range"
							min="0"
							max="100"
							value={selectedElement.borderRadius || 0}
							class="w-full"
							oninput={(e) => handlePropertyChange('borderRadius', parseInt(e.currentTarget.value))}
						/>
						<span class="text-sm text-gray-600">{selectedElement.borderRadius || 0}%</span>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Opacity</span>
						<input
							data-testid="input-opacity"
							type="range"
							min="0"
							max="1"
							step="0.1"
							value={selectedElement.opacity || 1}
							class="w-full"
							oninput={(e) => handlePropertyChange('opacity', parseFloat(e.currentTarget.value))}
						/>
						<span class="text-sm text-gray-600"
							>{((selectedElement.opacity || 1) * 100).toFixed(0)}%</span
						>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Border Color</span>
						<input
							data-testid="input-border-color"
							type="color"
							value={selectedElement.borderColor || '#000000'}
							class="h-8 w-full rounded border px-2 py-1 text-sm"
							oninput={(e) => handlePropertyChange('borderColor', e.currentTarget.value)}
						/>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Border Width</span>
						<input
							data-testid="input-border-width"
							type="range"
							min="0"
							max="10"
							value={selectedElement.borderWidth || 0}
							class="w-full"
							oninput={(e) => handlePropertyChange('borderWidth', parseInt(e.currentTarget.value))}
						/>
						<span class="text-sm text-gray-600">{selectedElement.borderWidth || 0}px</span>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Border Style</span>
						<select
							data-testid="select-border-style"
							value={selectedElement.borderStyle || 'solid'}
							class="w-full rounded border px-2 py-1 text-sm"
							onchange={(e) => handlePropertyChange('borderStyle', e.currentTarget.value)}
						>
							{#each borderStyles as style (style.value)}
								<option value={style.value}>{style.label}</option>
							{/each}
						</select>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Box Shadow</span>
						<input
							data-testid="input-box-shadow"
							type="text"
							value={selectedElement.boxShadow || ''}
							class="w-full rounded border px-2 py-1 text-sm"
							placeholder="0px 2px 4px rgba(0,0,0,0.1)"
							onchange={(e) => handlePropertyChange('boxShadow', e.currentTarget.value)}
						/>
					</div>
					<div>
						<span class="block text-sm text-gray-600">Background Color</span>
						<input
							data-testid="input-background-color"
							type="color"
							value={selectedElement.backgroundColor || '#ffffff'}
							class="h-8 w-full rounded border px-2 py-1 text-sm"
							oninput={(e) => handlePropertyChange('backgroundColor', e.currentTarget.value)}
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
	</div>
{/if}
