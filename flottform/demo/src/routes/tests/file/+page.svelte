<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { createFlottformInput } from '@flottform/forms';
	import FileInput from '$lib/components/FileInput.svelte';
	import { createClientUrl, sdpExchangeServerBase } from '../../../api';

	let fileInput: HTMLInputElement;

	onMount(async () => {
		const fileInputFields = document.querySelectorAll(
			'input[type=file]'
		) as NodeListOf<HTMLInputElement>;
		const { createChannel } = createFlottformInput({
			flottformApi: sdpExchangeServerBase,
			createClientUrl,
			inputField: fileInputFields[0]
		});
	});
</script>

<svelte:head>
	<title>Flottform DEMO</title>
</svelte:head>

<div class="max-w-screen-xl mx-auto p-8 box-border grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-0">
	<div class="sm:col-span-2 order-2 md:order-1 gap-4 flex flex-col">
        <h1>Test page to send files</h1>
		<form action="{base}/upload" method="POST" enctype="multipart/form-data">
			<FileInput id="document" name="document" {fileInput} />
			<button
				type="submit"
				class="group relative w-fit cursor-pointer overflow-hidden rounded-md border-2 border-primary-blue px-12 py-3 font-semibold"
			>
				<span
					class="ease absolute top-1/2 h-0 w-64 origin-center -translate-x-20 rotate-45 bg-primary-blue transition-all duration-300 group-hover:h-64 group-hover:-translate-y-32"
				/>
				<span class="ease relative transition duration-300 group-hover:text-white">Send</span>
			</button>
		</form>
	</div>
</div>
