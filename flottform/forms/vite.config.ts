import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	build: {
		cssCodeSplit:true,
		lib: {
			// Could also be a dictionary or array of multiple entry points
			entry: {
				index: resolve(__dirname, 'src/index.ts'),
				'theme/base.css': resolve(__dirname, 'src/theme/base.css'),
				'theme/default.css': resolve(__dirname, 'src/theme/default.css'),
			},
			name: '@flottform/server',
			// the proper extensions will be added
			fileName: 'index'
		}
	},
	server: {
		origin: '*',
		headers: { 'access-control-allow-origin': '*' }
	},
	plugins: [dts({ include: ['src/*.ts'], exclude: ['**/*.spec.ts'], entryRoot: 'src' })]
});
