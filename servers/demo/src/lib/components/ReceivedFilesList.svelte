<script lang="ts">
	export let receivedFiles;
	export let removeFile: (index: number) => void;
</script>

{#each receivedFiles as file, index}
	<li class="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
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
