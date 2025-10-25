<script lang="ts">
	import { Modal } from '$lib/components';

	interface NameModalProps {
		isOpen: boolean;
		initialName?: string;
		onClose: () => void;
		onSave: (name: string) => void;
	}

	const { isOpen, initialName = '', onClose, onSave }: NameModalProps = $props();

	let name = $state(initialName);
	let error = $state('');

	function handleSave() {
		if (!name.trim()) {
			error = 'Please enter a name.';
			return;
		}
		error = '';
		onSave(name.trim());
	}

	function handleCancel() {
		onClose();
	}
</script>

{#if isOpen}
	<Modal
		open={true}
		title="Name Your Resume"
		description="Enter a name for your resume."
		onCancel={handleCancel}
		onAccept={handleSave}
		acceptLabel="Save"
		cancelLabel="Cancel"
		disableActions={false}
	>
		<input
			class="w-full rounded border border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none"
			type="text"
			bind:value={name}
			placeholder="e.g. Product Designer Resume"
			maxlength="64"
			data-autofocus
		/>
		{#if error}
			<div class="text-sm text-red-500">{error}</div>
		{/if}
	</Modal>
{/if}
