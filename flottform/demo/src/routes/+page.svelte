<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { createFlottformInput } from '@flottform/forms';
	import { writable } from 'svelte/store';
	import FileInput from '$lib/components/FileInput.svelte';
	import { createClientUrl, sdpExchangeServerBase } from '../api';

	let highlighted = false;

	let fileInput: HTMLInputElement;

	let prefilledForm = writable<{ [key: string]: string }>({
		name: '',
		surname: '',
		email: '',
		phone: '',
		street: '',
		houseNumber: '',
		city: '',
		postcode: '',
		problemDescription: ''
	});

	const resetValues = () => {
		for (const key in $prefilledForm) {
			$prefilledForm[key] = '';
		}
		highlighted = false;
	};

	const randomArrayElement = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)];

	const mockUser = {
		name: ['Alice', 'John', 'Emily', 'Michael', 'Emma', 'Codey'],
		surname: ['Smith', 'Doe', 'Johnson', 'Brown', 'Wilson', 'Bugsworth'],
		phone: [
			'+1 (555) 123-4567',
			'+1 (123) 456-7890',
			'+1 (987) 654-3210',
			'+1 (543) 210-9876',
			'+1 (123) 456-7890',
			'+1 (404) 555-1234'
		],
		street: ['Main St', 'Elm St', 'Park Ave', 'Oak St', 'Cedar St', 'Null Pointer Lane'],
		houseNumber: ['123', '42', '7', '99', '777', '404'],
		city: ['Anytown', 'Springfield', 'Metroville', 'Greenville', 'Oakland', 'Devsville'],
		postcode: ['54321', '98765', '12345', '54321', '88888', '1337'],
		problemDescription: [
			"I'm facing an unusual challenge where the system is asking me to upload a photo of myself wearing a unicorn costume while holding a rubber chicken. It's as if the authentication process has taken a whimsical turn into a surreal circus!",
			'My transaction is on hold until I upload a selfie balancing a pineapple on my head while reciting the alphabet backward. Is this some sort of cognitive test or an initiation into the secret society of online shoppers?',
			"To access the restricted area, the system demands a photo of me impersonating a famous historical figure of my choice while juggling three rubber ducks. It's like stepping into a time-traveling talent show!",
			"I'm stuck in authentication limbo where the system insists on a photo of me wearing a pirate hat and holding a sign that says 'Arrr! I solemnly swear I'm up to no good'. Is this a security measure or a comedic treasure hunt?",
			"I'm trying to unlock a premium feature, but the system demands a selfie of me wearing a Viking helmet while riding a hobby horse and reciting Shakespearean sonnets. To be or not to be a verified user, that is the question!",
			"I'm experiencing a hardware glitch where my mouse pointer seems to be stuck in an infinite loop, circling endlessly. It's as if my computer is caught in a dance routine it can't escape. This quirky performance has turned my hardware into a dance floor, and now my head is spinning too—literally! I fear it might be broken. Is there a reboot button for humans as well?"
		]
	};

	let isFillingOut = false;

	async function typeValue(valueToFill: string, refValue: string, delay = 10) {
		const letters = valueToFill.split('');
		let i = 0;
		$prefilledForm[refValue] = '';
		while (i < letters.length) {
			await waitForMs(delay);
			$prefilledForm[refValue] += letters[i];
			i++;
		}
		return;
	}

	function waitForMs(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	const fillOutForm = async () => {
		resetValues();
		isFillingOut = true;
		await typeValue(randomArrayElement(mockUser.name), 'name');
		await waitForMs(100);
		await typeValue(randomArrayElement(mockUser.surname), 'surname');
		await waitForMs(50);
		await typeValue(
			`${$prefilledForm.name}.${$prefilledForm.surname}@example.com`.toLocaleLowerCase(),
			'email'
		);
		await waitForMs(80);
		await typeValue(randomArrayElement(mockUser.phone), 'phone');
		await waitForMs(110);
		await typeValue(randomArrayElement(mockUser.street), 'street');
		await waitForMs(40);
		await typeValue(randomArrayElement(mockUser.houseNumber), 'houseNumber');
		await waitForMs(80);
		await typeValue(randomArrayElement(mockUser.city), 'city');
		await waitForMs(50);
		await typeValue(randomArrayElement(mockUser.postcode), 'postcode');
		await waitForMs(70);
		await typeValue(randomArrayElement(mockUser.problemDescription), 'problemDescription', 5);
		highlighted = true;
		isFillingOut = false;
	};

	onMount(async () => {
		const fileInputFields = document.querySelectorAll(
			'input[type=file]'
		) as NodeListOf<HTMLInputElement>;
		createFlottformInput(fileInputFields[0], {
			flottformApi: sdpExchangeServerBase,
			createClientUrl
		});
	});
</script>

<svelte:head>
	<title>Flottform DEMO</title>
</svelte:head>

<div class="max-w-screen-xl mx-auto p-8 box-border grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-0">
	<button
		type="button"
		on:click={fillOutForm}
		class="group relative w-fit cursor-pointer overflow-hidden rounded-md border border-primary-blue px-12 py-3 order-1 md:order-3 place-self-center disabled:border-gray-300 disabled:bg-gray-200 disabled:pointer-events-none"
		disabled={isFillingOut}
	>
		<span
			class="ease absolute top-1/2 h-0 w-64 origin-center -translate-x-20 rotate-45 bg-primary-blue transition-all duration-300 group-hover:h-64 group-hover:-translate-y-32"
		/>
		<span class="ease relative transition duration-300 group-hover:text-white">Auto-fill form</span>
	</button>
	<div class="sm:col-span-2 order-2 md:order-1 gap-4 flex flex-col">
		<h1>Returns and complaints</h1>
		<p>
			Welcome to our support section. We acknowledge you're here because you want something fixed.
			One of our products broke down or didn't arrive in the shape you expected it to. Please let us
			know about the issue below and we will try our best to support you!
		</p>
		<p class="text-xs">
			<sup>*</sup> This is a demo. Your data will only be stored temporarily. Uploads will be cleaned
			up every few hours.
		</p>
		<form action="{base}/upload" method="POST" enctype="multipart/form-data" class="grid gap-8">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
				<div class="flex flex-col">
					<label for="name">Name</label>
					<input
						class="border-2 box-border border-primary-blue rounded-md py-2 px-4"
						id="name"
						type="text"
						name="name"
						bind:value={$prefilledForm.name}
					/>
				</div>
				<div class="flex flex-col">
					<label for="surname">Surname</label>
					<input
						class="border-2 box-border border-primary-blue rounded-md py-2 px-4"
						id="surname"
						type="text"
						name="surname"
						bind:value={$prefilledForm.surname}
					/>
				</div>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
				<div class="flex flex-col">
					<label for="email">E-Mail</label>
					<input
						class="border-2 box-border border-primary-blue rounded-md py-2 px-4"
						id="email"
						type="email"
						name="email"
						bind:value={$prefilledForm.email}
					/>
				</div>
				<div class="flex flex-col">
					<label for="phone">Phone number</label>
					<input
						class="border-2 box-border border-primary-blue rounded-md py-2 px-4"
						id="phone"
						type="tel"
						name="phone"
						bind:value={$prefilledForm.phone}
					/>
				</div>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
				<div class="flex flex-col sm:col-span-2">
					<label for="street">Street</label>
					<input
						class="border-2 box-border border-primary-blue rounded-md py-2 px-4"
						id="street"
						type="text"
						name="street"
						bind:value={$prefilledForm.street}
					/>
				</div>
				<div class="flex flex-col">
					<label for="houseNumber">House number</label>
					<input
						class="border-2 box-border border-primary-blue rounded-md py-2 px-4"
						id="houseNumber"
						type="text"
						name="houseNumber"
						bind:value={$prefilledForm.houseNumber}
					/>
				</div>
				<div class="flex flex-col sm:col-span-2">
					<label for="city">City</label>
					<input
						class="border-2 box-border border-primary-blue rounded-md py-2 px-4"
						id="city"
						type="text"
						name="city"
						bind:value={$prefilledForm.city}
					/>
				</div>
				<div class="flex flex-col">
					<label for="postcode">Postcode</label>
					<input
						class="border-2 box-border border-primary-blue rounded-md py-2 px-4"
						id="postcode"
						type="text"
						name="postcode"
						bind:value={$prefilledForm.postcode}
					/>
				</div>
			</div>
			<div class="grid grid-cols-1">
				<div class="flex flex-col">
					<label for="problemDescription">Please describe your problem</label>
					<textarea
						class="border-2 box-border border-primary-blue rounded-md py-2 px-4"
						id="problemDescription"
						name="problemDescription"
						rows="4"
						bind:value={$prefilledForm.problemDescription}
					/>
				</div>
			</div>
			<div class="grid gap-6 grid-cols-1 sm:grid-cols-2">
				<div class="">
					<FileInput id="document" name="document" {fileInput} />
				</div>
				{#if highlighted}
					<div class="text-primary-green hidden sm:flex flex-col">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink"
							version="1.1"
							viewBox="0 0 133 133"
							class="w-24 h-auto -rotate-[60deg]"
							fill="none"
						>
							<path
								d="M 15.47 8.184 c -2.396 -0.946 -4.889 -1.667 -7.455 -2.158 C 6.732 5.786 5.432 5.603 4.12 5.44 L 2.142 5.267 C 1.48 5.244 0.814 5.188 0.146 5.149 C 0.077 5.145 0.015 5.095 0.002 5.024 c -0.015 -0.083 0.041 -0.162 0.124 -0.177 C 2.771 4.379 5.492 4.181 8.218 4.33 c 2.725 0.144 5.455 0.621 8.094 1.423 c 2.643 0.79 5.186 1.913 7.591 3.25 c 2.41 1.336 4.653 2.938 6.752 4.683 l 0.027 0.023 c 0.221 0.183 0.393 0.431 0.484 0.726 c 0.247 0.806 -0.205 1.66 -1.011 1.907 c -2.312 0.71 -4.606 1.501 -6.844 2.453 c -2.235 0.957 -4.094 1.86 -6.228 3.058 c -2.074 4.808 -3.751 9.359 -4.519 14.473 l -0.006 0.037 c -0.033 0.218 -0.148 0.425 -0.337 0.57 c -0.389 0.298 -0.945 0.224 -1.243 -0.164 C 4.447 28.247 0.611 17.769 0.102 7.189 C 0.099 7.109 0.159 7.038 0.24 7.031 c 0.083 -0.008 0.157 0.054 0.165 0.137 c 0.506 5.241 1.848 10.373 3.892 15.181 c 2.051 4.807 3.499 7.649 6.786 11.667 c 0.611 -5.415 2.041 -8.479 3.969 -13.456 c 0.085 -0.219 0.239 -0.413 0.454 -0.545 l 0.042 -0.026 c 2.145 -1.321 4.354 -2.558 6.637 -3.662 c 2.279 -1.11 2.035 -1.183 4.457 -1.975 l -4.285 -2.701 C 20.163 10.3 17.863 9.138 15.47 8.184 z"
								transform="matrix(1 0 0 1 0 0) "
								stroke-linecap="round"
								pathLength="1"
								stroke-width="4"
								stroke="#3ab53a"
								class="first"
							/>
							<path
								d="M 24.03 25.941 l 0.011 0.011 c 5.022 5.103 10.433 9.868 16.471 13.582 l 2.278 1.361 c 0.758 0.457 1.566 0.803 2.347 1.211 c 1.552 0.853 3.208 1.411 4.827 2.086 c 0.196 0.065 0.394 0.124 0.591 0.187 l 0.355 0.101 c -0.289 -2.125 -0.383 -4.281 -0.214 -6.436 c 0.287 -3.725 1.39 -7.46 3.476 -10.654 c 0.268 -0.392 0.481 -0.827 0.797 -1.184 l 0.925 -1.091 c 0.591 -0.738 1.29 -1.435 2.077 -2.033 c 1.56 -1.2 3.479 -2.04 5.487 -2.233 c 2.002 -0.184 4.039 0.149 5.846 0.942 c 1.812 0.783 3.468 1.902 4.831 3.316 c 1.36 1.41 2.519 3.051 3.235 4.924 c 0.722 1.856 1.077 3.932 0.759 5.98 c -0.289 2.042 -1.181 4.005 -2.484 5.555 c -0.338 0.367 -0.655 0.787 -1.017 1.106 l -1.08 0.974 c -0.372 0.311 -0.698 0.678 -1.11 0.94 l -1.205 0.827 c -3.247 2.165 -7.133 3.335 -10.995 3.512 c -2.208 0.111 -4.397 -0.075 -6.544 -0.457 l 0.002 0.008 l -0.177 -0.038 c -0.184 -0.034 -0.369 -0.065 -0.553 -0.101 c 0.034 0.145 0.063 0.291 0.099 0.435 c 0.862 3.481 2.297 6.811 4.031 9.961 c 3.437 6.369 8.64 11.594 14.107 16.347 c 2.766 2.349 5.663 4.564 8.788 6.422 c 3.106 1.871 6.442 3.44 10.008 4.216 c -3.583 -0.693 -6.973 -2.191 -10.136 -3.998 c -3.183 -1.795 -6.147 -3.954 -8.984 -6.252 c -2.818 -2.328 -5.546 -4.756 -8.046 -7.445 c -0.64 -0.658 -1.269 -1.326 -1.833 -2.052 c -0.576 -0.714 -1.181 -1.407 -1.734 -2.141 l -1.59 -2.253 c -0.545 -0.742 -0.967 -1.564 -1.457 -2.343 c -1.847 -3.179 -3.4 -6.561 -4.375 -10.14 c -0.095 -0.352 -0.182 -0.708 -0.268 -1.063 c -0.108 -0.026 -0.214 -0.056 -0.322 -0.082 l -0.15 -0.032 l -0.001 -0.006 c -0.736 -0.186 -1.466 -0.386 -2.188 -0.609 c -1.762 -0.678 -3.579 -1.258 -5.25 -2.121 c -0.843 -0.415 -1.722 -0.774 -2.535 -1.237 l -2.446 -1.385 c -6.475 -3.785 -12.193 -8.605 -17.501 -13.752 c -0.009 -0.009 -0.025 -0.024 -0.033 -0.033 c -0.782 -0.795 -0.772 -2.074 0.023 -2.856 C 21.969 25.135 23.248 25.146 24.03 25.941 z M 52.331 44.886 l 0.422 0.12 c 2.426 0.61 4.897 0.959 7.358 0.892 c 3.404 -0.08 6.756 -1.01 9.619 -2.82 l 1.066 -0.692 c 0.367 -0.215 0.656 -0.539 0.989 -0.802 l 0.971 -0.831 c 0.33 -0.274 0.563 -0.591 0.853 -0.882 c 1.071 -1.215 1.763 -2.684 2.026 -4.241 c 1.041 -6.355 -5.397 -13.25 -11.99 -12.771 c -1.629 0.12 -3.192 0.756 -4.536 1.736 c -0.675 0.487 -1.29 1.068 -1.851 1.74 l -0.866 0.971 c -0.299 0.317 -0.495 0.711 -0.75 1.063 c -1.969 2.867 -3.085 6.299 -3.438 9.811 C 51.977 40.401 52.04 42.653 52.331 44.886 z"
								transform=" matrix(1 0 0 1 0 0) "
								stroke-linecap="round"
								pathLength="1"
								stroke-width="4"
								stroke="#3ab53a"
								class="second"
							/>
						</svg>
						<p class="text-2xl font-handwriting typewriter">Upload your photo</p>
					</div>
				{/if}
			</div>
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

<style lang="postcss">
	.drag {
		@apply border-2 border-dotted border-primary-blue;
	}
	form :global(.qrCodeButton) {
		background: var(--cus-color-blue);
		padding: 0.5rem 0.75rem;
		color: #fff;
		font-weight: 700;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		display: inline-block;
	}
	form :global(.qrCodeWrapper) {
		margin-bottom: 1rem;
	}
	.first,
	.second {
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
		animation: dash 2s linear 1 forwards;
	}
	.first {
		animation-delay: 2s;
	}

	.typewriter {
		overflow: hidden;
		white-space: nowrap;
		animation: typing 3.5s steps(50, end);
	}

	@keyframes typing {
		from {
			width: 0;
		}
		to {
			width: 100%;
		}
	}

	@keyframes dash {
		from {
			stroke-dashoffset: 1;
		}
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
