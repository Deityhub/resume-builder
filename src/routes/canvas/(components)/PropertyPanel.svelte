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
	import { CANVAS_WIDTH, CANVAS_HEIGHT } from '$lib/const/dimension';
	import { slide } from 'svelte/transition';
	import Button from '$lib/components/Button.svelte';
	import { Trash2 } from '@lucide/svelte';
	import { NumberInput, Select, ColorInput, Input } from '$lib/components';

	const selectedElement = $derived(appStore.getSelectedElement());
	const pages = $derived(appStore.getPages());
	const currentPage = $derived(selectedElement ? pages[selectedElement.pageId] : undefined);

	const minX = $derived(currentPage ? currentPage.boundaries.horizontal.start : 0);
	const maxX = $derived(currentPage ? currentPage.boundaries.horizontal.end : CANVAS_WIDTH);
	const minY = $derived(currentPage ? currentPage.boundaries.vertical.start : 0);
	const maxY = $derived(currentPage ? currentPage.boundaries.vertical.end : CANVAS_HEIGHT);

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
		class="w-80 overflow-y-auto border-l border-border bg-background p-4 max-lg:absolute max-lg:bottom-0 max-lg:left-0 max-lg:z-9999 max-lg:h-[15vh] max-lg:w-full max-lg:overflow-y-hidden lg:pt-30"
		data-testid="property-panel"
	>
		<div class="mb-6 space-y-4 max-lg:flex max-lg:items-center max-lg:gap-2">
			<h3
				class="mb-4 text-lg font-semibold text-foreground max-lg:hidden"
				data-testid="property-panel-title"
			>
				{selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Properties
			</h3>

			<!-- Position and Size -->
			<div class="space-y-2">
				<h4 class="font-medium text-foreground">Position & Size</h4>
				<div class="grid grid-cols-2 gap-2 max-lg:flex">
					<div class="max-lg:min-w-[10rem]">
						<NumberInput
							value={selectedElement.x}
							handleInput={(value) => handlePropertyChange('x', value)}
							min={minX}
							max={maxX}
							testId="input-x"
							label="X"
						/>
					</div>
					<div class="max-lg:min-w-[10rem]">
						<NumberInput
							value={selectedElement.y}
							handleInput={(value) => handlePropertyChange('y', value)}
							min={minY}
							max={maxY}
							testId="input-y"
							label="Y"
						/>
					</div>
					<div class="max-lg:min-w-[10rem]">
						<NumberInput
							value={selectedElement.width}
							handleInput={(value) => handlePropertyChange('width', value)}
							testId="input-width"
							label="Width"
						/>
					</div>
					<div class="max-lg:min-w-[10rem]">
						<NumberInput
							value={selectedElement.height}
							handleInput={(value) => handlePropertyChange('height', value)}
							testId="input-height"
							label="Height"
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
						className="max-lg:min-w-[8rem]"
					>
						Move Forward
					</Button>
					<Button
						data-testid="send-backward-btn"
						onClick={() => appStore.moveBackward(selectedElement.id, selectedElement.pageId)}
						size="xs"
						disabled={selectedElement.zIndex <= 0}
						className="max-lg:min-w-[8rem]"
					>
						Move Backward
					</Button>
				</div>
			</div>

			<!-- Text Properties -->
			{#if selectedElement.type === 'text'}
				<div class="space-y-2">
					<h4 class="font-medium text-foreground">Text Properties</h4>
					<div class="flex flex-col gap-2 max-lg:flex-row">
						<div class="max-lg:min-w-[10rem]">
							<Select
								value={selectedElement.fontFamily}
								onChange={(value) => handlePropertyChange('fontFamily', value)}
								testId="select-font-family"
								options={fontFamilies.map((font) => ({
									value: font,
									label: font,
									fontFamily: font
								}))}
								label="Font Family"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
							<NumberInput
								value={selectedElement.fontSize}
								handleInput={(value) => handlePropertyChange('fontSize', value)}
								options={fontSizes.map((size) => ({ label: size.toString(), value: size }))}
								testId="select-font-size"
								label="Font Size"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
							<Select
								value={selectedElement.fontWeight}
								onChange={(value) => handlePropertyChange('fontWeight', value)}
								testId="select-font-weight"
								options={[...fontWeights]}
								label="Font Weight"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
							<Select
								value={selectedElement.fontStyle}
								onChange={(value) => handlePropertyChange('fontStyle', value)}
								testId="select-font-style"
								options={[...fontStyles]}
								label="Font Style"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
							<Select
								value={selectedElement.textDecoration || 'none'}
								onChange={(value) => handlePropertyChange('textDecoration', value)}
								testId="select-text-decoration"
								options={[...textDecorations]}
								label="Text Decoration"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
							<Select
								value={selectedElement.textTransform || 'none'}
								onChange={(value) => handlePropertyChange('textTransform', value)}
								testId="select-text-transform"
								options={[...textTransforms]}
								label="Text Transform"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
							<ColorInput
								value={selectedElement.color}
								onChange={(value) => handlePropertyChange('color', value)}
								testId="input-color"
								label="Color"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
							<Select
								value={selectedElement.textAlign || 'left'}
								onChange={(value) => handlePropertyChange('textAlign', value)}
								testId="select-text-alignment"
								options={[...textAlignments]}
								label="Text Alignment"
							/>
						</div>
					</div>
				</div>
			{/if}

			<!-- Shape Properties -->
			{#if selectedElement.type === 'shape'}
				<div class="space-y-2">
					<h4 class="font-medium text-foreground">Shape Properties</h4>
					<div class="flex flex-col gap-2 max-lg:flex-row">
						<div class="max-lg:min-w-[10rem]">
							<Select
								value={selectedElement.shapeType}
								onChange={(value) => handlePropertyChange('shapeType', value)}
								testId="select-shape-type"
								options={[...shapeTypes]}
								label="Shape Type"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
							<ColorInput
								value={selectedElement.strokeColor}
								onChange={(value) => handlePropertyChange('strokeColor', value)}
								testId="input-stroke-color"
								label="Stroke Color"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
							<span class="text-background-foreground block text-sm">Stroke Weight</span>
							<NumberInput
								value={selectedElement.strokeWidth}
								handleInput={(value) => handlePropertyChange('strokeWidth', value)}
								testId="input-stroke-weight"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
							<Select
								value={selectedElement.strokeStyle || 'solid'}
								onChange={(value) => handlePropertyChange('strokeStyle', value)}
								testId="select-stroke-style"
								options={[...strokeStyles]}
								label="Stroke Style"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
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
						<div class="max-lg:min-w-[10rem]">
							<ColorInput
								value={selectedElement.fillColor || '#ffffff'}
								onChange={(value) => handlePropertyChange('fillColor', value)}
								testId="input-fill-color"
								label="Fill Color"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
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
							<div class="max-lg:min-w-[10rem]">
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
						<div class="max-lg:min-w-[10rem]">
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
					<div class="flex flex-col gap-2 max-lg:flex-row">
						<div class="max-lg:min-w-[10rem]">
							<Input
								type="url"
								value={selectedElement.src}
								onChange={(value) => handlePropertyChange('src', value)}
								testId="input-image-src"
								label="Image URL"
								placeholder="https://example.com/image.jpg"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
							<Select
								value={selectedElement.objectFit || 'contain'}
								onChange={(value) => handlePropertyChange('objectFit', value)}
								testId="select-object-fit"
								options={[...objectFitOptions]}
								label="Object Fit"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
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
						<div class="max-lg:min-w-[10rem]">
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
						<div class="max-lg:min-w-[10rem]">
							<ColorInput
								value={selectedElement.borderColor || '#000000'}
								onChange={(value) => handlePropertyChange('borderColor', value)}
								testId="input-border-color"
								label="Border Color"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
							<NumberInput
								value={selectedElement.borderWidth || 0}
								handleInput={(value) => handlePropertyChange('borderWidth', value)}
								testId="input-border-width"
								max={20}
								label="Border Width"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
							<Select
								value={selectedElement.borderStyle || 'solid'}
								onChange={(value) => handlePropertyChange('borderStyle', value)}
								testId="select-border-style"
								options={[...borderStyles]}
								label="Border Style"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
							<Input
								value={selectedElement.boxShadow || ''}
								onChange={(value) => handlePropertyChange('boxShadow', value)}
								testId="input-box-shadow"
								label="Box Shadow"
								placeholder="0px 2px 4px rgba(0,0,0,0.1)"
							/>
						</div>
						<div class="max-lg:min-w-[10rem]">
							<ColorInput
								value={selectedElement.backgroundColor || '#ffffff'}
								onChange={(value) => handlePropertyChange('backgroundColor', value)}
								testId="input-background-color"
								label="Background Color"
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
					className="max-lg:min-w-[12rem]"
				>
					<Trash2 class="mr-2 h-4 w-4" />
					Delete Element
				</Button>
			</div>
		</div>
	</div>
{/if}
