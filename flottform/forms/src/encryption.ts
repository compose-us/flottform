export async function generateKey(): Promise<CryptoKey> {
	return await crypto.subtle.generateKey(
		{
			name: 'AES-GCM',
			length: 256
		},
		true, // extractable
		['encrypt', 'decrypt']
	);
}

export async function cryptoKeyToEncryptionKey(key: CryptoKey) {
	// CryptoKey --> Exported bytes of the cryptoKey (i.e. the encryption key)
	return (await crypto.subtle.exportKey('jwk', key)).k;
}

export async function encryptionKeyToCryptoKey(encryptionKey: string) {
	// Create a complete JWK object structure
	const jwk = {
		kty: 'oct',
		k: encryptionKey,
		alg: 'A256GCM',
		ext: true,
		key_ops: ['encrypt', 'decrypt']
	};

	// Import the complete JWK
	return await crypto.subtle.importKey(
		'jwk',
		jwk,
		{
			name: 'AES-GCM',
			length: 256
		},
		true, // extractable
		['encrypt', 'decrypt']
	);
}

export async function encrypt(plaintext: string, cryptoKey: CryptoKey): Promise<string> {
	const data = plaintextToTypedArray(plaintext);
	const iv = getInitializationVector();

	const encryptedData = await crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv
		},
		cryptoKey,
		data
	);

	// Prepend the cyphertext with the initialization vector.
	const combinedData = new Uint8Array(iv.length + encryptedData.byteLength);
	combinedData.set(iv, 0);
	combinedData.set(new Uint8Array(encryptedData), iv.length);

	return typedArrayToBase64(combinedData);
}

export async function decrypt(ciphertext: string, cryptoKey: CryptoKey) {
	const combinedData = base64ToTypedArray(ciphertext);

	// Step 2: Extract IV and ciphertext
	const iv = combinedData.slice(0, 12);
	const data = combinedData.slice(12);

	const decryptedData = await crypto.subtle.decrypt(
		{
			name: 'AES-GCM',
			iv
		},
		cryptoKey,
		data
	);

	return typedArrayToPlaintext(new Uint8Array(decryptedData));
}

function plaintextToTypedArray(plainText: string): Uint8Array {
	// Then encode to Uint8Array
	const encoder = new TextEncoder();
	return encoder.encode(plainText);
}

function getInitializationVector(): Uint8Array {
	return crypto.getRandomValues(new Uint8Array(12));
}

function typedArrayToBase64(typedArray: Uint8Array): string {
	// Uint8Array --> Base64
	return btoa(String.fromCharCode(...new Uint8Array(typedArray)));
}

function base64ToTypedArray(messageAsBase64: string): Uint8Array {
	// Base64 --> Uint8Array
	const binaryString = atob(messageAsBase64);
	return Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
}

function typedArrayToPlaintext(typedArray: Uint8Array, isOriginalDataJson = true) {
	// Uint8Array --> data (string, number, object, array..)
	const decoder = new TextDecoder();
	const plaintext = decoder.decode(typedArray);
	return isOriginalDataJson ? JSON.parse(plaintext) : plaintext;
}
