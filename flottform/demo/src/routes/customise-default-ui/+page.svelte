<script lang="ts">
	import { onMount } from 'svelte';
	import { createDefaultFlottformComponent } from '@flottform/forms';
	import { sdpExchangeServerBase, createClientUrl } from './api';

	import backgroundImage from './undraw.svg';

	let flottformAnchor: HTMLElement;

	onMount(async () => {
		const fileInputs = document.querySelectorAll(
			'input[type=file]'
		) as NodeListOf<HTMLInputElement>;
		const flottformComponent = createDefaultFlottformComponent({
			flottformAnchorElement: flottformAnchor
		});
		for (const file of fileInputs) {
			flottformComponent.createFileItem({
				flottformApi: sdpExchangeServerBase,
				createClientUrl,
				inputField: file,
				label: 'Your CV',
				onSuccessText: 'You have successfully uploaded your CV'
			});
		}
	});
</script>

<div class="flex flex-col min-h-svh">
	<div class="md:grid md:grid-cols-3 gap-8 h-full max-w-screen-xl flex-1">
		<div class="bg-gray-100 w-full hidden md:flex">
			<img src={backgroundImage} alt="Background" class="self-end h-auto max-h-96" />
		</div>
		<form
			action="#"
			class="md:col-span-2 py-14 grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-x-12 auto-rows-min px-6"
		>
			<h2 class="md:col-span-2">Let us know you better</h2>
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
			<div class="flex flex-col gap-2 md:col-span-2">
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
				<div bind:this={flottformAnchor} class="flottform-anchor md:absolute md:top-6"></div>
			</div>
			<div class="md:col-start-2 flex gap-8 justify-end row-start-12">
				<button type="reset" class="rounded px-4 py-2 bg-[#27dc49] w-min font-bold">Reset</button>
				<button type="submit" class="rounded px-4 py-2 bg-[#ed8ee5] w-min font-bold">Send</button>
			</div>
		</form>
	</div>
</div>

<style lang="postcss">
	.flottform-anchor {
		--flottform-main-color: #051e0c;
		--flottform-border-color: #051e0c;
		--flottform-root-border-radius: 0.25rem;
		--flottform-elements-max-height: 15rem;
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
