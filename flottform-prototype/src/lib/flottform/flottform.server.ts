type SecretKey = string;

export const offers: Record<
	SecretKey,
	{ form: RTCSessionDescriptionInit; answer?: RTCSessionDescriptionInit }
> = {};
export const candidates: Record<
	SecretKey,
	{ form: RTCIceCandidateInit[]; answer?: RTCIceCandidateInit[] }
> = {};
