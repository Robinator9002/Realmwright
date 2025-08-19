// src/db/db.ts
import Dexie, { type Table } from 'dexie';
import type {
    World,
    Campaign,
    Character,
    LoreEntry,
    StatDefinition,
    Ability,
    AbilityTree,
} from './types';

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
    public abilityTrees!: Table<AbilityTree, number>;
    public abilities!: Table<Ability, number>;

    public constructor() {
        super('RealmwrightDB');

        // --- Schema Definition ---
        // This is a versioned schema. Dexie handles migrations automatically.

        this.version(1).stores({
            worlds: '++id, name, createdAt',
            campaigns: '++id, worldId, name',
            characters: '++id, worldId, *campaignIds, name',
        });

        this.version(2).stores({
            lore: '++id, worldId, category, name',
        });

        this.version(3).stores({
            statDefinitions: '++id, worldId, name',
        });

        this.version(4).stores({
            characters: '++id, worldId, *campaignIds, name, stats',
        });

        this.version(5).stores({
            abilityTrees: '++id, worldId, name',
            abilities: '++id, worldId, abilityTreeId, name',
        });

        this.version(6).stores({
            abilities: '++id, worldId, abilityTreeId, name, x, y',
        });

        // NEW: Version 7 Upgrade
        // This block adds the `tier` property to the abilities table for the tier system.
        this.version(7).stores({
            abilities: '++id, worldId, abilityTreeId, name, x, y, tier',
        });
    }
}

// Export a single, shared instance of the database.
export const db = new RealmwrightDB();
