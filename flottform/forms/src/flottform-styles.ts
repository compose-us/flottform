import { FlottformState } from './internal';

type Colors = {
	primaryColor?: string;
	fontColor?: string;
	stateBackground?: {
		new?: string;
		'waiting-for-client'?: string;
		'waiting-for-file'?: string;
		'receiving-data'?: string;
		done?: string;
		error?: string;
	};
};

type Fonts = {
	fontFamily?: string;
	fontWeight?: string;
	fontSize?: string;
};

export type Styles = Colors & Fonts;

const defaultColors = {
	primaryColor: '#1a3066',
	fontColor: '#000',
	stateBackground: {
		new: '#FFFFFF',
		'waiting-for-client': '#F9F871',
		'waiting-for-data': '#D4F1EF',
		'receiving-data': '#7EA4FF',
		done: '#FFFFFF',
		error: '#F57C6B'
	}
};

const defaultFonts = {
	fontFamily: 'Raleway',
	fontWeight: '700',
	fontSize: '1.125rem'
};

export const defaultStyles: Styles = { ...defaultColors, ...defaultFonts };

export const simulateHoverEffect = (element: HTMLElement, styles?: Styles) => {
	element.addEventListener(
		'mouseover',
		() => (element.style.boxShadow = createButtonHoverEffect(styles))
	);
	element.addEventListener('mouseleave', () => (element.style.boxShadow = 'none'));
};
const createButtonHoverEffect = (styles?: Styles) =>
	`0 2px 4px 0 ${styles?.primaryColor || defaultColors.primaryColor}`;

export const changeBackgroundOnState = (state: FlottformState, styles?: Styles): string => {
	const stateBackground = styles?.stateBackground || defaultColors.stateBackground;
	return stateBackground[state] || defaultColors.stateBackground[state] || 'FFFFFF';
};

export const createChannelElementCss = (relativeElement: HTMLElement | undefined) => `
position: absolute;
top: ${relativeElement?.offsetTop ?? 0}px;
left: ${(relativeElement?.offsetLeft ?? 0) + (relativeElement?.offsetWidth ?? 0) + 16}px`;

export const closeDialogButtonCss = (styles?: Styles) => `
position: absolute;
top: 1rem;
right: 2rem;
padding: 1rem;
color: ${styles?.primaryColor || defaultColors.primaryColor}`;

export const createChannelButtonCss = (styles?: Styles) => `
border: 1px solid ${styles?.primaryColor || defaultColors.primaryColor};
padding: 0.75rem 1rem;
color: ${styles?.primaryColor || defaultColors.primaryColor};
font-weight: ${styles?.fontWeight || defaultFonts.fontWeight};
border-radius: 5px;
cursor: pointer;
display: inline-block;`;

export const dialogCss = (styles?: Styles) => `
height: 100%;
width: 100%;
flex-direction: column;
align-items: center;
justify-content: center;
gap: 3rem;
border-radius: 0.5rem;
border: 1px solid ${styles?.primaryColor || defaultColors.primaryColor};
color: ${styles?.fontColor || defaultColors.fontColor};
padding-left: 2rem;
padding-right: 2rem;
padding-top: 4rem;
padding-bottom: 4rem;
box-sizing: border-box;
font-size: ${styles?.fontSize || defaultFonts.fontSize};
line-height: 1.75rem;`;
// @ts-ignore: Unused variable
export const createChannelQrCodeCss = (styles?: Styles) => `max-wigth: 100%;
width: 350px`;

export const createChannelStatusWrapperCss = (styles?: Styles) => `
font-family: ${styles?.fontFamily || defaultFonts.fontFamily}, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
font-weight: ${styles?.fontWeight || defaultFonts.fontWeight};
font-size: calc(${styles?.fontSize || defaultFonts.fontSize} * 2);
line-height: 2.5rem;
display: flex;
align-items: center;
color: ${styles?.fontColor || defaultColors.fontColor};
`;

export const refreshConnectionButtonCss = (styles?: Styles) => `
border-radius: 0.25rem;
border: 1px solid ${styles?.primaryColor || defaultColors.primaryColor};
padding-left: 0.75rem;
padding-right: 0.75rem;
padding-top: 0.5rem;
padding-bottom: 0.5rem;`;

export const flottformSvg = (styles?: Styles) =>
	`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="24" viewBox="0 0 32 74" fill="${styles?.primaryColor || defaultColors.primaryColor}"><path d="M29.2146 12.4C28.9001 12.2308 28.5069 12.1038 28.0351 12.0192C27.6027 11.8922 27.1505 11.8287 26.6788 11.8287C25.3027 11.8287 24.3395 12.2731 23.7891 13.1618C23.2387 14.0081 22.8455 15.1084 22.6096 16.4626L22.4917 17.2244H29.0377L30.1287 26.6192L21.0174 27.4444L17.1842 50.6139L13.3542 73.7835H0.200073L4.03326 50.6139L7.86648 27.4444H2.55894L4.21018 17.2244H9.3408L9.51772 16.2087C9.87155 14.1351 10.363 12.1673 10.992 10.3052C11.6604 8.44322 12.5843 6.81394 13.7637 5.41742C14.9825 3.97858 16.5355 2.85713 18.4226 2.05307C20.3097 1.2067 22.649 0.783508 25.4403 0.783508C26.3446 0.783508 27.3668 0.868146 28.5069 1.03742C29.6471 1.16438 30.5906 1.39713 31.3376 1.73568L29.2146 12.4Z" fill="${styles?.primaryColor || defaultColors.primaryColor}"/></svg>`;

export const closeSvg = (styles?: Styles) =>
	`<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 15 15" fill="${styles?.primaryColor || defaultColors.primaryColor}">
<path fill-rule="evenodd" clip-rule="evenodd" d="M6.79289 7.49998L4.14645 4.85353L4.85355 4.14642L7.5 6.79287L10.1464 4.14642L10.8536 4.85353L8.20711 7.49998L10.8536 10.1464L10.1464 10.8535L7.5 8.20708L4.85355 10.8535L4.14645 10.1464L6.79289 7.49998Z" fill="${styles?.primaryColor || defaultColors.primaryColor}"/>
</svg>`;
