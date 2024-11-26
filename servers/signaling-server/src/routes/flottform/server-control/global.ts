let allowAllOrigins = false;
let useTurnServer = false;

export function getAllowAllOrigins() {
	return allowAllOrigins;
}

export function setAllowAllOrigins(value: boolean) {
	allowAllOrigins = value;
}

export function getUseTurnServer() {
	return useTurnServer;
}

export function setUseTurnServer(value: boolean) {
	useTurnServer = value;
}
