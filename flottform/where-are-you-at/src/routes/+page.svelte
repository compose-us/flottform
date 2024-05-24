<script lang="ts">
	import { createFlottformInput } from '@flottform/forms';
	import { env } from '$env/dynamic/public';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	const sdpExchangeServerBase =
		env.PUBLIC_FLOTTFORM_SERVER_BASE || 'https://172.16.23.195:5177/flottform';

	const clientBase = env.PUBLIC_FLOTTFORM_CLIENT_BASE || 'https://172.16.23.195:5176/now/';

	const createClientUrl = async ({ endpointId }: { endpointId: string }) => {
		if (!browser) {
			throw Error('should not create a client URL when not in browser mode');
		}
		return `${clientBase}${endpointId}`;
	};

	let inputField: HTMLInputElement;

	onMount(() => {
		createFlottformInput({
			flottformApi: sdpExchangeServerBase,
			inputField,
			createClientUrl
		});
	});
</script>

<div>
	<input type="text" name="position" bind:this={inputField} />
</div>
