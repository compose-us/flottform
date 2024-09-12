export interface FlottformDefaultComponentOptions {
	id?: string;
	flottformRootElement?: HTMLElement;
	additionalComponentClass?: string;
	/**
	 * Title for the root element (default: "Fill from Another Device").
	 */
	flottformRootTitle?: string;
	/**
	 * Description for the root element (default: "This form is powered by Flottform. Need to add details from another device? Simply click a button below to generate a QR code or link, and easily upload information from your other device.").
	 */
	flottformRootDescription?: string;
}
export interface FlottformDefaultItemOptions {
	id?: string;
	additionalItemClasses?: string;
	label?: string;
	/**
	 * Label for a creating WebRTC connection button (default: "Get a link").
	 */
	buttonLabel?: string;
	/**
	 * Text for an error state (default: 🚨 An error occured (${error.message}). Please try again)
	 */
	onErrorText?: string;
	/**
	 * Text for a success state (default: ✨ You have succesfully downloaded all your files.
	 */
	onSuccessText?: string;
}

export interface FlottformCreateItemParams {
	flottformApi: string;
	createClientUrl: (params: { endpointId: string }) => Promise<string>;
	options: FlottformDefaultItemOptions;
}
export interface FlottformCreateFileParams extends FlottformCreateItemParams {
	inputField: HTMLInputElement;
}
