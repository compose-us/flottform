<script lang="ts">
	import { base } from '$app/paths';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<p>Done uploading!</p>

{#if form?.success}
	<p>Upload done. Following information was transmitted:</p>
	<ol>
		<li>Name: {form.name}</li>
		<li>Surname: {form.surname}</li>
		<li>Email: {form.email}</li>
		<li>Phone: {form.phone}</li>
		<li>Street: {form.street}</li>
		<li>House number: {form.houseNumber}</li>
		<li>City: {form.city}</li>
		<li>Postcode: {form.postcode}</li>
		<li>Problem description: {form.problemDescription}</li>
		<li><a href="/uploads/{form.filenameDoc}" target="_blank">File you've uploaded</a></li>
	</ol>
{:else if form?.error}
	<p>Upload failed: {form.message}</p>
{/if}

<p><a href="{base}/">Start a new demo</a></p>

<pre>{JSON.stringify(form, null, 2)}</pre>
