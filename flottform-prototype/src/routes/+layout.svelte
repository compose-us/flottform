<script>
	import '@fontsource/raleway';
	import '@fontsource/raleway/600.css';
	import '@fontsource/raleway/700.css';
	import '@fontsource/raleway/800.css';
	import '@fontsource/raleway/900.css';
	import '@fontsource/roboto';
	import '@fontsource/roboto/400.css';
	import '@fontsource/roboto/500.css';
	import '@fontsource/roboto/700.css';
	import '@fontsource/roboto/900.css';
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
	:global(html, body) {
		color: var(--default-text);
		font-family: 'Roboto';
		font-size: 18px;
		line-height: 1.4em;
		margin: 0;
		min-height: 100%;
		padding: 0;
	}
	:global(h1, h2, h3) {
		font-family: Raleway, sans-serif;
		color: var(--default-headlines);
		overflow-wrap: break-word;
	}
	:global(h2) {
		font-size: 46px;
		line-height: 1;
		font-weight: 700;
		letter-spacing: -0.5px;
	}
	:global(button) {
		font-family: 'Roboto';
		line-height: 1;
		font-weight: 500;
	}
	@media screen and (max-width: 480px) {
		:global(h1) {
			font-size: 42px;
		}
		:global(h2) {
			font-size: 36px;
		}
		:global(h3) {
			font-size: 24px;
		}
		:global(html, body) {
			font-size: 16px;
		}
	}
	@media screen and (max-width: 384px) {
		:global(h1) {
			font-size: 36px;
		}
		:global(h2) {
			font-size: 24px;
		}
		:global(h3) {
			font-size: 18px;
		}
		:global(html, body) {
			font-size: 14px;
		}
		:global(*) {
			overflow-wrap: break-word;
			word-break: break-word;
		}
	}
</style>
