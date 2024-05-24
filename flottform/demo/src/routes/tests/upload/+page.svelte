<script lang="ts">
	import { base } from '$app/paths';
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
	<div>
		<a
			href="{base}/"
			class="block group relative w-fit cursor-pointer overflow-hidden rounded-md border bg-white text-blue border-primary-blue px-12 py-3"
		>
			<span
				class="ease absolute top-1/2 h-0 w-64 origin-center -translate-x-20 rotate-45 bg-primary-blue transition-all duration-300 group-hover:h-64 group-hover:-translate-y-32"
			/>
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
