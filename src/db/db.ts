// src/db/db.ts
import Dexie, { type Table } from 'dexie';
import type { World, Campaign, Character, LoreEntry, StatDefinition } from './types';

/**
 * The main database class for Realmwright.
 * This class defines the database schema and tables.
 */
export class RealmwrightDB extends Dexie {
    // Table properties for typed access to our database tables.
    public worlds!: Table<World, number>;
    public campaigns!: Table<Campaign, number>;
    public characters!: Table<Character, number>;
    public lore!: Table<LoreEntry, number>;
    public statDefinitions!: Table<StatDefinition, number>;

    public constructor() {
        super('RealmwrightDB');

        // --- Schema Definition ---
        // This is a versioned schema. Dexie handles migrations automatically.

        // Version 1: Initial schema
        this.version(1).stores({
            worlds: '++id, name, createdAt',
            campaigns: '++id, worldId, name',
            characters: '++id, worldId, *campaignIds, name',
        });

        // Version 2: Added the 'lore' table
        this.version(2).stores({
            lore: '++id, worldId, category, name',
        });

        // Version 3: Added the 'statDefinitions' table
        this.version(3).stores({
            statDefinitions: '++id, worldId, name',
        });

        // NEW: Version 4 Upgrade
        // This upgrade adds the `stats` property to the characters table.
        // Dexie will automatically handle adding this property to existing character records
        // when they are next updated, so we don't need a manual upgrade function.
        this.version(4).stores({
            characters: '++id, worldId, *campaignIds, name, stats',
        });
    }
}

// Export a single, shared instance of the database.
export const db = new RealmwrightDB();
