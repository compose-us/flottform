<script lang="ts">
	import { base } from '$app/paths';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="max-w-screen-lg mx-auto p-8 box-border grid grid-cols-1 gap-8">
	<h1>Der Beleg wurde versendet!</h1>

	{#if form?.success}
		<p>Hochladen abgeschlossen ✅</p>
		<p>Folgende Informationen wurden übermittelt:</p>
		<ol class="grid grid-cols-1 gap-4">
			<li>Beschreibung: {form.description}</li>
			<li>Belegart: {form.receiptType}</li>
			<li>Rechnungsdatum: {form.invoiceDate}</li>
			<li>Bruttobetrag: {form.paidAmount}</li>
			<li>Währung: {form.currency}</li>
			<li>Zahlungsart: {form.paymentMethod}</li>
			<li>Kostenstelle: {form.costCenter}</li>
			<li>Kostenträger: {form.costObject}</li>
			<li><a href="/uploads/{form.filenameDoc}" target="_blank">Hochgeladener Beleg</a></li>
			<img src="/uploads/{form.filenameDoc}" alt="Preview for uploaded file" class="w-40 h-auto" />
		</ol>
	{:else if form?.error}
		<p>Hochladen fehlgeschlagen ❌: {form.message}</p>
	{/if}
	<div>
		<a
			href="{base}/belegeinreichung"
			class="block group relative w-fit cursor-pointer overflow-hidden rounded-md border bg-white text-blue border-secondary-blue px-12 py-3"
		>
			<span
				class="ease absolute top-1/2 h-0 w-64 origin-center -translate-x-20 rotate-45 bg-secondary-blue transition-all duration-300 group-hover:h-64 group-hover:-translate-y-32"
			></span>
			<span class="ease relative transition duration-300 group-hover:text-white"
				>Neue Demo starten</span
			>
		</a>
	</div>
	<p class="mt-6 italic">
		Alle hochgeladenen Dateien werden nach einer kurzen Zeit gelöscht. Wir speichern sie zwar nicht
		dauerhaft und löschen sie häufig, aber bitte laden Sie keine vertraulichen oder anderweitig
		problematischen Inhalte hoch.
	</p>
</div>
