// src/db/types.ts

/**
 * A base interface for all manageable entities, ensuring they have
 * a consistent core structure.
 */
export interface BaseManageable {
    id?: number; // Optional: The auto-incrementing primary key from Dexie.
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
}

/**
 * NEW: Represents a single entry in the world's chronicle.
 * This can be an article about a faction, a location, a historical event, etc.
 */
export interface LoreEntry extends BaseManageable {
    worldId: number; // Foreign key to the World table.
    // A user-defined category for organization (e.g., 'Faction', 'Location', 'Deity').
    category: string;
    // The main content of the lore entry. Will support rich text in the future.
    content: string;
    createdAt: Date;
}
