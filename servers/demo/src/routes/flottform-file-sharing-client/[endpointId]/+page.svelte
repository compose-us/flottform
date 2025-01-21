<script lang="ts">
	let connectionState = 'init';

	function connectToHost() {
		connectionState = 'connected';
	}
</script>

<div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
	<div class="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
		<h1 class="text-2xl font-bold text-center mb-4">Join File Sharing</h1>

		{#if connectionState === 'init'}
			<p class="text-gray-700 text-center mb-6">Connecting to the host...</p>
			<button
				on:click={connectToHost}
				class="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none"
			>
				Simulate Connection
			</button>
		{/if}

		{#if connectionState === 'connected'}
			<FileSharing />
		{/if}
	</div>
</div>
