<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	let form = $state<HTMLFormElement>();

	let status: 'sending' | 'success' | 'failed' | '' = $state('');
	let errorDetails: string = $state('');

	let contactChoice = $state('email');

	let hasInteractions = $state(false);
	let submittedTooFast = $state(true);

	onMount(() => {
		form!.addEventListener('submit', handleSubmit);
		form!.addEventListener('mousemove', () => (hasInteractions = true));
		form!.addEventListener('keypress', () => (hasInteractions = true));
		setTimeout(() => {
			submittedTooFast = false;
		}, 7000);
	});

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		status = 'sending';
		const formData = new FormData(form);
		const data = {
			userName: formData.get('name'),
			contactChoice,
			email: formData.get('email'),
			linkedin: formData.get('linkedin'),
			twitter: formData.get('twitter'),
			feedbackPositive: formData.get('feedbackPositive'),
			feedbackImprovements: formData.get('feedbackImprovements')
		};

		if (formData.get('phone')) {
			status = 'failed';
			errorDetails =
				'It seems that you found a field that was intentionally hidden. Are you a bot? 🤖';
			return;
		}
		if (hasInteractions === false) {
			status = 'failed';
			errorDetails =
				'It seems that you submitted the form without any mouse or keyboard interactions. Are you a bot? 🤖';
			return;
		}
		if (submittedTooFast) {
			status = 'failed';
			errorDetails = 'It seems that you submitted the form whitin 7 seconds. Are you a bot? 🤖';
			return;
		}
		const response = await fetch(`${base}/feedback`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			status = 'failed';
			errorDetails = 'There was an error posting the feedback form... 😬';
			return;
		}

		const { message } = await response.json();
		status = message;
	};
</script>

