<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { FlottformFileInputHost } from '@flottform/forms';
	import { writable } from 'svelte/store';
	import { env } from '$env/dynamic/public';
	import { browser } from '$app/environment';
	import { sdpExchangeServerBase } from '../../api';
	import waiting from './images/status-svgs/waiting.svg';
	import done from './images/status-svgs/done.svg';
	import errorSvg from './images/status-svgs/error.svg';

	let fileInput: HTMLInputElement;
	let flottformButton: HTMLButtonElement;
	let flottformDialogCardButton: HTMLButtonElement;
	let flottformDialogCard: HTMLDialogElement;
	let copyToClipboardButton: HTMLButtonElement;
	let flottformStatusWrapper: string = $state('');
	let flottformQrCode: string = $state('');
	let flottformLinkOffer: string = $state('');
	let flottformDialogDescription: string = $state('');

	let isFlottformDialogOpened: boolean = $state(false);

	let flottformState: string = $state('');
	let flottformStatusSvg: string = $state('');

	let isEndpointCreated = false;

	let createWebRtcChannel: () => void;

	const openFlottformDialogCard = () => {
		flottformDialogCard.showModal();
		isFlottformDialogOpened = true;
	};

	const closeFlottformDialogCard = () => {
		flottformDialogCard.close();
		isFlottformDialogOpened = false;
	};

	const handleFlottformButtonClick = () => {
		if (!isEndpointCreated) {
			createWebRtcChannel();
		}
	};

	const clientBase = env.PUBLIC_FLOTTFORM_CLIENT_BASE || 'https://192.168.0.21:5177/custom-ui';

	export const createClientUrl = async ({ endpointId }: { endpointId: string }) => {
		if (browser) {
			return `${window.location.origin}${base}/custom-ui-client/${endpointId}`;
		}
		return `${clientBase}/${endpointId}`;
	};

	const expenseReportMockData = [
		{
			description: 'Lunch with clients at a local restaurant',
			receiptType: 'Restaurant',
			invoiceDate: '2024-10-01',
			paidAmount: '85.50',
			currency: 'EUR',
			paymentMethod: 'corporate',
			costCenter: 'Sales',
			costObject: 'Client Meeting'
		},
		{
			description: "Taxi ride to client's office",
			receiptType: 'Taxi',
			invoiceDate: '2024-10-02',
			paidAmount: '40.00',
			currency: 'EUR',
			paymentMethod: 'private',
			costCenter: 'Sales',
			costObject: 'Client Visit'
		},
		{
			description: 'Hotel accommodation during a business trip',
			receiptType: 'Hotel',
			invoiceDate: '2024-10-05',
			paidAmount: '450.00',
			currency: 'EUR',
			paymentMethod: 'corporate',
			costCenter: 'Travel',
			costObject: 'Business Trip'
		},
		{
			description: 'Dinner with potential business partners',
			receiptType: 'Restaurant',
			invoiceDate: '2024-10-06',
			paidAmount: '135.75',
			currency: 'EUR',
			paymentMethod: 'private',
			costCenter: 'Business Development',
			costObject: 'Partnership Meeting'
		},
		{
			description: 'Flight to Berlin for a business trip',
			receiptType: 'Flight',
			invoiceDate: '2024-10-03',
			paidAmount: '350.00',
			currency: 'EUR',
			paymentMethod: 'corporate',
			costCenter: 'Travel',
			costObject: 'Business Trip'
		}
	];

	let prefilledForm = writable<{ [key: string]: string }>({
		description: '',
		receiptType: '',
		invoiceDate: '',
		paidAmount: '',
		currency: 'EUR',
		paymentMethod: 'private',
		costCenter: '',
		costObject: ''
	});

	const resetValues = () => {
		for (const key in $prefilledForm) {
			$prefilledForm[key] = '';
		}
	};

	const randomArrayElement = (arr: Array<{ [key: string]: string }>): { [key: string]: string } =>
		arr[Math.floor(Math.random() * arr.length)];

	let isFillingOut = $state(false);
	let showSpinner = $state(false);

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
		showSpinner = true;
		let data = randomArrayElement(expenseReportMockData);
		await waitForMs(500);
		showSpinner = false;
		$prefilledForm.receiptType = data.receiptType;
		$prefilledForm.invoiceDate = data.invoiceDate;
		$prefilledForm.paidAmount = data.paidAmount;
		$prefilledForm.currency = data.currency;
		await waitForMs(80);
		await typeValue(data.description, 'description');
		await waitForMs(100);
		$prefilledForm.paymentMethod = data.paymentMethod;
		await waitForMs(50);
		await typeValue(data.costCenter, 'costCenter');
		await waitForMs(70);
		await typeValue(data.costObject, 'costObject', 5);
		isFillingOut = false;
	};

	onMount(async () => {
		const fileInput = document.querySelector('input[type=file]') as HTMLInputElement;

		const flottformFileInputHost = new FlottformFileInputHost({
			flottformApi: sdpExchangeServerBase,
			createClientUrl,
			inputField: fileInput
		});

		flottformFileInputHost.on('new', () => {
			createWebRtcChannel = flottformFileInputHost.start;
		});

		flottformFileInputHost.on('endpoint-created', ({ link, qrCode }) => {
			flottformStatusSvg = '';
			flottformState = 'endpoint-created';
			isEndpointCreated = true;
			flottformLinkOffer = link;
			flottformQrCode = qrCode;
			flottformStatusWrapper = 'Upload a file';
			flottformDialogDescription = 'Use this QR-Code or Link on your other device.';
		});

		flottformFileInputHost.on('connected', () => {
			flottformState = 'connected';
			flottformStatusWrapper = 'Connected!';
			flottformDialogDescription =
				'Another device is connected. Start the data transfer from your other device';
			flottformStatusSvg = waiting;
		});

		flottformFileInputHost.on('webrtc:waiting-for-ice', () => {
			flottformDialogDescription = 'Waiting for data channel connection';
		});

		flottformFileInputHost.on('receive', () => {
			flottformState = 'receive';
			flottformStatusWrapper = 'Receiving data';
			flottformDialogDescription =
				'Another device is sending data. Waiting for incoming data transfer to complete';
		});

		flottformFileInputHost.on('done', () => {
			flottformState = 'done';
			flottformStatusSvg = done;
			flottformStatusWrapper = 'Done!';
			flottformDialogDescription = 'You have received a file from another device.';
		});

		flottformFileInputHost.on('error', (e) => {
			flottformState = 'error';
			flottformStatusSvg = errorSvg;
			console.error(e);
			let errorMessage = 'Connection failed - please retry!';
			if (e.message === 'connection-failed') {
				errorMessage = 'Client connection failed!';
			} else if (e.message === 'connection-impossible') {
				errorMessage =
					'Connection to this client with the current network environment is impossible';
			} else if (e.message === 'file-transfer') {
				errorMessage = 'Error during file transfer';
			}
			flottformStatusWrapper = 'Oops! Something went wrong';
			flottformDialogDescription = errorMessage;
		});
	});
