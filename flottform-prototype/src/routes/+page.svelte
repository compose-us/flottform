<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import initFlottform from '$lib/flottform/flottform';
	import Button from '$lib/components/Button.svelte';

	let dragTarget = false;

	function handleDrag(e: Event) {
		dragTarget = true;
	}

	onMount(() => {
		const fileInputFields = document.querySelectorAll(
			'input[type=file]'
		) as NodeListOf<HTMLInputElement>;
		initFlottform(fileInputFields);
	});
</script>

<div class="fullWidthSection">
	<h1>Flottform prototype</h1>
	<p>This is a generic form that allows uploading of a file.</p>

	<form action="{base}/upload" method="POST" enctype="multipart/form-data">
		<div>
			<label for="message">A custom message</label>
			<input id="message" type="text" name="message" />
		</div>
		<div class="inputWrapper">
			<label for="document">Upload your document</label>
			<input
				id="document"
				type="file"
				name="document"
				class:drag={dragTarget}
				required
				on:drop={(e) => {
					dragTarget = false;
					e.dataTransfer?.files;
				}}
				on:dragenter={(e) => handleDrag(e)}
			/>
			<!-- <div class="dragElement">Or drag your file here</div> -->
		</div>
		<div>
			<label for="document2">Upload your second document</label>
			<input id="document2" type="file" name="document2" required />
		</div>
		<Button type="submit" label="Send" />
	</form>
</div>

<style>
	form {
		display: grid;
		gap: 2rem;
		width: max-content;
	}
	div {
		display: grid;
	}
	input {
		padding: 0.25rem 0.5rem;
		border: 2px solid deeppink;
		border-radius: 5px;
		background-color: #ff6ec517;
	}
	input[type='file'] {
		height: 5rem;
	}
	.inputWrapper {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.dragElement {
		position: absolute;
		top: 50%;
	}
	.fullWidthSection {
		padding: 1rem 6rem;
		max-width: 1280px;
	}
	.drag {
		border: 3px dotted deeppink;
	}
	:global(.qrCodeButton) {
		background: linear-gradient(40deg, #d380fc, rgb(201, 70, 249));
		padding: 0.5rem 0.75rem;
		color: #fff;
		font-weight: 700;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		display: inline-block;
	}
	:global(.qrCodeWrapper) {
		display: flex;
		flex-direction: column-reverse;
	}
</style>
