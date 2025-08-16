// src/db/db.ts
import Dexie, { type Table } from 'dexie';
import type { World, Campaign, Character } from './types';

/**
 * The main database class for Realmwright.
 * This class defines the database schema and tables.
 * Dexie.js uses this schema to create and manage the underlying IndexedDB database.
 */
export class RealmwrightDB extends Dexie {
    // Table properties. The '!' asserts that these will be initialized by Dexie.
    // These properties give us typed access to our database tables.
    public worlds!: Table<World, number>; // 'number' is the type of the primary key.
    public campaigns!: Table<Campaign, number>;
    public characters!: Table<Character, number>;

    public constructor() {
        // The database name. This is what you'll see in the browser's developer tools.
        super('RealmwrightDB');

        // Define the database schema.
        // This is a versioned schema. If we need to change the structure in the future,
        // we will add a new version, e.g., this.version(2).stores({...}).
        this.version(1).stores({
            // Schema definition string: '++' for auto-incrementing primary key.
            // The following comma-separated values are indexes for fast lookups.

            // FIX: Added 'createdAt' to the index to allow sorting by this field.
            worlds: '++id, name, createdAt',

            // The 'campaigns' table is indexed by 'worldId' to quickly find all
            // campaigns belonging to a specific world.
            campaigns: '++id, worldId, name',

            // The 'characters' table is indexed by 'worldId'.
            // '*campaignIds' is a multi-entry index, allowing us to efficiently query
            // for all characters that are part of a specific campaign.
            characters: '++id, worldId, *campaignIds, name',
        });
    }
}

// Export a single, shared instance of the database.
// This singleton pattern ensures that all parts of the application
// use the same database connection.
export const db = new RealmwrightDB();
