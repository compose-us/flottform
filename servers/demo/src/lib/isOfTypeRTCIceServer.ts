function isNonEmptyString(something: unknown): something is string {
	return typeof something === 'string' && something !== '';
}

export function isOfTypeRTCIceServer(obj: unknown): obj is RTCIceServer {
	if (!obj) {
		return false;
	}
	console.log({ obj }, 'is defined');
	if (!(typeof obj === 'object')) {
		return false;
	}
	console.log({ obj }, 'is object');
	if (!('urls' in obj)) {
		return false;
	}
	console.log({ obj }, 'has url property');
	if (!obj.urls) {
		return false;
	}
	console.log({ obj }, 'is truthy');
	const urlsIsNonEmptyString = isNonEmptyString(obj.urls);
	console.log({ obj, urlsIsNonEmptyString, arrayisarray: Array.isArray(obj.urls) });
	const urlsIsNonEmptyArrayOfNonEmptyStrings =
		Array.isArray(obj.urls) && obj.urls.length > 0 && obj.urls.every(isNonEmptyString);
	const urlsIsCorrect = urlsIsNonEmptyString || urlsIsNonEmptyArrayOfNonEmptyStrings;
	const optionalUsernameWouldBeString = !('username' in obj) || typeof obj.username === 'string';
	const optionalCredentialsWouldBeString =
		!('credentials' in obj) || typeof obj.credentials === 'string';
	return urlsIsCorrect && optionalUsernameWouldBeString && optionalCredentialsWouldBeString;
}
