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
	<div class="formSection">
		<h1>Flottform prototype</h1>
		<p>This is a generic form that allows uploading of a file.</p>

		<form action="{base}/upload" method="POST" enctype="multipart/form-data">
			<div>
				<label for="message">A custom message</label>
				<input id="message" type="text" name="message" />
			</div>

			<div>
				<label for="document" class="fileinput"
					>Drag and drop or click here to upload your document
				</label>
				<div class="dropField">
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

					<svg
						class="uploadIcon"
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
			<div>
				<div>
					<label for="document2" class="fileinput"
						>Drag and drop or click here to upload your document2
					</label>
					<div class="dropField">
						<input
							id="document2"
							type="file"
							name="document2"
							class:drag={dragTarget}
							required
							on:drop={(e) => {
								dragTarget = false;
								e.dataTransfer?.files;
							}}
							on:dragenter={(e) => handleDrag(e)}
						/>

						<svg
							class="uploadIcon"
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
			</div>
			<Button type="submit" label="Send" />
		</form>
	</div>
</div>

<style>
	form {
		display: grid;
		gap: 2rem;
		width: max-content;
	}
	h1 {
		font-weight: 800;
	}
	div {
		display: grid;
	}
	input,
	.dropField {
		padding: 0.25rem 0.5rem;
		border: 2px solid var(--cus-color-blue);
		border-radius: 8px;
		background-color: #fff;
		box-sizing: border-box;
	}
	input[type='file'] {
		text-align: center;
		position: absolute;
		inset: 0;
		opacity: 0;
		width: 100%;
		height: 100%;
	}
	.dropField {
		height: 7rem;
		width: 20rem;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.uploadIcon {
		width: 1.5rem;
		height: 1.5rem;
		fill: var(--cus-color-blue);
		opacity: 0.8;
	}
	.fileinput {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.fullWidthSection {
		margin: 0 auto;
		max-width: 1280px;
	}
	.formSection {
		padding: 0 2rem;
	}
	.drag {
		border: 3px dotted var(--cus-color-blue);
	}
	:global(.qrCodeButton) {
		background: var(--cus-color-blue);
		padding: 0.5rem 0.75rem;
		color: #fff;
		font-weight: 700;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		display: inline-block;
	}
	:global(.qrCodeWrapper) {
		margin-bottom: 1rem;
	}
</style>
