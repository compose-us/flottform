<script lang="ts">
	import { base } from '$app/paths';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<p>Done uploading!</p>

{#if form?.success}
	<p>Upload done. Following information was transmitted:</p>
	<ol>
		<li>Custom message: {form?.message}</li>
		<li><a href="/uploads/{form?.filenameDoc1}" target="_blank">Document 1</a></li>
		<li><a href="/uploads/{form?.filenameDoc2}" target="_blank">Document 2</a></li>
	</ol>
{:else if form?.error}
	<p>Upload failed: {form.message}</p>
{/if}

<p><a href="{base}/">Start a new demo</a></p>

<pre>{JSON.stringify(form, null, 2)}</pre>