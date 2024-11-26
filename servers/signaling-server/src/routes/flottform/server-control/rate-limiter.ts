import { RetryAfterRateLimiter } from 'sveltekit-rate-limiter/server';

export const limiter = new RetryAfterRateLimiter({
	rates: {
		IP: [120, 'h'],
		IPUA: [10, 'm']
	}
});
