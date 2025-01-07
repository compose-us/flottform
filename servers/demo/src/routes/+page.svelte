<script lang="ts">
	import { base } from '$app/paths';
	import DemoLink from '$lib/components/DemoLink.svelte';
	import Logo from '$lib/components/Logo.svelte';
</script>

<div
	class="bg-secondary-blue text-white pt-4 pb-4 sm:pt-4 sm:pb-4 grid place-items-center text-lg font-normal"
>
	<div
		class="flex flex-col sm:flex-row items-center gap-4 place-content-between w-full max-w-screen-lg mx-auto px-6"
	>
		<a href="{base}/"> <Logo /></a>
		<nav>
			<ul class="flex flex-col items-center sm:items-start sm:flex-row flex-wrap gap-2 sm:gap-4">
				<li>
					<a
						href="https://flottform.io/use-cases"
						target="_blank"
						rel="external noopener noreferrer">Flottform Use Cases</a
					>
				</li>
				<li>
					<a href="https://flottform.io/contact" target="_blank" rel="external noopener noreferrer"
						>Contact Us</a
					>
				</li>
			</ul>
		</nav>
	</div>
</div>
<section class="max-w-screen-lg mx-auto px-6 box-content flex flex-col h-full gap-20 py-20">
	<div class="">
		<h1 class="text-5xl md:text-6xl text-black">
			<span
				class="bg-gradient-to-r from-secondary-blue to-secondary-green inline-block text-transparent bg-clip-text"
				>Flottform</span
			> in action: check our demos
		</h1>
	</div>
	<div class="grid grid-cols-1 gap-4 sm:gap-8 sm:grid-cols-2 md:grid-cols-3 auto-rows-auto">
		<DemoLink
			href="{base}/return-and-complaints-default"
			title="Return and complaints form (Default UI)"
			description="Experience the ease of integrating Flottform's default UI into your return and complaints forms, allowing you to enhance your form functionality without any complex setup."
		/>
		<DemoLink
			href="{base}/return-and-complaints-custom"
			title="Return and complaints form (Custom UI)"
			description="Integrate Flottform into your return and complaints forms with full control over the UI design. This demo shows how you can customize every aspect of the interface while using Flottform's core features."
		/>
		<DemoLink
			href="{base}/expense-report"
			title="Expense report"
			description="Discover how Flottform can enhance your expense report forms, making it simple to upload and manage receipts. This demo shows how easy it is to integrate Flottform into your existing workflow, streamlining the process of collecting and submitting expenses."
		/>
		<DemoLink
			href="{base}/belegeinreichung"
			title="🇩🇪 Belegeinreichung"
			description="Nutzen Sie Flottform für Ihre Kostenabrechnungsformulare: Diese Demo zeigt, wie einfach sich Flottform in Ihren bestehenden Arbeitsprozess integrieren lässt, um die Erfassung und Einreichung von Belegen zu optimieren."
		/>
		<DemoLink
			href="{base}/customized-default-ui"
			title="Customized default UI"
			description="See how you can tailor Flottform's default UI to better match your design, while still retaining all the powerful features of the original interface. This demo lets you explore how easy it is to adapt the default elements to fit seamlessly with your brand's style."
		/>
		<DemoLink
			href="{base}/remote-file-drop"
			title="Remote File Drop"
			description="Move files from your phone to your computer in seconds."
		/>
	</div>
</section>
