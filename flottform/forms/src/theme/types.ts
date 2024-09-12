export interface FlottformCreateItemParams {
	flottformApi: string;
	createClientUrl: (params: { endpointId: string }) => Promise<string>;
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
export interface FlottformCreateFileParams extends FlottformCreateItemParams {
	inputField: HTMLInputElement;
}
