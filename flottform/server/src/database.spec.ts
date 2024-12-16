import { describe, expect, it } from 'vitest';
import { createFlottformDatabase } from './database';

describe('Flottform database', () => {
	describe('createFlottformDatabase()', () => {
		it('can be created', async () => {
			const db = await createFlottformDatabase();
			expect(db).toBeDefined();
		});
	});

	describe('createEndpoint()', () => {
		it('creates new endpoints', async () => {
			const db = await createFlottformDatabase();
			const conn = new RTCPeerConnection();
			const offer = await conn.createOffer();
			const endpoint = await db.createEndpoint({ session: offer });
			expect(endpoint).toBeDefined();
			expect(endpoint.hostKey).toBeDefined();
			expect(endpoint.endpointId).toBeDefined();
			expect(endpoint.hostInfo).toBeDefined();
		});
	});

	describe('putHostInfo()', () => {
		it('fails with wrong host key', async () => {
			const db = await createFlottformDatabase();
			const conn = new RTCPeerConnection();
			const offer = await conn.createOffer();
			const { endpointId } = await db.createEndpoint({ session: offer });
			expect(
				async () =>
					await db.putHostInfo({
						endpointId,
						hostKey: 'clearly-wrong',
						iceCandidates: []
					})
			).rejects.toThrow(/hostkey/i);
		});
	});

	describe('getEndpoint()', () => {
		it('throws if endpoint does not exist', async () => {
			const db = await createFlottformDatabase();
			expect(async () => await db.getEndpoint({ endpointId: 'wrong-endpoint-id' })).rejects.toThrow(
				/endpoint/i
			);
		});

		it('provides information about existing endpoints', async () => {
			const db = await createFlottformDatabase();
			const conn = new RTCPeerConnection();
			const offer = await conn.createOffer();
			const { endpointId } = await db.createEndpoint({ session: offer });

			const retrievedInfo = await db.getEndpoint({ endpointId });
			expect(retrievedInfo).toBeDefined();
			expect(retrievedInfo?.hostInfo.session).toStrictEqual(offer);
		});

		it('does not include keys', async () => {
			const db = await createFlottformDatabase();
			const conn = new RTCPeerConnection();
			const offer = await conn.createOffer();
			const { endpointId, hostKey } = await db.createEndpoint({ session: offer });
			expect(hostKey).toBeDefined();

			const retrievedInfo = await db.getEndpoint({ endpointId });
			expect(retrievedInfo).toBeDefined();
			expect(retrievedInfo).not.toHaveProperty('hostKey');
			expect(retrievedInfo).not.toHaveProperty('clientKey');
		});
	});

	describe('deleteEndpoint()', () => {
		it('deletes existing endpoints', async () => {
			const db = await createFlottformDatabase();
			const conn = new RTCPeerConnection();
			const offer = await conn.createOffer();
			const { endpointId, hostKey } = await db.createEndpoint({ session: offer });
			expect(db.getEndpoint({ endpointId })).resolves.toBeDefined();

			await db.deleteEndpoint({ endpointId, hostKey });

			expect(async () => await db.getEndpoint({ endpointId })).rejects.toThrow(/endpoint/i);
		});

		it('keeps endpoint info around when deletion failed', async () => {
			const db = await createFlottformDatabase();
			const conn = new RTCPeerConnection();
			const offer = await conn.createOffer();
			const { endpointId } = await db.createEndpoint({ session: offer });
			const infoBefore = await db.getEndpoint({ endpointId });

			expect(async () => await db.deleteEndpoint({ endpointId, hostKey: 'wrong' })).rejects.toThrow(
				/hostKey/i
			);

			const infoAfter = await db.getEndpoint({ endpointId });
			expect(infoBefore).toStrictEqual(infoAfter);
		});
	});

	describe('putClientInfo()', () => {
		it('complains if session not found', async () => {
			const db = await createFlottformDatabase();
			const conn = new RTCPeerConnection();
			const offer = await conn.createOffer();
			await db.createEndpoint({ session: offer });

			const connPeer = new RTCPeerConnection();
			await connPeer.setRemoteDescription(offer);
			const answer = await connPeer.createAnswer();
			const clientKey = 'random-key';

			expect(
				async () =>
					await db.putClientInfo({
						endpointId: 'wrong-endpoint-id',
						clientKey,
						session: answer,
						iceCandidates: []
					})
			).rejects.toThrow(/session not found/i);
		});

		it('allows setting peer information', async () => {
			const db = await createFlottformDatabase();
			const conn = new RTCPeerConnection();
			const offer = await conn.createOffer();
			const { endpointId } = await db.createEndpoint({ session: offer });

			const connPeer = new RTCPeerConnection();
			await connPeer.setRemoteDescription(offer);
			const answer = await connPeer.createAnswer();
			const clientKey = 'random-key';

			await db.putClientInfo({ endpointId, clientKey, session: answer, iceCandidates: [] });

			const infos = await db.getEndpoint({ endpointId });
			expect(infos?.hostInfo).toBeDefined();
			expect(infos?.clientInfo).toBeDefined();
		});

		it('does not set peer information if using wrong peer key', async () => {
			const db = await createFlottformDatabase();
			const conn = new RTCPeerConnection();
			const offer = await conn.createOffer();
			const { endpointId } = await db.createEndpoint({ session: offer });

			const connPeer = new RTCPeerConnection();
			await connPeer.setRemoteDescription(offer);
			const answer = await connPeer.createAnswer();
			const clientKey = 'random-key';
			const otherPeerKey = 'random-key2';

			const infoBefore = await db.putClientInfo({
				endpointId,
				clientKey,
				session: answer,
				iceCandidates: []
			});
			expect(
				async () =>
					await db.putClientInfo({
						endpointId,
						clientKey: otherPeerKey,
						session: answer,
						iceCandidates: []
					})
			).rejects.toThrow(
				/clientKey is wrong: Another peer is already connected and you cannot change this info without the correct key anymore. If you lost your key, initiate a new Flottform connection./i
			);
			const infoAfter = await db.getEndpoint({ endpointId });
			expect(infoBefore).toStrictEqual(infoAfter);
		});
	});
});
