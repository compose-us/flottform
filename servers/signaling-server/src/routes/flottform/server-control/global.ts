let allowAllOrigins = false;
// Currently a no-op: /ice-server-credentials no longer reads this flag.
// Kept for the admin /server-control UI and for future per-license TURN gating.
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
