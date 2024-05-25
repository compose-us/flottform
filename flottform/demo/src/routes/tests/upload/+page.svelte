<script lang="ts">
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="max-w-screen-lg mx-auto p-8 box-border grid grid-cols-1 gap-8">
	<h1>Done uploading!</h1>

	{#if form?.success}
		<h2>Upload done ✅</h2>
	{:else if form?.error}
		<h2>Upload failed ❌: {form.message}</h2>
	{/if}
</div>
