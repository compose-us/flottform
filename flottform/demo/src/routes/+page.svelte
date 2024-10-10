<script lang="ts">
	import { base } from '$app/paths';
	import DemoLink from '$lib/components/DemoLink.svelte';
</script>

<section class="max-w-screen-lg m-auto px-6 box-content flex flex-col h-full gap-4">
	<div class="py-8 md:h-80">
		<h1 class="text-5xl md:text-6xl">
			<span class="text-[#10B8B4]">Flottform</span> in action: check our demos
		</h1>
	</div>
	<div class="flex gap-6 flex-1 flex-wrap py-4">
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
	</div>
</section>
