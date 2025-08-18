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
    // NEW: A map to store the character's value for each stat.
    // The key is the `id` of the StatDefinition, and the value is the character's score.
    // Example: { 1: 18, 2: 14, 3: 50 } for STR, DEX, HP.
    stats: { [statId: number]: number };
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
    abbreviation: string; // e.g., "STR", "HP"
    defaultValue: number; // The default value for this stat.
    createdAt: Date;
}
