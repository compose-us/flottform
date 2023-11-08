type OfferPackage = { o: RTCSessionDescriptionInit; c: RTCIceCandidateInit[] };

export const decodeHashToOffer = (hash: string): OfferPackage => {
	return JSON.parse(decodeURIComponent(hash.replace(/^#?/, ''))) as OfferPackage;
};

export const encodeOfferToHash = (offer: OfferPackage): string => {
	return encodeURIComponent(JSON.stringify(offer));
};