</script>

<svelte:head>
	<title>Flottform DEMO</title>
</svelte:head>

<div class="flex flex-col lg:flex-row h-full min-h-dvh font-sans">
	<aside class="md:block lg:w-44 bg-secondary-blue px-2 py-9">
		<h1 class="text-lg font-bold text-white font-sans">
			<svg
				fill="currentColor"
				height="30px"
				width="30px"
				version="1.1"
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				viewBox="0 0 512 512"
				xml:space="preserve"
				class="inline-block"
			>
				<g>
					<g>
						<path
							d="M427.692,0H86.442C72.304,0,59.733,10.4,59.733,24.5v460.867c0,14.1,12.571,26.633,26.708,26.633h341.25
			c14.137,0,24.575-12.533,24.575-26.633V24.5C452.267,10.4,441.829,0,427.692,0z M435.2,485.367c0,4.683-2.779,9.567-7.508,9.567
			H86.442c-4.729,0-9.642-4.883-9.642-9.567V24.5c0-4.683,4.912-7.433,9.642-7.433h341.25c4.729,0,7.508,2.75,7.508,7.433V485.367z"
						/>
					</g>
				</g>
				<g>
					<g>
						<path
							d="M299.733,59.733H214.4c-4.713,0-8.533,3.817-8.533,8.533c0,4.717,3.821,8.533,8.533,8.533h85.333
			c4.713,0,8.533-3.817,8.533-8.533C308.267,63.55,304.446,59.733,299.733,59.733z"
						/>
					</g>
				</g>
				<g>
					<g>
						<path
							d="M376.533,119.467H137.6c-4.713,0-8.533,3.817-8.533,8.533c0,4.717,3.821,8.533,8.533,8.533h238.933
			c4.713,0,8.533-3.817,8.533-8.533C385.067,123.283,381.246,119.467,376.533,119.467z"
						/>
					</g>
				</g>
				<g>
					<g>
						<path
							d="M376.533,179.2H137.6c-4.713,0-8.533,3.817-8.533,8.533c0,4.717,3.821,8.533,8.533,8.533h238.933
			c4.713,0,8.533-3.817,8.533-8.533C385.067,183.017,381.246,179.2,376.533,179.2z"
						/>
					</g>
				</g>
				<g>
					<g>
						<path
							d="M376.533,238.933H137.6c-4.713,0-8.533,3.817-8.533,8.533c0,4.717,3.821,8.533,8.533,8.533h238.933
			c4.713,0,8.533-3.817,8.533-8.533C385.067,242.75,381.246,238.933,376.533,238.933z"
						/>
					</g>
				</g>
				<g>
					<g>
						<path
							d="M376.533,298.667H137.6c-4.713,0-9.6,2.75-9.6,7.467v128c0,4.717,4.887,9.6,9.6,9.6h238.933
			c4.713,0,7.467-4.883,7.467-9.6v-128C384,301.417,381.246,298.667,376.533,298.667z M366.933,426.667H145.067V315.733h221.867
			V426.667z"
						/>
					</g>
				</g>
			</svg>
			Cost report
		</h1>
	</aside>
	<form
		action="{base}/custom-ui-upload"
		method="POST"
		enctype="multipart/form-data"
		class="grid sm:grid-cols-[1fr_3fr] gap-6 p-6 w-full"
	>
		<div class="border rounded-sm border-gray-200 p-3 flex flex-col">
			<h2 class="mb-4 font-sans">Receipt</h2>
			<div class="flex flex-col gap-4 h-full">
				<div>
					<label class="block mb-2" for="document">Upload your receipt</label>
					<input
						class="block w-full border border-gray-200 rounded-sm cursor-pointer file:bg-secondary-blue file:text-white file:py-4 file:border-none"
						id="document"
						name="document"
						type="file"
						bind:this={fileInput}
					/>
					<p class="italic text-xs">Click to upload or drag and drop</p>
				</div>
				<div class="flex flex-col gap-2">
					<p>Or use other device to upload your receipt</p>
					<button
						type="button"
						class="rounded bg-yellow-300 p-4 font-medium hover:shadow-md w-fit"
						bind:this={flottformButton}
						onclick={() => {
							handleFlottformButtonClick();
							openFlottformDialogCard();
						}}>Upload from other device</button
					>
					{#if flottformStatusSvg}
						<div
							class="flex gap-2 items-center"
							class:animate-bounce={flottformStatusSvg === errorSvg}
						>
							<img
								class="w-5 h-5"
								class:animate-spin-slow={flottformStatusSvg === waiting}
								src={flottformStatusSvg}
								alt="Flottform status SVG"
							/>
							<p class="text-sm" class:text-red-600={flottformStatusSvg === errorSvg}>
								{flottformDialogDescription}
							</p>
						</div>
					{/if}
				</div>
				<div class="flex flex-col gap-2 flex-1 justify-end">
					<p>Pre-fill your form with the data from a receipt</p>
					<button
						type="button"
						onclick={fillOutForm}
						disabled={isFillingOut}
						class="border-secondary-blue border text-secondary-blue px-4 py-3 rounded h-fit w-fit hover:shadow-md font-medium"
						>Pre-fill form</button
					>
					<p class="italic text-xs text-gray-600">
						We won't actually fill the form with the real data from the uploaded receipt since it's
						just a demo to showcase Flottform :)
					</p>
				</div>
			</div>
		</div>
		<div class="border rounded-sm border-gray-200 p-3 flex flex-col h-full relative">
			<h2 class="font-sans">Receipt information</h2>
			<section class="grid lg:grid-cols-2 gap-x-8 gap-y-4 py-4 border-b">
				{#if showSpinner}
					<div
						class="absolute inset-0 w-full h-full grid place-items-center bg-black/20 z-50 rounded"
					>
						<svg
							class="animate-spin h-20 w-20"
							width="40px"
							height="40px"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M12 21C10.5316 20.9987 9.08574 20.6382 7.78865 19.9498C6.49156 19.2614 5.38261 18.2661 4.55853 17.0507C3.73446 15.8353 3.22029 14.4368 3.06088 12.977C2.90147 11.5172 3.10167 10.0407 3.644 8.67604C4.18634 7.31142 5.05434 6.10024 6.17229 5.14813C7.29024 4.19603 8.62417 3.53194 10.0577 3.21378C11.4913 2.89563 12.9809 2.93307 14.3967 3.32286C15.8124 3.71264 17.1113 4.44292 18.18 5.45C18.3205 5.59062 18.3993 5.78125 18.3993 5.98C18.3993 6.17875 18.3205 6.36937 18.18 6.51C18.1111 6.58075 18.0286 6.63699 17.9376 6.67539C17.8466 6.71378 17.7488 6.73357 17.65 6.73357C17.5512 6.73357 17.4534 6.71378 17.3624 6.67539C17.2714 6.63699 17.189 6.58075 17.12 6.51C15.8591 5.33065 14.2303 4.62177 12.508 4.5027C10.7856 4.38362 9.07478 4.86163 7.66357 5.85624C6.25237 6.85085 5.22695 8.30132 4.75995 9.96345C4.29296 11.6256 4.41292 13.3979 5.09962 14.9819C5.78633 16.5659 6.99785 17.865 8.53021 18.6604C10.0626 19.4558 11.8222 19.6989 13.5128 19.3488C15.2034 18.9987 16.7218 18.0768 17.8123 16.7383C18.9028 15.3998 19.4988 13.7265 19.5 12C19.5 11.8011 19.579 11.6103 19.7197 11.4697C19.8603 11.329 20.0511 11.25 20.25 11.25C20.4489 11.25 20.6397 11.329 20.7803 11.4697C20.921 11.6103 21 11.8011 21 12C21 14.3869 20.0518 16.6761 18.364 18.364C16.6761 20.0518 14.387 21 12 21Z"
								fill="#FDE047"
							/>
						</svg>
					</div>
				{/if}
				<div class="flex flex-col">
					<label for="description">Description</label>
					<input
						type="text"
						name="description"
						id="description"
						bind:value={$prefilledForm.description}
						class="border border-gray-400 rounded-sm px-3 py-2"
					/>
				</div>
				<div class="flex flex-col">
					<label for="receiptType">Receipt type</label>
					<input
						type="text"
						name="receiptType"
						id="receiptType"
						bind:value={$prefilledForm.receiptType}
						class="border border-gray-400 rounded-sm px-3 py-2"
					/>
				</div>
				<div class="flex flex-col">
					<label for="invoiceDate">Invoice date</label>
					<input
						type="date"
						name="invoiceDate"
						id="invoiceDate"
						bind:value={$prefilledForm.invoiceDate}
						class="border border-gray-400 rounded-sm px-3 py-2"
					/>
				</div>
			</section>
			<section class="grid grid-cols-2 gap-x-8 gap-y-4 py-4 border-b">
				<div class="flex flex-col">
					<label for="paidAmount">Paid amount (gross)</label>
					<input
						type="number"
						step="0.01"
						placeholder="0.00"
						name="paidAmount"
						id="paidAmount"
						bind:value={$prefilledForm.paidAmount}
						class="border border-gray-400 rounded-sm px-3 py-2"
					/>
				</div>
				<div class="flex flex-col">
					<label for="currency">Currency</label>
					<select
						name="currency"
						id="currency"
						class="border border-gray-400 rounded-sm px-3 py-2"
						bind:value={$prefilledForm.currency}
					>
						<option value="EUR">Euro</option>
						<option value="GBP">British Pound</option>
						<option value="USD">US Dollar</option>
						<option value="BRL">Brazilian real</option>
						<option value="JPY">Japanese yen</option>
					</select>
				</div>
				<div class="flex flex-col">
					<label for="paymentMethod">Payment method</label>
					<select
						name="paymentMethod"
						bind:value={$prefilledForm.paymentMethod}
						id="paymentMethod"
						class="border border-gray-400 rounded-sm px-3 py-2"
					>
						<option value="private">Cash private</option>
						<option value="corporate">Corporate card</option>
					</select>
				</div>
				<div class="flex flex-col col-span-2">
					<label for="costCenter">Cost center</label>
					<input
						type="text"
						name="costCenter"
						bind:value={$prefilledForm.costCenter}
						id="costCenter"
						class="border border-gray-400 rounded-sm px-3 py-2"
					/>
				</div>
				<div class="flex flex-col col-span-2">
					<label for="costObject">Cost object</label>
					<input
						type="text"
						name="costObject"
						bind:value={$prefilledForm.costObject}
						id="costObject"
						class="border border-gray-400 rounded-sm px-3 py-2"
					/>
				</div>
			</section>
			<div class="flex justify-between mt-4">
				<button
					type="submit"
					class="group relative w-fit cursor-pointer overflow-hidden rounded-md border bg-secondary-blue text-white border-secondary-blue px-12 py-3 font-semibold disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-500 disabled:pointer-events-none"
				>
					<span
						class="ease absolute top-1/2 h-0 w-64 origin-center -translate-x-20 rotate-45 bg-white transition-all duration-300 group-hover:h-64 group-hover:-translate-y-32"
					></span>
					<span class="ease relative transition duration-300 group-hover:text-secondary-blue"
						>Submit</span
					>
				</button>
			</div>
		</div>
	</form>
</div>

<dialog
	bind:this={flottformDialogCard}
	class="h-full w-full sm:w-1/2 flex-col gap-12 rounded-lg border border-gray-400 py-16 px-8 border-box text-lg {isFlottformDialogOpened
		? 'flex'
		: 'hidden'}"
