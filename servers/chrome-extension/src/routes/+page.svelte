<script lang="ts">
	import { onMount } from 'svelte';
	import {
		defaultTurnServerMeteredEndpointValue,
		defaultSignalingServerUrlBase,
		defaultExtensionClientUrlBase
	} from '$lib/options';
	import type * as Flottform from '@flottform/forms';
	import flottform from './flottform-logo.svg';

	type TrackedInputFields = Array<{
		id: string;
		type: 'text' | 'textarea' | 'file';
		connectionState: { event: string; data?: any };
		label: string | undefined | null;
		screenshot: string | undefined;
	}>;

	let inputFields: TrackedInputFields = $state([]);
	let currentTabId: number | undefined;
	let rtcConfiguration: RTCConfiguration = {};
	let signalingServerUrlBase: string = '';
	let extensionClientUrlBase: string = '';
	let copiedInputId: string | null = $state(null);
	let isScanning: boolean = $state(false);
	let activeFilters: Set<string> = $state(new Set(['text', 'textarea', 'file']));

	const filterOptions = [
		{ label: 'Text', value: 'text' },
		{ label: 'Textarea', value: 'textarea' },
		{ label: 'File', value: 'file' }
	] as const;

	const toggleFilter = (type: string) => {
		const next = new Set(activeFilters);
		if (next.has(type)) next.delete(type);
		else next.add(type);
		if (next.size > 0) {
			activeFilters = next;
			chrome.storage.local.set({ FLOTTFORM_ACTIVE_FILTERS: [...next] });
		}
	};

	const countByType = (type: string) => inputFields.filter((f) => f.type === type).length;

	let expandedFields: Set<string> = $state(new Set());

	const activeStates = new Set(['endpoint-created', 'connected', 'progress']);

	const isExpanded = (input: TrackedInputFields[number]) =>
		expandedFields.has(input.id) || activeStates.has(input.connectionState.event);

	const toggleExpanded = (id: string) => {
		const next = new Set(expandedFields);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		expandedFields = next;
		chrome.storage.local.set({ FLOTTFORM_EXPANDED_FIELDS: [...next] });
	};

	const getStatusDot = (event: string) => {
		if (event === 'endpoint-created' || event === 'progress') return 'bg-primary-blue';
		if (event === 'connected') return 'bg-primary-green animate-pulse';
		if (event === 'done') return 'bg-primary-green';
		if (event === 'error') return 'bg-primary-red';
		return '';
	};

	const typeLabels: Record<string, string> = {
		text: 'Text field',
		textarea: 'Text area',
		file: 'File upload'
	};

	const getDisplayName = (input: TrackedInputFields[number]) => {
		if (input.label) return input.label;
		return typeLabels[input.type] ?? 'Input field';
	};

	const copyLink = async (link: string, inputId: string) => {
		await navigator.clipboard.writeText(link);
		copiedInputId = inputId;
		setTimeout(() => {
			copiedInputId = null;
		}, 2000);
	};

	// TODO remove all listeners and flottform processes
	const removeSavedInputs = async () => {
		// It'll remove all the data stored inside `chrome.storage.local`
		chrome.storage.local.set({ [`inputFields-${currentTabId}`]: [] });
		inputFields = [];

		const flottformModuleFile = chrome.runtime.getURL('scripts/flottform-bundle.js');
		chrome.scripting.executeScript({
			target: { tabId: currentTabId! },
			args: [currentTabId, flottformModuleFile],
			func: async (currentTabId, flottformModuleFile: string) => {
				const fm: typeof Flottform = await import(flottformModuleFile);
				const { ConnectionManager } = fm;

				const connectionManager = ConnectionManager.getInstance();
				connectionManager.closeAllConnections();
				console.log(
					'All connections should be closed Now, connectionManager = ',
					connectionManager
				);
			}
		});
	};

	const extractInputFieldsFromCurrentPage = async () => {
		isScanning = true;
		await removeSavedInputs();
		console.log('Searching for input fields in page');
		const injectionResult = await chrome.scripting.executeScript({
			target: { tabId: currentTabId! },
			args: [currentTabId],
			func: async (currentTabId) => {
				window.___flottform_map ??= new Map<string, HTMLElement>();
				const inputFields: TrackedInputFields = Array.from(
					document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLElement>(
						'input[type="text"],input[type="file"],input[type="password"],textarea,*[contenteditable="true"]'
					)
				).map((input, index) => {
					const ourMap = window.___flottform_map;
					const inputId = `input-${index}`;
					ourMap.set(inputId, input);
					let nearestLabel: HTMLLabelElement | null = input.id
						? document.querySelector(`label[for="${input.id}"]`)
						: null;
					nearestLabel ??= input.closest('label');

					// Priority: label text > aria-label > placeholder > null
					// Only fall back to technical IDs if nothing human-readable is found
					let labelText: string | null = nearestLabel?.innerText?.trim() || null;
					if (!labelText) {
						if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
							labelText = input.ariaLabel || input.placeholder || null;
						} else {
							labelText = input.ariaLabel || null;
						}
					}

					return {
						id: inputId,
						type:
							input instanceof HTMLInputElement
								? input.type === 'file'
									? 'file'
									: 'text'
								: input instanceof HTMLTextAreaElement
									? 'textarea'
									: 'text',
						label: labelText,
						connectionState: { event: 'new' }
					};
				});
				// Save the input fields to the chrome storage
				chrome.storage.local.set({ [`inputFields-${currentTabId}`]: inputFields });
				return inputFields;
			}
		});
		console.log(`Found ${injectionResult.length} input fields.`);

		const potentialResult = injectionResult[0]?.result;
		if (!potentialResult) {
			console.error('Injected Code is did not work properly !');
			return;
		}

		// Capture all screenshots before showing fields
		const inputsWithScreenshots = [];
		for (const input of potentialResult) {
			await chrome.scripting.executeScript({
				target: { tabId: currentTabId! },
				args: [input.id],
				func: (inputId) => {
					const ourMap = window.___flottform_map;
					const el = ourMap.get(inputId);
					el?.scrollIntoView({ block: 'center', behavior: 'instant' });
				}
			});
			await new Promise((r) => setTimeout(r, 500));

			let screenshot: string | undefined;
			try {
				screenshot = await screenshotInput(input.id);
			} catch (e) {
				console.warn(`Screenshot failed for ${input.id}:`, e);
			}
			inputsWithScreenshots.push({ ...input, screenshot });
		}

		inputFields = inputsWithScreenshots;
		chrome.storage.local.set({ [`inputFields-${currentTabId}`]: inputsWithScreenshots });
		isScanning = false;
	};

	const getCurrentTabId = async () => {
		if (currentTabId === undefined) {
			const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
			currentTabId = tab.id!;
		}
		return currentTabId;
	};
	const handleGenerateQr = async (inputFieldId: string, inputFieldType: string) => {
		await startFlottformProcess(inputFieldId, inputFieldType);
	};

	const startFlottformProcess = async (inputFieldId: string, inputFieldType: string) => {
		// Wait for the current tab Id to be available!
		const tabId = await getCurrentTabId();
		//console.log(`**** Starting the process for the TAB-${tabId} ****`);

		// Inject the bundled flottform script into the page context
		const flottformModuleFile = chrome.runtime.getURL('scripts/flottform-bundle.js');
		chrome.scripting.executeScript({
			target: { tabId: currentTabId! },
			args: [
				flottformModuleFile,
				inputFieldId,
				tabId,
				inputFieldType,
				rtcConfiguration,
				signalingServerUrlBase,
				extensionClientUrlBase
			],
			func: async (
				flottformModuleFile: string,
				inputFieldId: string,
				tabId: number,
				inputFieldType: string,
				rtcConfiguration: RTCConfiguration,
				signalingServerUrlBase: string,
				extensionClientUrlBase: string
			) => {
				const fm: typeof Flottform = await import(flottformModuleFile);
				const { FlottformTextInputHost, FlottformFileInputHost, ConnectionManager } = fm;
				const connectionManager = ConnectionManager.getInstance();

				if (inputFieldType === 'text' || inputFieldType === 'password') {
					startFlottformTextInputProcess(inputFieldId, tabId, inputFieldType);
				} else {
					startFlottformFileInputProcess(inputFieldId, tabId);
				}

				function handleFlottformEvent(event: string, data: any, id: string, currentTabId: number) {
					// Get the latest updated version of the array inputFields instead of passing it as a parameter to `chrome.scripting.executeScript`!
					chrome.storage.local.get([`inputFields-${tabId}`], (result) => {
						if (result[`inputFields-${tabId}`]) {
							const latestVersionOfInputFields: TrackedInputFields = result[`inputFields-${tabId}`];
							const updatedInputFields = latestVersionOfInputFields.map((inputField) => {
								if (inputField.id === id) {
									//console.warn('Updating only the value of this inputField with ID= ', id);
									return { ...inputField, connectionState: { event, data } };
								}
								return inputField;
							});
							//console.warn(`updatedInputFields =${JSON.stringify(updatedInputFields)}, id=${id}`);

							updateSavedInputs(updatedInputFields, currentTabId);
						}
					});
				}

				function updateSavedInputs(updatedInputFields: TrackedInputFields, currentTabId: number) {
					// Update the UI and the local storage
					chrome.storage.local.set({ [`inputFields-${currentTabId}`]: updatedInputFields }, () => {
						console.warn(
							`Saved ${JSON.stringify(updatedInputFields)} to chrome storage from page context!!!!!!!!!!!!`
						);
					});
					//inputFields = updatedInputFields;
				}

				function registerFlottformTextInputListeners(
					flottformTextInputHost: any,
					textInputId: string,
					currentTabId: number
				) {
					// Listen to events from FlottformTextInputHost and send them to the popup after updating TrackedInputFields array and saving it using chrome.storage.local
					flottformTextInputHost.on(
						'endpoint-created',
						({ link, qrCode }: { link: string; qrCode: string }) => {
							//console.log(`*****Inside "endpoint-created" event, link=${link}*****`);
							handleFlottformEvent('endpoint-created', { link, qrCode }, textInputId, currentTabId);
						}
					);

					flottformTextInputHost.on('connected', () => {
						//console.log('****Inside "connected" event*****');
						handleFlottformEvent('connected', undefined, textInputId, currentTabId);
					});

					flottformTextInputHost.on('error', (error: Error) => {
						//console.log('****Inside "error" event*****');
						handleFlottformEvent('error', { message: error.message }, textInputId, currentTabId);
					});

					flottformTextInputHost.on('done', (message: string) => {
						//console.log('****Inside "done" event*****');

						handleFlottformEvent('done', undefined, textInputId, currentTabId);

						const ourMap = window.___flottform_map;
						const targetedTextField: HTMLInputElement | HTMLTextAreaElement | null =
							ourMap.get(textInputId);
						if (!targetedTextField) {
							console.warn(
								`Flottform Can't assign the received message (${message}) to the targeted Text input field`
							);
							return;
						}
						if (
							targetedTextField.tagName.toLocaleLowerCase() === 'input' ||
							targetedTextField.tagName.toLocaleLowerCase() === 'textarea'
						) {
							targetedTextField.value = message;
						} else {
							targetedTextField.innerText = message;
						}
						targetedTextField.dispatchEvent(new Event('change', { bubbles: true }));
						targetedTextField.dispatchEvent(new Event('input', { bubbles: true }));
						// Channel will be closed since we won't receive data anymore.
						flottformTextInputHost.close();
					});
				}

				function startFlottformTextInputProcess(
					textInputId: string,
					currentTabId: number,
					inputFieldType: string
				) {
					// Query the doc with the ID: textInputId in order to find the input field where you'll paste the text.
					//console.log(`****Flottform will work on TextInput with id=${textInputId}*****`);
					const data = {
						type: inputFieldType,
						rtcConfiguration,
						flottformApi: signalingServerUrlBase
					};

					// Instantiate the FlottformTextInputHost with the provided inputId
					let flottformTextInputHost = new FlottformTextInputHost({
						createClientUrl: async ({ endpointId }: { endpointId: string }) =>
							`${extensionClientUrlBase}/${endpointId}/#${encodeURIComponent(JSON.stringify(data))}`,
						flottformApi: signalingServerUrlBase
					});

					flottformTextInputHost.start();

					// Track instances of FlottformTextInputHost
					connectionManager.addConnection(textInputId, flottformTextInputHost);
					console.log('connectionManager: ', connectionManager);

					registerFlottformTextInputListeners(flottformTextInputHost, textInputId, currentTabId);
				}

				function startFlottformFileInputProcess(fileInputId: string, currentTabId: number) {
					const ourMap = window.___flottform_map;
					const targetedInputField = ourMap.get(fileInputId);
					if (!targetedInputField) {
						console.warn(
							"Flottform Can't assign the received file to the targeted file input field"
						);
						return;
					}

					const data = {
						type: 'file',
						flottformApi: signalingServerUrlBase,
						rtcConfiguration
					};

					// Instantiate the FlottformFileInputHost with the provided inputId
					let flottformFileInputHost = new FlottformFileInputHost({
						createClientUrl: async ({ endpointId }: { endpointId: string }) =>
							`${extensionClientUrlBase}/${endpointId}/#${encodeURIComponent(JSON.stringify(data))}`,
						flottformApi: signalingServerUrlBase,
						inputField: targetedInputField
					});

					flottformFileInputHost.start();

					// Track instances of FlottformFileInputHost
					connectionManager.addConnection(fileInputId, flottformFileInputHost);
					/* console.log('connectionManager: ', connectionManager); */

					registerFlottformFileInputListeners(flottformFileInputHost, fileInputId, currentTabId);
				}

				function registerFlottformFileInputListeners(
					flottformFileInputHost: Flottform.FlottformFileInputHost,
					fileInputId: string,
					currentTabId: number
				) {
					flottformFileInputHost.on(
						'endpoint-created',
						({ link, qrCode }: { link: string; qrCode: string }) => {
							//console.log(`*****Inside "endpoint-created" event, link=${link}*****`);
							handleFlottformEvent('endpoint-created', { link, qrCode }, fileInputId, currentTabId);
						}
					);

					flottformFileInputHost.on('connected', () => {
						//console.log('****Inside "connected" event*****');
						handleFlottformEvent('connected', undefined, fileInputId, currentTabId);
					});

					flottformFileInputHost.on(
						'progress',
						({ fileIndex, totalFileCount, fileName, currentFileProgress, overallProgress }) => {
							if (
								((currentFileProgress * 100) % 10 === 0 && currentFileProgress < 0.85) ||
								currentFileProgress > 0.85
							) {
								console.log(`'currentFileProgress'= ${currentFileProgress}`);
								// Limit the amount of times we update the progress bar in chrome.storage.local
								handleFlottformEvent(
									'progress',
									{ fileIndex, totalFileCount, fileName, currentFileProgress, overallProgress },
									fileInputId,
									currentTabId
								);
							}
						}
					);

					flottformFileInputHost.on('error', (error: Error) => {
						//console.log('****Inside "error" event*****');
						handleFlottformEvent('error', { message: error.message }, fileInputId, currentTabId);
					});

					flottformFileInputHost.on('done', () => {
						//console.log('****Inside "done" event*****');
						handleFlottformEvent('done', undefined, fileInputId, currentTabId);
						// TODO: HANDLE THE DONE PROCESS
						const ourMap = window.___flottform_map;
						const targetFileInput: HTMLInputElement = ourMap.get(fileInputId);
						targetFileInput.dispatchEvent(new Event('change', { bubbles: true }));
						targetFileInput.dispatchEvent(new Event('input', { bubbles: true }));
					});
				}
			}
		});
	};

	const clearOutdatedTables = async () => {
		// Wait for the current tab Id to be available!
		const currentTabId = await getCurrentTabId();

		chrome.scripting.executeScript({
			target: { tabId: currentTabId! },
			args: [currentTabId],
			func: async (currentTabId) => {
				// We have to find a way to add this listener only once & we have to handle single page applications since beforeunload doesn't work for those SPAs!
				window.addEventListener('beforeunload', () => {
					chrome.storage.local.set({ [`inputFields-${currentTabId}`]: [] });
				});
			}
		});
	};

	const createHoverStartHighlightInputField = (inputId: string) => () => {
		chrome.scripting.executeScript({
			target: { tabId: currentTabId! },
			args: [inputId],
			func: (inputId) => {
				const ourMap = window.___flottform_map;
				const input: HTMLElement | undefined = ourMap.get(inputId);
				if (!input) {
					console.warn('could not find target!', inputId);
					return;
				}
				const styleToAppend = ';outline:6px solid rgba(255, 0, 0, 0.4);animation:flottform-pulse 1s ease-in-out infinite;';
				// Inject keyframes if not already present
				if (!document.getElementById('flottform-highlight-style')) {
					const style = document.createElement('style');
					style.id = 'flottform-highlight-style';
					style.textContent = '@keyframes flottform-pulse { 0%, 100% { outline-color: rgba(255, 0, 0, 0.4); } 50% { outline-color: rgba(255, 0, 0, 0.15); } }';
					document.head.appendChild(style);
				}
				input.setAttribute('style', `${input.getAttribute('style') ?? ''}${styleToAppend}`);
			}
		});
	};

	const createHoverEndHighlightInputField = (inputId: string) => () => {
		chrome.scripting.executeScript({
			target: { tabId: currentTabId! },
			args: [inputId],
			func: (inputId) => {
				const ourMap = window.___flottform_map;
				const input: HTMLElement | undefined = ourMap.get(inputId);
				if (!input) {
					console.warn('could not find target!', inputId);
					return;
				}
				const styleToAppend = ';outline:6px solid rgba(255, 0, 0, 0.4);animation:flottform-pulse 1s ease-in-out infinite;';
				const currentStyle = input.getAttribute('style');
				if (currentStyle) {
					const styleWithoutAppend = currentStyle.endsWith(styleToAppend)
						? currentStyle.slice(0, -styleToAppend.length)
						: currentStyle;
					input.setAttribute('style', styleWithoutAppend);
				}
			}
		});
	};

	const cropScreenshot = (
		dataUrl: string,
		rect: { x: number; y: number; width: number; height: number },
		devicePixelRatio: number
	): Promise<string> => {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement('canvas');
				// Account for device pixel ratio (Retina displays)
				const sx = rect.x * devicePixelRatio;
				const sy = rect.y * devicePixelRatio;
				const sw = rect.width * devicePixelRatio;
				const sh = rect.height * devicePixelRatio;

				canvas.width = rect.width;
				canvas.height = rect.height;

				const ctx = canvas.getContext('2d')!;
				ctx.drawImage(img, sx, sy, sw, sh, 0, 0, rect.width, rect.height);

				resolve(canvas.toDataURL('image/png'));
			};
			img.src = dataUrl;
		});
	};

	const screenshotInput = async (inputId: string) => {
		// 1. Get element position from the page
		const [result] = await chrome.scripting.executeScript({
			target: { tabId: currentTabId! },
			args: [inputId],
			func: (inputId) => {
				const ourMap = window.___flottform_map;
				const input = ourMap.get(inputId);
				if (!input) return null;

				// Find the associated label (same logic as extractInputFieldsFromCurrentPage)
				let label: HTMLLabelElement | null = input.id
					? document.querySelector(`label[for="${input.id}"]`)
					: null;
				label ??= input.closest('label');

				// Get bounding rects
				const inputRect = input.getBoundingClientRect();
				const labelRect = label?.getBoundingClientRect();

				// Compute a combined bounding box covering both elements
				const x = Math.min(inputRect.x, labelRect?.x ?? inputRect.x);
				const y = Math.min(inputRect.y, labelRect?.y ?? inputRect.y);
				const right = Math.max(inputRect.right, labelRect?.right ?? inputRect.right);
				const bottom = Math.max(inputRect.bottom, labelRect?.bottom ?? inputRect.bottom);

				return {
					x,
					y,
					width: right - x,
					height: bottom - y,
					devicePixelRatio: window.devicePixelRatio
				};
			}
		});
		const rect = result?.result;
		if (!rect || rect.width < 1 || rect.height < 1) return undefined;
		// 2. Capture the full visible tab
		const fullScreenshot = await chrome.tabs.captureVisibleTab({ format: 'png' });
		// 3. Crop to just the input element
		const croppedDataUrl = await cropScreenshot(fullScreenshot, rect, rect.devicePixelRatio);
		// 4. Use the cropped screenshot however you need:
		//    - Display it in the popup as <img src={croppedDataUrl} />
		//    - Store it alongside the input field in your state
		//    - Send it via WebRTC, etc.
		return croppedDataUrl;
	};

	onMount(async () => {
		if (!chrome) {
			console.warn('Chrome API is not available in this context!!');
			return;
		}

		const data = await chrome.storage.local.get([
			'FLOTTFORM_TURN_SERVER_METERED_ENDPOINT',
			'FLOTTFORM_SIGNALING_SERVER_URL_BASE',
			'FLOTTFORM_EXTENSION_CLIENTS_URL_BASE',
			'FLOTTFORM_ACTIVE_FILTERS',
			'FLOTTFORM_EXPANDED_FIELDS'
		]);

		if (data.FLOTTFORM_ACTIVE_FILTERS && Array.isArray(data.FLOTTFORM_ACTIVE_FILTERS)) {
			activeFilters = new Set(data.FLOTTFORM_ACTIVE_FILTERS);
		}
		if (data.FLOTTFORM_EXPANDED_FIELDS && Array.isArray(data.FLOTTFORM_EXPANDED_FIELDS)) {
			expandedFields = new Set(data.FLOTTFORM_EXPANDED_FIELDS);
		}
		let turnServerMeteredEndpointValue: string =
			data.FLOTTFORM_TURN_SERVER_METERED_ENDPOINT ?? defaultTurnServerMeteredEndpointValue;

		if (turnServerMeteredEndpointValue === '') {
			rtcConfiguration = {
				iceServers: [
					{
						urls: ['stun:stun1.l.google.com:19302']
					}
				]
			};
		} else {
			try {
				// Get TURN/STUN credentials from metered.ca
				const response = await fetch(turnServerMeteredEndpointValue);
				if (!response.ok) {
					throw new Error(`Network Response not ok, status: ${response.status}`);
				}
				// Saving the response in the iceServers array
				const iceServers = await response.json();

				rtcConfiguration = { iceServers };
			} catch (error) {
				console.error(error);
			}
		}

		signalingServerUrlBase =
			data.FLOTTFORM_SIGNALING_SERVER_URL_BASE ?? defaultSignalingServerUrlBase;
		extensionClientUrlBase =
			data.FLOTTFORM_EXTENSION_CLIENTS_URL_BASE ?? defaultExtensionClientUrlBase;
		console.log({
			rtcConfiguration,
			signalingServerUrlBase,
			extensionClientUrlBase
		});

		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		currentTabId = tab.id;

		// Listen to input field state changes → update UI
		chrome.storage.local.onChanged.addListener((changes) => {
			const key = `inputFields-${currentTabId}`;
			if (changes[key]) {
				const newFields: TrackedInputFields = changes[key].newValue || [];
				inputFields = newFields;
			}
		});

		// On Mount, check if data exists in storage; auto-scan if empty
		chrome.storage.local.get([`inputFields-${currentTabId}`], (result) => {
			const stored = result[`inputFields-${currentTabId}`];
			if (stored && stored.length > 0) {
				inputFields = stored;
			} else {
				extractInputFieldsFromCurrentPage();
			}
		});

		clearOutdatedTables();
	});
