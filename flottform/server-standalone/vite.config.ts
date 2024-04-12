import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';

export default defineConfig({
	build: {
		lib: {
			// Could also be a dictionary or array of multiple entry points
			entry: resolve(__dirname, 'src/index.ts'),
			name: '@flottform/server-standalone',
			// the proper extensions will be added
			fileName: 'index',
		},
		minify:false
	},
	plugins: [
		dts({ include: ['src/*.ts'], exclude: ['**/*.spec.ts'], entryRoot: 'src' })
		// TODO: Add/create a re-run fastify server plugin instead of using nodemon
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