>
	<div class="m-auto text-4xl font-bold">
		{flottformStatusWrapper}
	</div>
	<img
		class="m-auto w-72"
		class:block={flottformState === 'endpoint-created'}
		class:hidden={flottformState !== 'endpoint-created'}
		alt="qrCode"
		src={flottformQrCode}
	/>
	<div
		class="flex flex-row-reverse gap-4 items-center"
		class:block={flottformState === 'endpoint-created'}
		class:hidden={flottformState !== 'endpoint-created'}
	>
		<button
			class="border rounded bg-gray-200 p-2 text-sm"
			type="button"
			bind:this={copyToClipboardButton}
			title="Copy Flottform link to clipboard"
			aria-label="Copy Flottform link to clipboard"
			onclick={async () => {
				navigator.clipboard
					.writeText(flottformLinkOffer)
					.then(() => {
						copyToClipboardButton.innerText = '✅';
						setTimeout(() => {
							copyToClipboardButton.innerText = '📋';
						}, 1000);
					})
					.catch((error) => {
						copyToClipboardButton.innerText = `❌ Failed to copy: ${error}`;
						setTimeout(() => {
							copyToClipboardButton.innerText = '📋';
						}, 1000);
					});
			}}>📋</button
		>
		<div class="flottform-link-offer">
			{flottformLinkOffer}
		</div>
	</div>
	<p class="m-auto">{flottformDialogDescription}</p>
	<button onclick={closeFlottformDialogCard} class="absolute top-4 right-4 p-4 m-auto"
		><svg
			xmlns="http://www.w3.org/2000/svg"
			width="30"
			height="30"
			viewBox="0 0 15 15"
			fill="#1a3066"
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M6.79289 7.49998L4.14645 4.85353L4.85355 4.14642L7.5 6.79287L10.1464 4.14642L10.8536 4.85353L8.20711 7.49998L10.8536 10.1464L10.1464 10.8535L7.5 8.20708L4.85355 10.8535L4.14645 10.1464L6.79289 7.49998Z"
				fill="#1a3066"
			></path>
		</svg>
	</button>
	<button
		bind:this={flottformDialogCardButton}
		class="rounded border border-gray-400 py-2 px-3 m-auto hover:shadow-md focus:shadow transition-shadow"
		onclick={() => createWebRtcChannel()}>Refresh</button
	>
</dialog>

<style lang="postcss">
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
