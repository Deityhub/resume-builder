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
	import Button from '$lib/components/Button.svelte';
	import { Trash2 } from '@lucide/svelte';
	import { NumberInput } from '$lib/components';

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
		class="w-80 overflow-y-auto border-l border-border bg-background p-4"
		data-testid="property-panel"
	>
		<div class="mb-6 space-y-4">
			<h3 class="mb-4 text-lg font-semibold text-foreground" data-testid="property-panel-title">
				{selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Properties
			</h3>

			<!-- Position and Size -->
			<div class="space-y-2">
				<h4 class="font-medium text-foreground">Position & Size</h4>
				<div class="grid grid-cols-2 gap-2">
					<div>
						<span class="text-background-foreground block text-sm">X</span>
						<NumberInput
							value={selectedElement.x}
							handleInput={(value) => handlePropertyChange('x', value)}
							testId="input-x"
						/>
					</div>
					<div>
						<span class="text-background-foreground block text-sm">Y</span>
						<NumberInput
							value={selectedElement.y}
							handleInput={(value) => handlePropertyChange('y', value)}
							testId="input-y"
						/>
					</div>
					<div>
						<span class="text-background-foreground block text-sm">Width</span>
						<NumberInput
							value={selectedElement.width}
							handleInput={(value) => handlePropertyChange('width', value)}
							testId="input-width"
						/>
					</div>
					<div>
						<span class="text-background-foreground block text-sm">Height</span>
						<NumberInput
							value={selectedElement.height}
							handleInput={(value) => handlePropertyChange('height', value)}
							testId="input-height"
						/>
					</div>
				</div>
			</div>

			<!-- Layering -->
			<div class="space-y-2">
				<h4 class="font-medium text-foreground">Element Layering</h4>
				<div class="flex items-center gap-2">
					<span class="text-background-foreground block text-sm"
						>Z-Index Layer: {selectedElement.zIndex}</span
					>
				</div>
				<div class="flex gap-2">
					<Button
						data-testid="bring-forward-btn"
						onClick={() => appStore.moveForward(selectedElement.id, selectedElement.pageId)}
						size="xs"
						disabled={selectedElement.zIndex >=
							appStore.getPageElements(selectedElement.pageId).length - 1}
					>
						Move Forward
					</Button>
					<Button
						data-testid="send-backward-btn"
						onClick={() => appStore.moveBackward(selectedElement.id, selectedElement.pageId)}
						size="xs"
						disabled={selectedElement.zIndex <= 0}
					>
						Move Backward
					</Button>
				</div>
			</div>

			<!-- Text Properties -->
			{#if selectedElement.type === 'text'}
				<div class="space-y-2">
					<h4 class="font-medium text-foreground">Text Properties</h4>
					<div class="flex flex-col gap-2">
						<div>
							<span class="text-background-foreground block text-sm">Font Family</span>
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
							<span class="text-background-foreground block text-sm">Font Size</span>
							<NumberInput
								value={selectedElement.fontSize}
								handleInput={(value) => handlePropertyChange('fontSize', value)}
								options={fontSizes.map((size) => ({ label: size.toString(), value: size }))}
								testId="select-font-size"
							/>
						</div>
						<div>
							<span class="text-background-foreground block text-sm">Font Weight</span>
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
							<span class="text-background-foreground block text-sm">Font Style</span>
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
							<span class="text-background-foreground block text-sm">Text Decoration</span>
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
							<span class="text-background-foreground block text-sm">Text Transform</span>
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
							<span class="text-background-foreground block text-sm">Color</span>
							<input
								data-testid="input-color"
								type="color"
								value={selectedElement.color}
								class="h-8 w-full rounded border px-2 py-1 text-sm"
								oninput={(e) => handlePropertyChange('color', e.currentTarget.value)}
							/>
						</div>
						<div>
							<span class="text-background-foreground block text-sm">Text Alignment</span>
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
				</div>
			{/if}

			<!-- Shape Properties -->
			{#if selectedElement.type === 'shape'}
				<div class="space-y-2">
					<h4 class="font-medium text-foreground">Shape Properties</h4>
					<div class="flex flex-col gap-2">
						<div>
							<span class="text-background-foreground block text-sm">Shape Type</span>
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
							<span class="text-background-foreground block text-sm">Stroke Color</span>
							<input
								data-testid="input-stroke-color"
								type="color"
								value={selectedElement.strokeColor}
								class="h-8 w-full rounded border px-2 py-1 text-sm"
								oninput={(e) => handlePropertyChange('strokeColor', e.currentTarget.value)}
							/>
						</div>
						<div>
							<span class="text-background-foreground block text-sm">Stroke Weight</span>
							<NumberInput
								value={selectedElement.strokeWidth}
								handleInput={(value) => handlePropertyChange('strokeWidth', value)}
								testId="input-stroke-weight"
							/>
						</div>
						<div>
							<span class="text-background-foreground block text-sm">Stroke Style</span>
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
							<span class="text-background-foreground block text-sm">Stroke Opacity</span>
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
							<span class="text-background-foreground block text-sm"
								>{((selectedElement.strokeOpacity || 1) * 100).toFixed(0)}%</span
							>
						</div>
						<div>
							<span class="text-background-foreground block text-sm">Fill Color</span>
							<input
								data-testid="input-fill-color"
								type="color"
								value={selectedElement.fillColor || '#ffffff'}
								class="h-8 w-full rounded border px-2 py-1 text-sm"
								oninput={(e) => handlePropertyChange('fillColor', e.currentTarget.value)}
							/>
						</div>
						<div>
							<span class="text-background-foreground block text-sm">Fill Opacity</span>
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
							<span class="text-background-foreground block text-sm"
								>{((selectedElement.fillOpacity || 0) * 100).toFixed(0)}%</span
							>
						</div>
						{#if selectedElement.shapeType === 'rectangle'}
							<div>
								<span class="text-background-foreground block text-sm">Corner Radius</span>
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
								<span class="text-background-foreground block text-sm"
									>{selectedElement.cornerRadius || 0}%</span
								>
							</div>
						{/if}
						<div>
							<span class="text-background-foreground block text-sm">Rotation</span>
							<input
								data-testid="input-rotation"
								type="range"
								min="0"
								max="360"
								value={selectedElement.rotation || 0}
								class="w-full"
								oninput={(e) => handlePropertyChange('rotation', parseInt(e.currentTarget.value))}
							/>
							<span class="text-background-foreground block text-sm"
								>{selectedElement.rotation || 0}°</span
							>
						</div>
					</div>
				</div>
			{/if}

			<!-- Image Properties -->
			{#if selectedElement.type === 'image'}
				<div class="space-y-2">
					<h4 class="font-medium text-foreground">Image Properties</h4>
					<div class="flex flex-col gap-2">
						<div>
							<span class="text-background-foreground block text-sm">Image URL</span>
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
							<span class="text-background-foreground block text-sm">Alt Text</span>
							<input
								data-testid="input-image-alt"
								type="text"
								value={selectedElement.alt}
								class="w-full rounded border px-2 py-1 text-sm"
								onchange={(e) => handlePropertyChange('alt', e.currentTarget.value)}
							/>
						</div>
						<div>
							<span class="text-background-foreground block text-sm">Object Fit</span>
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
							<span class="text-background-foreground block text-sm">Border Radius</span>
							<input
								data-testid="input-border-radius"
								type="range"
								min="0"
								max="100"
								value={selectedElement.borderRadius || 0}
								class="w-full"
								oninput={(e) =>
									handlePropertyChange('borderRadius', parseInt(e.currentTarget.value))}
							/>
							<span class="text-background-foreground block text-sm"
								>{selectedElement.borderRadius || 0}%</span
							>
						</div>
						<div>
							<span class="text-background-foreground block text-sm">Opacity</span>
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
							<span class="text-background-foreground block text-sm"
								>{((selectedElement.opacity || 1) * 100).toFixed(0)}%</span
							>
						</div>
						<div>
							<span class="text-background-foreground block text-sm">Border Color</span>
							<input
								data-testid="input-border-color"
								type="color"
								value={selectedElement.borderColor || '#000000'}
								class="h-8 w-full rounded border px-2 py-1 text-sm"
								oninput={(e) => handlePropertyChange('borderColor', e.currentTarget.value)}
							/>
						</div>
						<div>
							<span class="text-background-foreground block text-sm">Border Width</span>
							<NumberInput
								value={selectedElement.borderWidth || 0}
								handleInput={(value) => handlePropertyChange('borderWidth', value)}
								testId="input-border-width"
								max={20}
							/>
						</div>
						<div>
							<span class="text-background-foreground block text-sm">Border Style</span>
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
							<span class="text-background-foreground block text-sm">Box Shadow</span>
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
							<span class="text-background-foreground block text-sm">Background Color</span>
							<input
								data-testid="input-background-color"
								type="color"
								value={selectedElement.backgroundColor || '#ffffff'}
								class="h-8 w-full rounded border px-2 py-1 text-sm"
								oninput={(e) => handlePropertyChange('backgroundColor', e.currentTarget.value)}
							/>
						</div>
					</div>
				</div>
			{/if}

			<!-- Delete Button -->
			<div class="pt-4">
				<Button
					data-testid="delete-element-btn"
					onClick={() => appStore.deleteElement(selectedElement.id, selectedElement.pageId)}
					variant="destructive"
					fullWidth
				>
					<Trash2 class="mr-2 h-4 w-4" />
					Delete Element
				</Button>
			</div>
		</div>
	</div>
{/if}
