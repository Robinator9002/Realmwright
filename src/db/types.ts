// src/db/types.ts

/**
 * REFACTOR: A new base interface for all manageable entities.
 * This establishes a contract that any item we want to manage via our
 * generic modal must have these core properties. This is the foundation
 * for our type-safe generic component.
 */
export interface BaseManageable {
    id?: number; // Optional: The auto-incrementing primary key from Dexie.
    name: string;
    description: string;
}

/**
 * Represents a single World, the top-level container for all content.
 * Each world is a self-contained universe.
 * REFACTOR: Now extends BaseManageable to inherit id, name, and description.
 */
export interface World extends BaseManageable {
    createdAt: Date;
}

/**
 * Represents a Campaign within a specific World.
 * This is a single story arc or adventure.
 * REFACTOR: Now extends BaseManageable.
 */
export interface Campaign extends BaseManageable {
    worldId: number; // Foreign key to the World table.
    status: 'active' | 'archived' | 'planned';
    createdAt: Date;
}

/**
 * Represents a Character.
 * Characters belong to a World and can be associated with multiple Campaigns.
 * REFACTOR: Now extends BaseManageable.
 */
export interface Character extends BaseManageable {
    worldId: number; // Foreign key to the World table.
    type: 'PC' | 'NPC' | 'Enemy';
    // An array of campaign IDs this character is involved in.
    campaignIds: number[];
    createdAt: Date;
}

// We will add more interfaces here as we build out other features
// like Lore, Abilities, Rules, etc.
