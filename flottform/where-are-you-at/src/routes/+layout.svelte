<script lang="ts">
	import { base } from '$app/paths';
	import '../app.postcss';
	import defaultPreviewImage from '$lib/images/preview-image.png';

	let title = 'Where are you at';
	let description = 'An easy way to share your location with friends';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="title" content={title} />
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta name="image" property="og:image" content={defaultPreviewImage} />
</svelte:head>
<slot />
<footer class="w-full px-4 py-4 bg-gray-200 bg-opacity-50 mt-auto">
	<ul class="max-w-screen-xl mx-auto flex justify-center gap-8">
		<li>
			<a href="{base}/">New Demo</a>
		</li>
		<li>
			<a href="{base}/feedback">Feedback</a>
		</li>
		<li>
			Powered by <a href="https://flottform.io" rel="external">flottform.io</a>
		</li>
	</ul>
</footer>

<style>
	:root {
		--cus-color-blue: #343af0;
		--cus-color-green: #3ab53a;
		--cus-color-red: #d0021b;

		--background-color: #fff;
		--primary-cta: var(--cus-color-green);
		--secondary-cta: var(--cus-color-blue);
		--default-headlines: #1a3066;
		--default-text: #546681;
		--max-page-width: 74em;
		--section-gap: 4em;
	}
</style>
