import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		origin: '*',
		headers: {
			'access-control-allow-origin': '*'
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
