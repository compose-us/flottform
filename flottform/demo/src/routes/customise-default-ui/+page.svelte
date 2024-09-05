<script lang="ts">
	import { onMount } from 'svelte';
	import { defaultThemeForFileInput, FlottformFileInputHost } from '@flottform/forms';
	import { sdpExchangeServerBase, createClientUrl } from '../../api';

	import backgroundImage from './undraw.svg';

	let flottformAnchor: HTMLElement;

	onMount(async () => {
		const fileInputs = document.querySelectorAll(
			'input[type=file]'
		) as NodeListOf<HTMLInputElement>;
		for (const file of fileInputs) {
			const flottformFileInputHost = new FlottformFileInputHost({
				flottformApi: sdpExchangeServerBase,
				createClientUrl,
				inputField: file,
				theme: defaultThemeForFileInput(flottformAnchor, {
					flottformRootTitle: 'Upload your CV from another device'
				})
			});
		}
	});
</script>

<div class="max-w-screen-xl h-svh">
	<div class="grid grid-cols-3 gap-8 h-full">
		<div class="bg-gray-100 w-full flex">
			<img src={backgroundImage} alt="Background" class="self-end h-auto max-h-96" />
		</div>
		<form action="#" class="col-span-2 py-14 grid grid-cols-2 gap-y-4 gap-x-12 auto-rows-min px-6">
			<h2 class="col-span-2">Let us know you better</h2>
			<div class="flex flex-col gap-2">
				<label for="name">Name</label>
				<input
					type="text"
					name="name"
					id="name"
					class="border rounded px-4 py-2 border-[#051e0c]"
				/>
			</div>
			<div class="flex flex-col gap-2">
				<label for="surname">Surname</label>
				<input
					type="text"
					name="surname"
					id="surname"
					class="border rounded px-4 py-2 border-[#051e0c]"
				/>
			</div>
			<div class="flex flex-col gap-2">
				<label for="phone">Phone</label>
				<input
					type="tel"
					name="phone"
					id="phone"
					class="border rounded px-4 py-2 border-[#051e0c]"
				/>
			</div>
			<div class="flex flex-col gap-2">
				<label for="email">Email</label>
				<input
					type="email"
					name="email"
					id="email"
					class="border rounded px-4 py-2 border-[#051e0c]"
				/>
			</div>
			<div class="flex flex-col gap-2 col-span-2">
				<label for="presentation">Tell us a bit about yourself</label>
				<textarea
					rows="5"
					name="presentation"
					id="presentation"
					class="border rounded px-4 py-2 border-[#051e0c]"
				></textarea>
			</div>
			<div class="flex flex-col gap-2">
				<label for="cv">Please upload your CV</label>
				<input name="cv" id="cv" type="file" class="border rounded px-4 py-2 border-[#051e0c]" />
			</div>
			<div class="relative">
				<div bind:this={flottformAnchor} class="flottform-anchor"></div>
			</div>
			<div class="col-start-2 flex gap-8 justify-end row-start-12">
				<button type="reset" class="rounded px-4 py-2 bg-[#27dc49] w-min font-bold">Reset</button>
				<button type="submit" class="rounded px-4 py-2 bg-[#ed8ee5] w-min font-bold">Send</button>
			</div>
		</form>
	</div>
</div>

<style lang="postcss">
	.flottform-anchor {
		position: absolute;
		top: 25px;
		--flottform-main-color: #051e0c;
		--flottform-border-color: #051e0c;
		--flottform-root-border-radius: 0.25rem;
		--flottform-elements-max-height: 20rem;
		--flottform-webrtc-button-background: #ed8ee5;
		--flottform-webrtc-button-color: #051e0c;
		--flottform-buttons-border-radius: 0.25rem;
		--flottform-status-bar-gradient-from: #ed8ee5;
		--flottform-status-bar-gradient-to: #27dc49;
	}
	form {
		color: #051e0c;
		font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial,
			sans-serif;
	}
	h2 {
		font-family: 'Unbounded';
		font-weight: 800;
	}
</style>
