import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: {
					blue: '#343af0',
					green: '#3ab53a',
					red: '#d0021b'
				},
				fonts: {
					blue: '#1a3066'
				},
				secondary: {
					blue: '#15047C',
					green: '#00E2C1'
				}
			}
		},
		fontFamily: {
			display: ['Raleway', ...defaultTheme.fontFamily.sans],
			sans: ['Roboto', ...defaultTheme.fontFamily.sans],
			handwriting: ['Gochi Hand', ...defaultTheme.fontFamily.mono]
		}
	},
	plugins: []
};
