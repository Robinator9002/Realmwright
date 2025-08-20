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

        this.version(11).stores({
            characterClasses: '++id, worldId, name',
            characters: '++id, worldId, classId, *campaignIds, name',
        });

        // NEW: Version 12 Upgrade
        // Adds the `type` property to stat definitions.
        this.version(12)
            .stores({
                statDefinitions: '++id, worldId, name, type', // Added 'type'
            })
            .upgrade((tx) => {
                // This migration function ensures that existing stats get a default type.
                return tx
                    .table('statDefinitions')
                    .toCollection()
                    .modify((stat: StatDefinition) => {
                        if (!stat.type) {
                            stat.type = 'primary'; // Default all old stats to 'primary'
                        }
                    });
            });
    }
}

// Export a single, shared instance of the database.
export const db = new RealmwrightDB();