</script>

<div class="bg-white min-h-0 flex flex-col relative">
	<!-- Header -->
	<div class="px-4 pt-4 pb-2 border-b border-gray-100 flex items-center justify-between">
		<img src={flottform} alt="Flottform Logo" class="h-8" />
		<div class="flex items-center gap-1">
			<button
				onclick={extractInputFieldsFromCurrentPage}
				disabled={isScanning}
				aria-label="Rescan page"
				class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
			>
				<svg
					class="h-5 w-5"
					class:animate-spin={isScanning}
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.451a.75.75 0 000-1.5H4.5a.75.75 0 00-.75.75v3.75a.75.75 0 001.5 0v-2.033a7 7 0 0011.712-3.138.75.75 0 00-1.449-.389zm-10.624-3.85a5.5 5.5 0 019.201-2.465l.312.31H11.75a.75.75 0 000 1.5h3.75a.75.75 0 00.75-.75V2.42a.75.75 0 00-1.5 0v2.033A7 7 0 003.038 7.588a.75.75 0 001.449.389z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
			<a
				href="/options"
				aria-label="Settings"
				class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
			>
				<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path
						fill-rule="evenodd"
						d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z"
						clip-rule="evenodd"
					/>
				</svg>
			</a>
		</div>
	</div>

	{#if isScanning}
		<!-- Full-popup spinner -->
		<div class="flex-1 flex flex-col items-center justify-center gap-3 py-16">
			<svg class="animate-spin h-8 w-8 text-primary-blue" viewBox="0 0 24 24" fill="none">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
				></path>
			</svg>
			<p class="text-xs text-gray-500">Scanning page for form fields...</p>
		</div>
	{:else}
		<!-- Filter checkboxes -->
		<div class="px-4 py-2 flex items-center gap-3 border-b border-gray-100">
			<span class="text-[11px] text-gray-400">Filter:</span>
			{#each filterOptions as filter}
				{@const isLastActive = activeFilters.has(filter.value) && activeFilters.size === 1}
				<label class="flex items-center gap-1 select-none {isLastActive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}">
					<input
						type="checkbox"
						checked={activeFilters.has(filter.value)}
						disabled={isLastActive}
						onchange={() => toggleFilter(filter.value)}
						class="h-3.5 w-3.5 rounded border-gray-300 text-primary-blue accent-primary-blue {isLastActive ? 'cursor-not-allowed' : 'cursor-pointer'}"
					/>
					<span class="text-[11px] text-gray-600">{filter.label} ({countByType(filter.value)})</span>
				</label>
			{/each}
		</div>

		<!-- Input Fields List -->
		<ul class="px-4 py-1.5 flex flex-col gap-2 max-h-[460px] overflow-y-auto">
			{#each inputFields.filter((f) => activeFilters.has(f.type)) as input (input.id)}
				{@const displayName = getDisplayName(input)}
				{@const expanded = isExpanded(input)}
				{@const statusDot = getStatusDot(input.connectionState.event)}
				<li
					class="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-blue/30 transition-all duration-200"
					onpointerenter={createHoverStartHighlightInputField(input.id)}
					onpointerleave={createHoverEndHighlightInputField(input.id)}
				>
					<!-- Clickable header row -->
					<button
						onclick={() => toggleExpanded(input.id)}
						class="w-full flex items-center gap-1.5 p-2 text-left cursor-pointer"
					>
						{#if input.type === 'file'}
							<svg
								class="h-3.5 w-3.5 text-gray-400 shrink-0"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z"
									clip-rule="evenodd"
								/>
							</svg>
						{:else if input.type === 'textarea'}
							<svg
								class="h-3.5 w-3.5 text-gray-400 shrink-0"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h6.365a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02l-1.95-2.1v6.59a.75.75 0 01-1.5 0V9.66l-1.95 2.1a.75.75 0 11-1.1-1.02l3.25-3.5A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75H7A.75.75 0 017 12H2.75a.75.75 0 01-.75-.75z"
									clip-rule="evenodd"
								/>
							</svg>
						{:else}
							<svg
								class="h-3.5 w-3.5 text-gray-400 shrink-0"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
									clip-rule="evenodd"
								/>
							</svg>
						{/if}
						<span class="text-sm font-bold truncate flex-1">{displayName}</span>
						{#if !input.screenshot}
							<span
								class="shrink-0 px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-400 cursor-help"
								title="This field is part of the page but not visible on screen. It may appear after you interact with the page (e.g., click a button or open a menu)."
								>Hidden</span
							>
						{/if}
						{#if statusDot}
							<span class="shrink-0 h-2 w-2 rounded-full {statusDot}"></span>
						{/if}
						<!-- Chevron -->
						<svg
							class="h-3.5 w-3.5 text-gray-400 shrink-0 transition-transform duration-200 {expanded
								? 'rotate-90'
								: ''}"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>

					<!-- Expanded content -->
					{#if expanded}
						<div class="flex flex-col gap-2 px-3 pb-3 border-t border-gray-100 pt-2">
							<!-- Screenshot -->
							{#if input.screenshot}
								<img
									src={input.screenshot}
									alt="Screenshot of {displayName ?? input.id}"
									class="w-full rounded-md border border-gray-200"
								/>
							{/if}

							<!-- State-dependent content -->
							{#if input.connectionState.event === 'new'}
								<button
									onclick={() => handleGenerateQr(input.id, input.type)}
									class="w-full px-3 py-2 rounded-lg bg-primary-blue text-white text-xs font-semibold hover:opacity-90 transition-opacity duration-200 shadow-sm flex items-center justify-center gap-1.5"
								>
									<svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
										<path
											d="M3.75 3A1.75 1.75 0 002 4.75v3.5C2 9.216 2.784 10 3.75 10h3.5A1.75 1.75 0 009 8.25v-3.5A1.75 1.75 0 007.25 3h-3.5zM3.5 4.75a.25.25 0 01.25-.25h3.5a.25.25 0 01.25.25v3.5a.25.25 0 01-.25.25h-3.5a.25.25 0 01-.25-.25v-3.5zM3.75 11A1.75 1.75 0 002 12.75v3.5c0 .966.784 1.75 1.75 1.75h3.5A1.75 1.75 0 009 16.25v-3.5A1.75 1.75 0 007.25 11h-3.5zm-.25 1.75a.25.25 0 01.25-.25h3.5a.25.25 0 01.25.25v3.5a.25.25 0 01-.25.25h-3.5a.25.25 0 01-.25-.25v-3.5zM11 4.75c0-.966.784-1.75 1.75-1.75h3.5c.966 0 1.75.784 1.75 1.75v3.5A1.75 1.75 0 0116.25 10h-3.5A1.75 1.75 0 0111 8.25v-3.5zm1.75-.25a.25.25 0 00-.25.25v3.5c0 .138.112.25.25.25h3.5a.25.25 0 00.25-.25v-3.5a.25.25 0 00-.25-.25h-3.5z"
										/>
										<path
											d="M11.75 11a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 000-1.5H12.5v-.75a.75.75 0 00-.75-.75zM15.25 11a.75.75 0 00-.75.75v1.5h-.75a.75.75 0 000 1.5h.75v1.5a.75.75 0 001.5 0v-1.5h.75a.75.75 0 000-1.5h-.75v-1.5a.75.75 0 00-.75-.75zM11.75 15a.75.75 0 00-.75.75v.75h.75a.75.75 0 000-1.5h-.75z"
										/>
									</svg>
									Generate QR code
								</button>
							{:else if input.connectionState.event === 'endpoint-created'}
								<div class="flex flex-col items-center gap-2">
									<img
										src={input.connectionState.data.qrCode}
										alt="QR Code"
										class="w-40 rounded-lg"
									/>
									<div class="w-full flex items-center gap-1.5 bg-gray-50 rounded-md p-1.5">
										<span class="text-[10px] text-gray-500 truncate flex-1 pl-1"
											>{input.connectionState.data.link}</span
										>
										<button
											onclick={() => copyLink(input.connectionState.data.link, input.id)}
											class="shrink-0 px-2.5 py-1 text-[10px] font-semibold rounded-md bg-primary-blue text-white hover:opacity-90 transition-opacity duration-200"
										>
											{copiedInputId === input.id ? 'Copied!' : 'Copy link'}
										</button>
									</div>
								</div>
							{:else if input.connectionState.event === 'connected'}
								<div class="flex items-center gap-2 text-primary-green">
									<span class="relative flex h-2.5 w-2.5">
										<span
											class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-green opacity-75"
										></span>
										<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-green"
										></span>
									</span>
									<p class="text-xs font-semibold">Connected — waiting for data...</p>
								</div>
							{:else if input.connectionState.event === 'progress'}
								<div class="flex flex-col gap-1">
									<div class="flex items-center justify-between">
										<label for={input.id} class="text-[10px] text-gray-500 truncate"
											>Receiving ({input.connectionState.data.fileIndex + 1}/{input.connectionState
												.data.totalFileCount}) — {input.connectionState.data.fileName}</label
										>
										<span class="text-[10px] text-gray-400 tabular-nums shrink-0 ml-2"
											>{Math.round(input.connectionState.data.currentFileProgress * 100)}%</span
										>
									</div>
									<progress
										id={input.id}
										value={input.connectionState.data.currentFileProgress}
										max="1"
									>
										{Math.round(input.connectionState.data.currentFileProgress * 100)}%
									</progress>
								</div>
							{:else if input.connectionState.event === 'done'}
								<div class="flex items-center gap-2 text-primary-green">
									<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
											clip-rule="evenodd"
										/>
									</svg>
									<p class="text-xs font-semibold">Transfer complete</p>
								</div>
							{:else if input.connectionState.event === 'error'}
								<div class="bg-red-50 border border-red-200 rounded-md p-2">
									<p class="text-xs text-red-600 font-medium">
										Error: {input.connectionState.data?.message ??
											JSON.stringify(input.connectionState.data)}
									</p>
								</div>
							{/if}
						</div>
					{/if}
				</li>
			{:else}
				<li class="py-10 flex flex-col items-center gap-3 text-center">
					<svg
						class="h-10 w-10 text-gray-300"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z"
						/>
					</svg>
					<div>
						<p class="text-sm text-gray-500 font-medium">No form fields found</p>
						<p class="text-xs text-gray-400 mt-1">
							Try a page with forms, or tap the refresh icon to rescan
						</p>
					</div>
				</li>
			{/each}
		</ul>

		<!-- Footer -->
		<div class="px-4 pt-2 pb-3 mt-auto flex flex-col gap-1.5">
			<p class="text-[10px] text-gray-400 text-center">
				Powered by <a
					href="https://flottform.io/"
					target="_blank"
					rel="external noopener noreferrer"
					class="font-semibold text-primary-blue hover:underline">Flottform</a
				>
			</p>
			<details class="bg-gray-50 rounded-lg text-xs">
				<summary
					class="px-2.5 py-1.5 cursor-pointer text-gray-500 hover:text-fonts-blue transition-colors duration-200"
					>How does it work?</summary
				>
				<p class="px-2.5 pb-2.5 text-gray-500 leading-relaxed">
					Need to add details from another device? Scan for form fields, then generate a QR code or
					link to easily upload information from your phone or tablet.
				</p>
			</details>
		</div>
	{/if}
</div>

<style>
	progress[value] {
		--color: linear-gradient(#fff8, #fff0),
			repeating-linear-gradient(135deg, #0003 0 10px, #0000 0 20px),
			linear-gradient(to right, #6a11cb, #2575fc);
		--background: #e5e7eb;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		border: none;
		width: 100%;
		height: 8px;
		border-radius: 10em;
		background: var(--background);
	}
	progress[value]::-webkit-progress-bar {
		border-radius: 10em;
		background: var(--background);
	}
	progress[value]::-webkit-progress-value {
		border-radius: 10em;
		background: var(--color);
	}
	progress[value]::-moz-progress-bar {
		border-radius: 10em;
		background: var(--color);
	}
</style>
