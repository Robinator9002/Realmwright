// src/db/db.ts
import Dexie, { type Table } from 'dexie';
// NEW: Import the StatDefinition type.
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
    // NEW: Add the table property for our new stat definitions.
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

        // NEW: Version 3 Upgrade
        // This block adds the new 'statDefinitions' table.
        this.version(3).stores({
            // Schema for the new table.
            // We index 'worldId' for fast lookups and 'name' for sorting.
            statDefinitions: '++id, worldId, name',
        });
    }
}

// Export a single, shared instance of the database.
export const db = new RealmwrightDB();
