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

        this.version(12)
            .stores({
                statDefinitions: '++id, worldId, name, type',
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

        // NEW: Version 13 Upgrade
        // Overhauls the ability system to support new features.
        this.version(13)
            .stores({
                // No index changes needed, just adding non-indexed properties.
            })
            .upgrade((tx) => {
                // Upgrade Ability Trees with a default tier count
                tx.table('abilityTrees')
                    .toCollection()
                    .modify((tree: AbilityTree) => {
                        if (typeof tree.tierCount === 'undefined') {
                            tree.tierCount = 5; // Default to 5 tiers
                        }
                    });

                // Upgrade Abilities with new properties and prerequisite structure
                return tx
                    .table('abilities')
                    .toCollection()
                    .modify((ability: Ability & { prerequisites: any }) => {
                        if (typeof ability.iconUrl === 'undefined') {
                            ability.iconUrl = ''; // Default to empty string
                        }

                        // Check if the old prerequisite structure exists and convert it
                        if (ability.prerequisites && !Array.isArray(ability.prerequisites)) {
                            const oldPrereqIds = ability.prerequisites.abilityIds || [];
                            if (oldPrereqIds.length > 0) {
                                // Convert to the new structure
                                ability.prerequisites = [
                                    {
                                        type: 'AND',
                                        abilityIds: oldPrereqIds,
                                    },
                                ];
                            } else {
                                ability.prerequisites = []; // If no old IDs, make it an empty array
                            }
                        } else if (!ability.prerequisites) {
                            ability.prerequisites = []; // Ensure it's always an array
                        }
                    });
            });
    }
}

// Export a single, shared instance of the database.
export const db = new RealmwrightDB();
