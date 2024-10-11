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
	<div class="grid grid-cols-1 gap-4 sm:gap-8 sm:grid-cols-2 md:grid-cols-3">
		<DemoLink
			href="{base}/default-ui"
			title="Default UI"
			description="Explore how Flottform integrates seamlessly into forms. This demo lets you see our default
				UI in action, giving you a hands-on experience of how Flottform can enhance form
				functionality and user interaction."
		/>
		<DemoLink
			href="{base}/custom-ui"
			title="Custom UI"
			description="See how Flottform can power your forms without any default UI constraints. This demo
				showcases how you can leverage Flottform's functionality while styling your forms exactly as
				you need, offering complete freedom to match your design preferences."
		/>
		<DemoLink
			href="{base}/customized-default-ui"
			title="Customized default UI"
			description="See how you can tailor Flottform's default UI to better match your design, while still retaining all the powerful features of the original interface. This demo lets you explore how easy it is to adapt the default elements to fit seamlessly with your brand's style."
		/>
	</div>
</section>
