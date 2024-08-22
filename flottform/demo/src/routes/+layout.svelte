<script lang="ts">
	import { base } from '$app/paths';
	import '../app.postcss';
	import '@flottform/forms/dist/style.css';
</script>

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
			<a
				href="https://flottform.io/updates/2024-03-08-demo-day"
				target="_blank"
				rel="external noopener noreferrer">How we did it?</a
			>
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
