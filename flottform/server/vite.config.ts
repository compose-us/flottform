import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	build: {
		lib: {
			// Could also be a dictionary or array of multiple entry points
			entry: resolve(__dirname, 'src/index.ts'),
			name: '@flottform/server',
			// the proper extensions will be added
			fileName: 'index'
		}
	},
	plugins: [dts({ include: ['src/*.ts'], exclude: ['**/*.spec.ts'], entryRoot: 'src' })]
});