<div class="max-w-screen-xl mx-auto p-8 box-border grid grid-cols-1 gap-8">
	<h1>Send us your Feedback!</h1>
	{#if status === 'sending'}
		<div class="place-self-center">
			<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="w-12 spinner-svg">
				<circle cx="50" cy="50" r="45" class="spinner" />
			</svg>
		</div>
	{:else if status === 'failed'}
		<p>Ooops...😣 Something went wrong. Please reload the page and try again later</p>
		{#if errorDetails}
			<p>{errorDetails}</p>
		{/if}
	{:else if status === 'success'}
		<div class="place-self-center relative">
			<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="w-12">
				<circle cx="50" cy="50" r="45" class="spinner-done" />
			</svg>
			<div class="w-12 h-12 absolute inset-0 grid place-items-center">
				<svg
					viewBox="0 0 533.973 533.973"
					xml:space="preserve"
					class="w-5 h-5 fill-primary-blue checkmark"
				>
					<path
						d="M477.931,52.261c-12.821-12.821-33.605-12.821-46.427,0l-266.96,266.954l-62.075-62.069    c-12.821-12.821-33.604-12.821-46.426,0L9.616,303.572c-12.821,12.821-12.821,33.604,0,46.426l85.289,85.289l46.426,46.426    c12.821,12.821,33.611,12.821,46.426,0l46.426-46.426l290.173-290.174c12.821-12.821,12.821-33.605,0-46.426L477.931,52.261z"
					/>
				</svg>
			</div>
		</div>
		<h2 class="text-center">Thank you!</h2>
	{:else}
		<form class="grid grid-cols-1 gap-4 max-w-screen-sm" bind:this={form} method="POST">
			<p class="italic text-xs">
				* Please know that we use your data solely for internal analysis and improvement of our
				service, and it's stored securely in a private GitHub project. We won't share your
				information with other third parties or use it for marketing purposes. There will be no
				promotional mailings or advertising campaigns targeted based on your feedback. We'll only
				contact you if you've provided us with your contact details.
			</p>
			<div class="flex flex-col gap-2">
				<label for="name">Name <span aria-hidden="true" class="text-sm text-red-700">*</span></label
				>
				<input
					type="text"
					name="name"
					id="name"
					required
					class="border border-primary-blue rounded px-2 py-1"
				/>
			</div>
			<div class="flex flex-col gap-2">
				<fieldset>
					<legend>What's your preferred way of contact?</legend>
					<div class="grid grid-cols-3 gap-1">
						<label
							for="contactChoice1"
							class="relative z-10 px-4 py-4 rounded text-center h-full w-full group hover:cursor-pointer"
						>
							<input
								type="radio"
								id="contactChoice1"
								name="contact"
								value="email"
								bind:group={contactChoice}
							/>
							E-Mail
						</label>
						<label
							for="contactChoice2"
							class="relative z-10 px-4 py-4 rounded text-center h-full w-full group hover:cursor-pointer"
						>
							<input
								type="radio"
								id="contactChoice2"
								name="contact"
								value="linkedin"
								bind:group={contactChoice}
							/>
							LinkedIn
						</label>
						<label
							for="contactChoice3"
							class="relative z-10 px-4 py-4 rounded text-center h-full w-full group hover:cursor-pointer"
						>
							<input
								type="radio"
								id="contactChoice3"
								name="contact"
								value="twitter"
								bind:group={contactChoice}
							/>
							X / Twitter
						</label>
					</div>
				</fieldset>
			</div>

			<div class="flex flex-col gap-2">
				<label for="email" class="flex flex-col gap-2">E-Mail</label>
				<input
					type="email"
					name="email"
					id="email"
					class="border border-primary-blue rounded px-2 py-1"
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label for="linkedin" class="flex flex-col gap-2">LinkedIn</label>
				<input
					type="text"
					name="linkedin"
					id="linkedin"
					class="border border-primary-blue rounded px-2 py-1"
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label for="twitter" class="flex flex-col gap-2">X / Twitter</label>
				<input
					type="text"
					name="twitter"
					id="twitter"
					class="border border-primary-blue rounded px-2 py-1"
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label for="feedbackPositive"
					>What do you like about Flottform?
					<span aria-hidden="true">🚀 <span class="text-sm text-red-700">*</span></span>
				</label>
				<textarea
					name="feedbackPositive"
					id="feedbackPositive"
					rows="5"
					required
					class="border border-primary-blue rounded px-2 py-1"
				/>
			</div>
			<div class="flex flex-col gap-2">
				<label for="feedbackImprovements"
					>What can we improve?
					<span aria-hidden="true">⚙️ <span class="text-sm text-red-700">*</span></span>
				</label>
				<textarea
					name="feedbackImprovements"
					id="feedbackImprovements"
					rows="5"
					required
					class="border border-primary-blue rounded px-2 py-1"
				/>
			</div>
			<input
				type="phone"
				name="phone"
				id="phone"
				class="absolute -z-40 -left-[9999px]"
				tabindex="-1"
			/>
			<div class="text-right">
				<button type="submit" class="bg-primary-blue px-4 py-2 rounded text-white">Submit</button>
			</div>
		</form>
	{/if}
</div>

<style lang="postcss">
	input[type='radio'] {
		appearance: none;
		@apply bg-gray-200 opacity-40 absolute inset-0 -z-10 w-full h-full hover:bg-gray-400 group-hover:cursor-pointer;
	}
	input[type='radio']:checked {
		@apply bg-gray-400;
	}
	.spinner-svg {
		animation: 2s linear infinite svg-animation;
	}

	.spinner {
		@apply block fill-transparent stroke-primary-blue;
		stroke-linecap: round;
		stroke-dasharray: 283;
		stroke-dashoffset: 280;
		stroke-width: 10px;
		transform-origin: 50% 50%;
		animation: spinner 1.4s ease-in-out infinite both;
	}
	.spinner-done {
		@apply block fill-transparent stroke-primary-blue;
		stroke-linecap: round;
		stroke-dasharray: 283;
		stroke-dashoffset: 283;
		stroke-width: 10px;
		transform-origin: 50% 50%;
		animation: spinner-done 1.4s ease-in-out 1 both;
	}
	.checkmark {
		animation: checkmark 1.2s linear;
	}
	@keyframes spinner {
		0%,
		25% {
			stroke-dashoffset: 280;
			transform: rotate(0);
		}

		50%,
		75% {
			stroke-dashoffset: 65;
			transform: rotate(45deg);
		}

		100% {
			stroke-dashoffset: 280;
			transform: rotate(360deg);
		}
	}
	@keyframes spinner-done {
		0% {
			stroke-dashoffset: 283;
			transform: rotate(0);
		}

		100% {
			stroke-dashoffset: 0;
			transform: rotate(120deg);
		}
	}

	@keyframes rotate {
		0% {
			transform: rotateZ(0deg);
		}
		100% {
			transform: rotateZ(360deg);
		}
	}

	@keyframes checkmark {
		0% {
			opacity: 0;
			width: 0;
		}
		100% {
			opacity: 100%;
			width: 100%;
		}
	}
</style>
