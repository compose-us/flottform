import { z } from 'zod';

export const RTCSessionDescriptionInitSchema = z.object({
	type: z.enum(['offer', 'answer', 'pranswer', 'rollback']),
	sdp: z.string().optional()
});

export type RTCSessionDescriptionInitValidated = z.infer<typeof RTCSessionDescriptionInitSchema>;
assertType<TypeEqualityGuard<RTCSessionDescriptionInitValidated, RTCSessionDescriptionInit>>();

export const RTCIceCandidateInitSchema = z.object({
	candidate: z.string().optional(),
	sdpMid: z.string().nullable().optional(),
	sdpMLineIndex: z.number().min(0).nullable().optional(),
	usernameFragment: z.string().nullable().optional()
});

export type RTCIceCandidateInitValidated = z.infer<typeof RTCIceCandidateInitSchema>;
assertType<TypeEqualityGuard<RTCIceCandidateInitValidated, RTCIceCandidateInit>>();

function assertType<T extends never>() {}
type TypeEqualityGuard<A, B> = Exclude<A, B> | Exclude<B, A>;
