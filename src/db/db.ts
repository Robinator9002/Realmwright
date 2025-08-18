// src/db/db.ts
import Dexie, { type Table } from 'dexie';
// NEW: Import the new Ability and AbilityTree types.
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
    // NEW: Add table properties for our new ability-related tables.
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

        // NEW: Version 5 Upgrade
        // This block adds the two new tables for the ability system.
        this.version(5).stores({
            abilityTrees: '++id, worldId, name',
            // Index `abilityTreeId` to quickly fetch all abilities for a given tree.
            abilities: '++id, worldId, abilityTreeId, name',
        });
    }
}

// Export a single, shared instance of the database.
export const db = new RealmwrightDB();
