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
    Map,
    Location,
    Quest,
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
    // Add the new table properties
    public maps!: Table<Map, number>;
    public locations!: Table<Location, number>;
    public quests!: Table<Quest, number>;

    public constructor() {
        super('RealmwrightDB');

        // --- Schema Definition & Migrations ---
        // This is a versioned schema. Dexie handles migrations automatically.
        // NOTE: Dexie schema definitions are not additive. The LATEST version
        // must declare the full, consolidated schema of all tables and their indexes.
        // Previous version declarations are kept for their `upgrade()` functions,
        // which handle data migration from one version to the next.

        this.version(1).stores({
            worlds: '++id, name, createdAt',
            campaigns: '++id, worldId, name',
            characters: '++id, worldId, *campaignIds, name',
        });

        this.version(2).stores({
            // This version added the lore table
            worlds: '++id, name, createdAt',
            campaigns: '++id, worldId, name',
            characters: '++id, worldId, *campaignIds, name',
            lore: '++id, worldId, category, name',
        });

        this.version(3).stores({
            // This version added the statDefinitions table
            worlds: '++id, name, createdAt',
            campaigns: '++id, worldId, name',
            characters: '++id, worldId, *campaignIds, name',
            lore: '++id, worldId, category, name',
            statDefinitions: '++id, worldId, name',
        });

        this.version(4).upgrade(() => {
            // This version added a non-indexed 'stats' property to characters.
            // No schema change needed, but the version bump is important.
        });

        this.version(5).stores({
            // This version added ability tables
            worlds: '++id, name, createdAt',
            campaigns: '++id, worldId, name',
            characters: '++id, worldId, *campaignIds, name',
            lore: '++id, worldId, category, name',
            statDefinitions: '++id, worldId, name',
            abilityTrees: '++id, worldId, name',
            abilities: '++id, worldId, abilityTreeId, name',
        });

        this.version(6).stores({
            // This version added x,y coordinates to abilities
            worlds: '++id, name, createdAt',
            campaigns: '++id, worldId, name',
            characters: '++id, worldId, *campaignIds, name',
            lore: '++id, worldId, category, name',
            statDefinitions: '++id, worldId, name',
            abilityTrees: '++id, worldId, name',
            abilities: '++id, worldId, abilityTreeId, name, x, y',
        });

        this.version(7).stores({
            // This version added tier to abilities
            worlds: '++id, name, createdAt',
            campaigns: '++id, worldId, name',
            characters: '++id, worldId, *campaignIds, name',
            lore: '++id, worldId, category, name',
            statDefinitions: '++id, worldId, name',
            abilityTrees: '++id, worldId, name',
            abilities: '++id, worldId, abilityTreeId, name, x, y, tier',
        });

        this.version(8).upgrade(() => {
            // Added non-indexed 'learnedAbilities' to characters
        });

        this.version(9).stores({
            // Added characterClasses table
            worlds: '++id, name, createdAt',
            campaigns: '++id, worldId, name',
            characters: '++id, worldId, *campaignIds, name',
            lore: '++id, worldId, category, name',
            statDefinitions: '++id, worldId, name',
            abilityTrees: '++id, worldId, name',
            abilities: '++id, worldId, abilityTreeId, name, x, y, tier',
            characterClasses: '++id, worldId, name',
        });

        this.version(10).stores({
            // Added classId to characters
            worlds: '++id, name, createdAt',
            campaigns: '++id, worldId, name',
            characters: '++id, worldId, classId, *campaignIds, name',
            lore: '++id, worldId, category, name',
            statDefinitions: '++id, worldId, name',
            abilityTrees: '++id, worldId, name',
            abilities: '++id, worldId, abilityTreeId, name, x, y, tier',
            characterClasses: '++id, worldId, name',
        });

        this.version(11).stores({
            // No change, likely a bugfix version
            worlds: '++id, name, createdAt',
            campaigns: '++id, worldId, name',
            characters: '++id, worldId, classId, *campaignIds, name',
            lore: '++id, worldId, category, name',
            statDefinitions: '++id, worldId, name',
            abilityTrees: '++id, worldId, name',
            abilities: '++id, worldId, abilityTreeId, name, x, y, tier',
            characterClasses: '++id, worldId, name',
        });

        this.version(12)
            .stores({
                // Added 'type' index to statDefinitions
                worlds: '++id, name, createdAt',
                campaigns: '++id, worldId, name',
                characters: '++id, worldId, classId, *campaignIds, name',
                lore: '++id, worldId, category, name',
                statDefinitions: '++id, worldId, name, type',
                abilityTrees: '++id, worldId, name',
                abilities: '++id, worldId, abilityTreeId, name, x, y, tier',
                characterClasses: '++id, worldId, name',
            })
            .upgrade((tx) => {
                return tx
                    .table('statDefinitions')
                    .toCollection()
                    .modify((stat: StatDefinition) => {
                        if (!stat.type) {
                            stat.type = 'primary';
                        }
                    });
            });

        this.version(13).upgrade((tx) => {
            // This version added several non-indexed properties and migrated prerequisites
            tx.table('abilityTrees')
                .toCollection()
                .modify((tree: AbilityTree) => {
                    if (typeof tree.tierCount === 'undefined') {
                        tree.tierCount = 5;
                    }
                });

            return tx
                .table('abilities')
                .toCollection()
                .modify((ability: Ability & { prerequisites: any }) => {
                    if (typeof ability.iconUrl === 'undefined') {
                        ability.iconUrl = '';
                    }
                    if (ability.prerequisites && !Array.isArray(ability.prerequisites)) {
                        const oldPrereqIds = ability.prerequisites.abilityIds || [];
                        if (oldPrereqIds.length > 0) {
                            ability.prerequisites = [{ type: 'AND', abilityIds: oldPrereqIds }];
                        } else {
                            ability.prerequisites = [];
                        }
                    } else if (!ability.prerequisites) {
                        ability.prerequisites = [];
                    }
                });
        });

        // Version 14 is for upgrading
        this.version(14).upgrade(() => {});

        // NEW: Version 15
        // This version introduces tables for the Map Creator feature.
        this.version(15).stores({
            // The latest version MUST include the full schema.
            worlds: '++id, name, createdAt',
            campaigns: '++id, worldId, name',
            characters: '++id, worldId, classId, *campaignIds, name',
            lore: '++id, worldId, category, name',
            statDefinitions: '++id, worldId, name, type',
            abilityTrees: '++id, worldId, name',
            abilities: '++id, worldId, abilityTreeId, name, x, y, tier',
            characterClasses: '++id, worldId, name',
            // Add the new tables
            maps: '++id, worldId, name',
            locations: '++id, worldId, name',
            quests: '++id, worldId, name',
        });
    }
}

// Export a single, shared instance of the database.
export const db = new RealmwrightDB();
