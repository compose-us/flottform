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
				}
			}
		},
		fontFamily: {
			display: [...defaultTheme.fontFamily.sans],
			sans: [...defaultTheme.fontFamily.sans],
			handwriting: [...defaultTheme.fontFamily.mono]
		}
	},
	plugins: []
};
