// src/db/types.ts

/**
 * A base interface for all manageable entities, ensuring they have
 * a consistent core structure.
 */
export interface BaseManageable {
    id?: number;
    name: string; // The title or name of the entity.
    description: string; // A short summary or description.
}

/**
 * Represents a single World, the top-level container for all content.
 */
export interface World extends BaseManageable {
    createdAt: Date;
}

/**
 * Represents a Campaign within a specific World.
 */
export interface Campaign extends BaseManageable {
    worldId: number;
    status: 'active' | 'archived' | 'planned';
    createdAt: Date;
}

/**
 * Represents a Character within a specific World.
 */
export interface Character extends BaseManageable {
    worldId: number;
    type: 'PC' | 'NPC' | 'Enemy';
    campaignIds: number[];
    createdAt: Date;
    stats: { [statId: number]: number };
    learnedAbilities: number[];
    // NEW: A character can optionally belong to a class.
    // This allows for classless characters/monsters.
    classId?: number;
}

/**
 * Represents a single entry in the world's chronicle.
 */
export interface LoreEntry extends BaseManageable {
    worldId: number;
    category: string;
    content: string;
    createdAt: Date;
}

/**
 * Represents a definition for a game statistic.
 */
export interface StatDefinition extends BaseManageable {
    worldId: number;
    abbreviation: string;
    defaultValue: number;
    createdAt: Date;
}

/**
 * Defines the structure for ability prerequisites.
 */
export interface Prerequisite {
    abilityIds: number[];
}

/**
 * Represents a single ability or skill (a "node" in a tree).
 */
export interface Ability extends BaseManageable {
    worldId: number;
    abilityTreeId: number;
    prerequisites: Prerequisite;
    createdAt: Date;
    x?: number;
    y?: number;
    tier: number;
}

/**
 * Represents a container for a set of related abilities (a "tree").
 */
export interface AbilityTree extends BaseManageable {
    worldId: number;
    createdAt: Date;
}

/**
 * Represents a Character Class template.
 * This is a reusable blueprint for creating characters.
 */
export interface CharacterClass extends BaseManageable {
    worldId: number;
    // The base stats for any character of this class.
    baseStats: { [statId: number]: number };
    // An array of AbilityTree IDs that this class has access to.
    abilityTreeIds: number[];
    createdAt: Date;
}
