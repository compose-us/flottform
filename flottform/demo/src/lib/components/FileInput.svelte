<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		id,
		name,
		fileInput,
		label = 'Please upload a photo of a broken part',
		class: inputClass = '',
		...rest
	} = $props<
		{
			id: string;
			name: string;
			fileInput: HTMLInputElement;
			label?: string;
			class?: string;
			children?: any;
		} & HTMLAttributes<HTMLInputElement>
	>();

	let dragTarget = $state(false);
	function handleDrag(e: Event) {
		dragTarget = true;
	}

	let previewImage: string | null | undefined = $state(undefined);

	const previewUploadedImage = () => {
		const file = fileInput.files;
		if (file) {
			const fileReader = new FileReader();
			fileReader.onload = () => {
				previewImage = fileReader.result as string;
			};
			fileReader.readAsDataURL(file[0]);
		}
	};
	$effect(() => {
		console.log(previewImage);
	});
</script>

<div>
	{#if previewImage}
		<img src={previewImage} alt="Preview" class="h-48 w-full max-w-80" />
	{/if}
	<label for={id}>{label}</label>
	<div class="h-24 w-full max-w-80 relative flex items-center justify-center border-primary-blue">
		<input
			class="text-center absolute inset-0 w-full max-w-80 h-full bg-transparent border-2 box-border border-primary-blue rounded-md py-2 px-4 {inputClass}"
			{name}
			{id}
			{...rest}
			bind:this={fileInput}
			type="file"
			class:drag={dragTarget}
			required
			on:drop={(e) => {
				dragTarget = false;
				e.dataTransfer?.files;
			}}
			on:dragenter={(e) => handleDrag(e)}
			on:change={previewUploadedImage}
		/>
		<svg
			class="w-6 h-6 fill-primary-blue opacity-80"
			fill="#000000"
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			viewBox="0 0 374.116 374.116"
			xml:space="preserve"
		>
			<path
				d="M344.058,207.506c-16.568,0-30,13.432-30,30v76.609h-254v-76.609c0-16.568-13.432-30-30-30c-16.568,0-30,13.432-30,30
    v106.609c0,16.568,13.432,30,30,30h314c16.568,0,30-13.432,30-30V237.506C374.058,220.938,360.626,207.506,344.058,207.506z"
			/>
			<path
				d="M123.57,135.915l33.488-33.488v111.775c0,16.568,13.432,30,30,30c16.568,0,30-13.432,30-30V102.426l33.488,33.488
    c5.857,5.858,13.535,8.787,21.213,8.787c7.678,0,15.355-2.929,21.213-8.787c11.716-11.716,11.716-30.71,0-42.426L208.271,8.788
    c-11.715-11.717-30.711-11.717-42.426,0L81.144,93.489c-11.716,11.716-11.716,30.71,0,42.426
    C92.859,147.631,111.855,147.631,123.57,135.915z"
			/>
		</svg>
	</div>
</div>

<style lang="postcss">
	.drag {
		@apply border-2 border-dotted border-primary-blue;
	}
</style>
