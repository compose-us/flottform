<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { createFlottformInput } from '@flottform/forms';
	import { writable } from 'svelte/store';

	let dragTarget = false;
	let highlighted = false;

	function handleDrag(e: Event) {
		dragTarget = true;
	}

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

	const mockUser = {
		name: 'Codey',
		surname: 'Bugsworth',
		email: 'codey.bugsworth@example.com',
		phone: '+1 (404) 555-1234',
		street: 'Null Pointer Lane',
		houseNumber: '404',
		city: 'Devsville',
		postcode: '1337',
		problemDescription:
			"I'm experiencing a hardware glitch where my mouse pointer seems to be stuck in an infinite loop, circling endlessly. It's as if my computer is caught in a dance routine it can't escape. This quirky performance has turned my hardware into a dance floor, and I'm not sure whether to call it a bug or a feature!"
	};

	let isFillingOut = false;

	async function typeValue(valueToFill: string, refValue: string, delay = 30) {
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
		await typeValue(mockUser.name, 'name');
		await waitForMs(100);
		await typeValue(mockUser.surname, 'surname');
		await waitForMs(50);
		await typeValue(mockUser.email, 'email');
		await waitForMs(80);
		await typeValue(mockUser.phone, 'phone');
		await waitForMs(110);
		await typeValue(mockUser.street, 'street');
		await waitForMs(40);
		await typeValue(mockUser.houseNumber, 'houseNumber');
		await waitForMs(80);
		await typeValue(mockUser.city, 'city');
		await waitForMs(50);
		await typeValue(mockUser.postcode, 'postcode');
		await waitForMs(70);
		await typeValue(mockUser.problemDescription, 'problemDescription', 25);
		highlighted = true;
		isFillingOut = false;
	};

	onMount(() => {
		const fileInputFields = document.querySelectorAll(
			'input[type=file]'
		) as NodeListOf<HTMLInputElement>;
		createFlottformInput(fileInputFields[0], { flottformApi: 'http://localhost:5177/flottform' });
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
	<div class="sm:col-span-2 order-2 md:order-1">
		<h1>Returns and complaints</h1>
		<p>
			Welcome to our support section. We acknowledge you're here because you want something fixed.
			One of our products broke down or didn't arrive in the shape you expected it to. Please let us
			know about the issue below and we will try our best to support you!
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
					<label for="document"
						>Please upload a photo of your hardware model and serial number information
					</label>
					<div class="h-24 relative flex items-center justify-center z-10 border-primary-blue">
						<input
							class="text-center absolute inset-0 w-full h-full bg-transparent border-2 box-border border-primary-blue rounded-md py-2 px-4"
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
							<!-- <path
								class="opacity-100 path"
								d="M 0.016 72.582 c 0.004 -0.036 0.005 -0.071 0.011 -0.107 c 0.13 -0.979 0.959 -1.738 1.973 -1.738 h 9.704 c 1.104 0 2 0.895 2 2 c 0 1.104 -0.895 2 -2 2 H 6.385 c 4.317 4.224 9.85 6.945 15.943 7.78 c 7.506 1.029 14.955 -0.929 20.987 -5.508 c 4.966 -3.769 8.338 -8.869 10.001 -14.429 c -8.229 -1.111 -16.031 -5.362 -21.437 -12.483 c -7.788 -10.258 -6.538 -18.323 -3.101 -22.112 c 3.527 -3.889 9.518 -4.116 15.262 -0.581 c 2.782 1.712 5.44 4.223 7.9 7.464 c 5.225 6.883 7.457 15.387 6.285 23.949 c -0.002 0.019 -0.005 0.036 -0.007 0.055 c 5.796 -0.11 11.61 -1.988 16.57 -5.754 c 6.031 -4.579 9.919 -11.232 10.946 -18.734 c 1.027 -7.503 -0.929 -14.956 -5.507 -20.987 c 0 0 0 0 -0.001 -0.001 c -2.159 -2.845 -4.451 -5.024 -6.811 -6.476 c -0.94 -0.579 -1.234 -1.81 -0.655 -2.751 c 0.578 -0.94 1.81 -1.235 2.751 -0.655 c 2.783 1.712 5.441 4.223 7.901 7.464 c 0.001 0.001 0.002 0.003 0.003 0.004 c 5.223 6.882 7.453 15.385 6.281 23.944 c -1.172 8.561 -5.608 16.153 -12.49 21.377 c -5.915 4.491 -12.896 6.659 -19.798 6.57 c -1.848 6.889 -5.9 12.939 -11.673 17.321 c -5.685 4.316 -12.477 6.59 -19.492 6.59 c -1.478 0 -2.967 -0.101 -4.456 -0.305 C 15.02 85.553 8.865 82.581 4 77.981 v 4.459 c 0 1.104 -0.895 2 -2 2 s -2 -0.895 -2 -2 v -9.704 C 0 72.684 0.012 72.634 0.016 72.582 z M 48.754 37.287 c -2.16 -2.845 -4.451 -5.024 -6.81 -6.476 c -2.085 -1.283 -4.122 -1.925 -5.911 -1.925 c -1.721 0 -3.212 0.595 -4.293 1.787 c -2.598 2.864 -2.577 9.233 3.324 17.008 c 4.812 6.339 11.791 10.082 19.128 10.983 C 55.295 51.354 53.565 43.625 48.754 37.287 z"
								stroke-linecap="round"
								pathLength="1"
								stroke-width="4"
								stroke="#3ab53a"
							/> -->
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
				on:submit={() => console.log($prefilledForm)}
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
		animation: glow 0.6s ease 6 alternate;
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

	@keyframes glow {
		from {
			box-shadow: 0 0 1.5px -1.5px #343af0;
		}
		to {
			box-shadow: 0 0 1.5px 1.5px #343af0;
		}
	}
</style>
