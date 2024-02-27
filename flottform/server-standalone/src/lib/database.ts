import { createFlottformDatabase, type FlottformDatabase } from '@flottform/server';

let db: FlottformDatabase | null = null;

export async function retrieveFlottformDatabase() {
	if (db === null) {
		db = await createFlottformDatabase();
	}

	return db;
}
