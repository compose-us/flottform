<script lang="ts">
	import FlottformButton from './FlottformButton.svelte';

	let nameInput: HTMLInputElement;
	let descriptionText: HTMLTextAreaElement;
	let fileField: HTMLInputElement;
</script>

<form>
	<div class="grid gap-4 max-w-screen-sm mx-auto">
		<div class="grid gap-2">
			<label class="grid" for="name">Name</label>
			<input bind:this={nameInput} type="text" class="border rounded" id="name" />
			<FlottformButton resultField={nameInput} />
		</div>
		<div class="grid gap-2">
			<label for="description">Description</label>
			<textarea bind:this={descriptionText} class="border rounded" id="description" />
		</div>
		<div class="grid gap-2">
			<label for="file">Upload your file</label>
			<input bind:this={fileField} type="file" class="border rounded" id="file" />
		</div>

		<button type="submit" class="border rounded w-fit p-2">Submit</button>
	</div>
</form>
