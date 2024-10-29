import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		// Output to a different directory to avoid conflicting with main library build
		outDir: 'dist/content',
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			formats: ['iife'],
			name: 'FlottForm',
			fileName: () => 'content-script.js'
		},
		rollupOptions: {
			// Ensure CSS is included in the bundle
			output: {
				globals: {},
				inlineDynamicImports: true
			}
		},
		// Don't split CSS into separate files
		cssCodeSplit: false,
		// Ensure the bundle is meant for browsers
		target: 'es2015',
		// Generate sourcemaps for debugging
		sourcemap: true,
		// Minimize the output
		minify: 'esbuild'
	}
});
