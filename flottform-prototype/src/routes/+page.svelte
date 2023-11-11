<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import initFlottform from '$lib/flottform/flottform';

	onMount(() => {
		const fileInputFields = document.querySelectorAll(
			'input[type=file]'
		) as NodeListOf<HTMLInputElement>;
		initFlottform(fileInputFields);
	});
</script>

<h1>Flottform prototype</h1>
<p>This is a generic form that allows uploading of a file.</p>

<form action="{base}/upload" method="POST" enctype="multipart/form-data">
	<div>
		<label for="message">A custom message</label>
		<input id="message" type="text" name="message" />
	</div>
	<div>
		<label for="document">Upload your document</label>
		<input id="document" type="file" name="document" required />
	</div>
	<div>
		<label for="document2">Upload your second document</label>
		<input id="document2" type="file" name="document2" required />
	</div>
	<button type="submit">Send</button>
</form>

<style>
	form {
		display: grid;
		gap: 2rem;
		width: max-content;
	}
	div {
		display: grid;
	}
</style>
