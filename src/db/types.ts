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
    abilityTreeId: number; // Foreign key to the AbilityTree table.
    prerequisites: Prerequisite; // Structured object for requirements.
    createdAt: Date;
    x?: number;
    y?: number;
    // NEW: The vertical column or "tier" this ability belongs to in the editor.
    tier: number;
}

/**
 * Represents a container for a set of related abilities (a "tree").
 */
export interface AbilityTree extends BaseManageable {
    worldId: number; // Foreign key to the World table.
    createdAt: Date;
}
