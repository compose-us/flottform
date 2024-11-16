<script lang="ts">
	import { base } from '$app/paths';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="max-w-screen-lg mx-auto p-8 box-border grid grid-cols-1 gap-8 result">
	<h1>Done uploading!</h1>

	{#if form?.success}
		<p>Upload done ✅</p>
		<p>Following information was transmitted:</p>
		<ol class="grid grid-cols-1 gap-4">
			<li>Name: {form.name}</li>
			<li>Surname: {form.surname}</li>
			<li>Email: {form.email}</li>
			<li>Phone: {form.phone}</li>
			<li>About me: {form.presentation}</li>
			<li><a href="/uploads/{form.filenameDoc}" target="_blank">File you've uploaded</a></li>
			<img src="/uploads/{form.filenameDoc}" alt="Preview for uploaded file" class="w-40 h-auto" />
		</ol>
	{:else if form?.error}
		<p>Upload failed ❌: {form.message}</p>
	{/if}
	<div>
		<a
			href="{base}/"
			class="block group relative w-fit cursor-pointer overflow-hidden rounded-md border bg-white text-blue border-[#ed8ee5] px-12 py-3"
		>
			<span
				class="ease absolute top-1/2 h-0 w-64 origin-center -translate-x-20 rotate-45 bg-[#ed8ee5] transition-all duration-300 group-hover:h-64 group-hover:-translate-y-32"
			></span>
			<span class="ease relative transition duration-300 group-hover:text-white"
				>Start a new demo</span
			>
		</a>
	</div>
	<p class="mt-6 italic">
		All uploaded files will be deleted after a short period of time. While we do not store them
		permanently and clean up often, please do not upload anything confidential or otherwise
		problematic.
	</p>
</div>

<style>
	.result {
		color: #051e0c;
		font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial,
			sans-serif;
	}
	h1 {
		font-family: 'Unbounded';
		font-weight: 800;
	}
</style>
