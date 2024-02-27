<script lang="ts">
	import '../app.postcss';
</script>

<slot />

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
