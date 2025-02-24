import { describe, it, expect } from 'vitest';
import { isOfTypeRTCIceServer } from './isOfTypeRTCIceServer';

describe('isOfTypeRTCIceServer()', () => {
	it('returns false for undefined', () => {
		const result = isOfTypeRTCIceServer(undefined);
		expect(result).toBe(false);
	});
	it('returns false for null', () => {
		const result = isOfTypeRTCIceServer(null);
		expect(result).toBe(false);
	});
	it('returns false for empty object', () => {
		const result = isOfTypeRTCIceServer({});
		expect(result).toBe(false);
	});
	it('returns false for object with a urls property set to undefined', () => {
		const result = isOfTypeRTCIceServer({ urls: undefined });
		expect(result).toBe(false);
	});
	it('returns false for object with a urls property set to null', () => {
		const result = isOfTypeRTCIceServer({ urls: null });
		expect(result).toBe(false);
	});
	it('returns false for object with a urls property set to an empty string', () => {
		const result = isOfTypeRTCIceServer({ urls: '' });
		expect(result).toBe(false);
	});
	it('returns true for object with a urls property set to a string', () => {
		const result = isOfTypeRTCIceServer({ urls: 'stun:somewhere' });
		expect(result).toBe(true);
	});
	it('returns false for object with a urls property set to an empty array', () => {
		const result = isOfTypeRTCIceServer({ urls: [] });
		expect(result).toBe(false);
	});
	it('returns false for object with a urls property set to an array with an undefined value', () => {
		const result = isOfTypeRTCIceServer({ urls: [undefined] });
		expect(result).toBe(false);
	});
	it('returns false for object with a urls property set to an array with an null value', () => {
		const result = isOfTypeRTCIceServer({ urls: [null] });
		expect(result).toBe(false);
	});
	it('returns false for object with a urls property set to an array with an empty string value', () => {
		const result = isOfTypeRTCIceServer({ urls: [''] });
		expect(result).toBe(false);
	});
	it('returns true for object with a urls property set to an array of non empty strings', () => {
		const result = isOfTypeRTCIceServer({ urls: ['stun:somewhere'] });
		expect(result).toBe(true);
	});
	it('returns false for object with a username property being undefined', () => {
		const result = isOfTypeRTCIceServer({ urls: 'stun:somewhere', username: undefined });
		expect(result).toBe(false);
	});
	it('returns false for object with a username property being null', () => {
		const result = isOfTypeRTCIceServer({ urls: 'stun:somewhere', username: null });
		expect(result).toBe(false);
	});
	it('returns false for object with a username property being an integer', () => {
		const result = isOfTypeRTCIceServer({ urls: 'stun:somewhere', username: 123 });
		expect(result).toBe(false);
	});
	it('returns true for object with a username property being an empty string', () => {
		const result = isOfTypeRTCIceServer({ urls: 'stun:somewhere', username: '' });
		expect(result).toBe(true);
	});
	it('returns false for object with a credentials property being undefined', () => {
		const result = isOfTypeRTCIceServer({ urls: 'stun:somewhere', credentials: undefined });
		expect(result).toBe(false);
	});
	it('returns false for object with a credentials property being null', () => {
		const result = isOfTypeRTCIceServer({ urls: 'stun:somewhere', credentials: null });
		expect(result).toBe(false);
	});
	it('returns false for object with a credentials property being an integer', () => {
		const result = isOfTypeRTCIceServer({ urls: 'stun:somewhere', credentials: 123 });
		expect(result).toBe(false);
	});
	it('returns true for object with a credential property being an empty string', () => {
		const result = isOfTypeRTCIceServer({ urls: 'stun:somewhere', credentials: '' });
		expect(result).toBe(true);
	});
});
