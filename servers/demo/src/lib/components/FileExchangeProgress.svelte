<script lang="ts">
	export let exchangeFilesMetaData: {
		fileName: string;
		fileIndex: number;
		currentFileProgress: number;
		totalFileCount: number;
	} = { fileName: '', fileIndex: 0, currentFileProgress: 0, totalFileCount: 0 };
	export let fileExchangeType: 'sending' | 'receiving' = 'sending';
</script>

<div class="m-4">
	<h3 class="text-sm font-medium mb-2">
		{fileExchangeType === 'sending' ? 'sending' : 'receiving'} ({exchangeFilesMetaData.currentFileProgress}%):
		{exchangeFilesMetaData.fileName}
	</h3>

	<div class="w-full overflow-hidden rounded bg-[#f1f5f9] h-2">
		<div
			class="transition-[width] duration-300 ease-[ease] bg-[#3b82f6] h-full"
			style="width: {(exchangeFilesMetaData.fileIndex / exchangeFilesMetaData.totalFileCount) *
				100}%"
		></div>
	</div>
	<p class="text-right text-[#64748b] text-sm mt-4">
		{exchangeFilesMetaData.fileIndex} of {exchangeFilesMetaData.totalFileCount} files
	</p>
</div>
