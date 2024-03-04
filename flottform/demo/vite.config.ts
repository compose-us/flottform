import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import basicSsl from '@vitejs/plugin-basic-ssl';

const isDemoEnvironment = process.env.PUBLIC_IS_ONLINE_DEMO;

export default defineConfig({
	plugins: [sveltekit(), ...(isDemoEnvironment ? [] : [basicSsl()])],
	server: {
		cors: true,
		...(isDemoEnvironment ? {} : { proxy: {} })
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
