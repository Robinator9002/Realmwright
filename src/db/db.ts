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
    CharacterClass,
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
    public characterClasses!: Table<CharacterClass, number>;

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

        this.version(7).stores({
            abilities: '++id, worldId, abilityTreeId, name, x, y, tier',
        });

        this.version(8).stores({
            characters: '++id, worldId, *campaignIds, name, stats, *learnedAbilities',
        });

        this.version(9).stores({
            characterClasses: '++id, worldId, name',
        });

        this.version(10).stores({
            characters: '++id, worldId, classId, *campaignIds, name',
        });

        // NEW: Version 11 Upgrade
        // This version formally acknowledges the new data shapes for classes and characters.
        // No new indexes are needed as the complex sheet/instance data is not indexed.
        this.version(11).stores({
            characterClasses: '++id, worldId, name', // Now contains characterSheet
            characters: '++id, worldId, classId, *campaignIds, name', // Now contains instanceData
        });
    }
}

// Export a single, shared instance of the database.
export const db = new RealmwrightDB();
