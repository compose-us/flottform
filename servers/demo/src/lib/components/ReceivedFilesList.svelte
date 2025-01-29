<script lang="ts">
	let { receivedFiles, removeFile } = $props<{
		receivedFiles: { url: string; name: string }[];
		removeFile: (index: number) => void;
	}>();

	let filesContainer: HTMLDivElement | null = null;
	function scrollToBottomOfMessages() {
		if (filesContainer) {
			filesContainer.scrollTop = filesContainer.scrollHeight;
		}
	}

	$effect(() => {
		if (receivedFiles.length > 0) {
			scrollToBottomOfMessages();
		}
	});
</script>

<div class="h-[50vh] overflow-y-auto scroll-smooth" bind:this={filesContainer}>
	{#each receivedFiles as file, index}
		<li class="flex items-center justify-between p-3 m-2 bg-gray-100 rounded-lg">
			<span class="text-sm">{file.name}</span>
			<div class="flex flex-col">
				<a href={file.url} download={file.name} class="text-green-500 hover:underline text-sm">
					Download
				</a>
				<button
					class="text-red-500 hover:underline text-sm"
					onclick={() => {
						removeFile(index);
					}}
				>
					Delete
				</button>
			</div>
		</li>
	{/each}
</div>
