// src/db/db.ts
import Dexie, { type Table } from 'dexie';
// NEW: Import the LoreEntry type so Dexie knows about its structure.
import type { World, Campaign, Character, LoreEntry } from './types';

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
    // NEW: Add the table property for our new lore entries.
    public lore!: Table<LoreEntry, number>;

    public constructor() {
        // The database name. This is what you'll see in the browser's developer tools.
        super('RealmwrightDB');

        // --- Schema Definition ---
        // This is a versioned schema. When we need to change the database structure,
        // we add a new, higher-numbered version block. Dexie handles the migration automatically.

        // Version 1: The initial schema for worlds, campaigns, and characters.
        this.version(1).stores({
            worlds: '++id, name, createdAt',
            campaigns: '++id, worldId, name',
            characters: '++id, worldId, *campaignIds, name',
        });

        // NEW: Version 2 Upgrade
        // This block will run only if a user opens the app with a version 1 database.
        // It adds the new 'lore' table without touching the existing data.
        this.version(2).stores({
            // The schema for the new 'lore' table.
            // We index 'worldId' for fast lookups of all lore in a world.
            // We index 'category' to allow for filtering by category.
            // We index 'name' (which is the title) for sorting.
            lore: '++id, worldId, category, name',
        });
    }
}

// Export a single, shared instance of the database.
// This singleton pattern ensures that all parts of the application
// use the same database connection.
export const db = new RealmwrightDB();
