<script lang="ts">
	let form: HTMLFormElement;

	let status: 'sending' | 'success' | 'failed' | '' = $state('');

	let contactChoice = $state('email');

	const handleSubmit = async () => {
		status = 'sending';
		const formData = new FormData(form);
		const data = {
			userName: formData.get('name'),
			contactChoice,
			contact: formData.get(contactChoice),
			feedbackPositive: formData.get('feedbackPositive'),
			feedbackImprovements: formData.get('feedbackImprovements')
		};

		const response = await fetch('feedback', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		const { message } = await response.json();
		status = message;
		if (status === 'success') {
			setTimeout(() => {
				status = '';
			}, 3000);
		}
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
		<form
			class="grid grid-cols-1 gap-4 max-w-screen-sm"
			bind:this={form}
			method="POST"
			on:submit|preventDefault={handleSubmit}
		>
			<div class="flex flex-col gap-2">
				<label for="name">Name <span class="text-sm text-red-700">*</span></label>
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
					<legend>Do you want us to contact you via:</legend>
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
							Email
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
								value="X"
								bind:group={contactChoice}
							/>
							X / Twitter
						</label>
					</div>
				</fieldset>
			</div>

			<div class="flex flex-col gap-2">
				<label for="email" class="flex flex-col gap-2"
					>{contactChoice === 'email'
						? 'Email'
						: contactChoice === 'linkedin'
							? 'LinkedIn'
							: 'X / Twitter'}</label
				>
				<input
					type={contactChoice === 'email' ? 'email' : 'text'}
					name={contactChoice}
					id={contactChoice}
					class="border border-primary-blue rounded px-2 py-1"
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label for="feedbackPositive"
					>What do you like about Flottform 🚀 ? <span class="text-sm text-red-700">*</span>
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
					>What can we improve? ⚙️ <span class="text-sm text-red-700">*</span>
				</label>
				<textarea
					name="feedbackImprovements"
					id="feedbackImprovements"
					rows="5"
					required
					class="border border-primary-blue rounded px-2 py-1"
				/>
			</div>
			<div class="text-right">
				<button type="submit" class="bg-primary-blue px-4 py-2 rounded text-white">Submit</button>
			</div>
		</form>
	{/if}
</div>

<style lang="postcss">
	input[type='radio'] {
		appearance: none;
		@apply bg-gray-200 opacity-40 absolute inset-0 -z-10 w-full h-full hover:bg-gray-300 group-hover:cursor-pointer;
	}
	input[type='radio']:checked {
		@apply bg-gray-300;
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
