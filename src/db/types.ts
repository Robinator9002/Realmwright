// src/db/types.ts

/**
 * Represents a single World, the top-level container for all content.
 * Each world is a self-contained universe.
 */
export interface World {
    id?: number; // Optional: The auto-incrementing primary key from Dexie.
    name: string;
    description: string;
    createdAt: Date;
}

/**
 * Represents a Campaign within a specific World.
 * This is a single story arc or adventure.
 */
export interface Campaign {
    id?: number;
    worldId: number; // Foreign key to the World table.
    name: string;
    description: string;
    status: 'active' | 'archived' | 'planned';
    createdAt: Date;
}

/**
 * Represents a Character.
 * Characters belong to a World and can be associated with multiple Campaigns.
 */
export interface Character {
    id?: number;
    worldId: number; // Foreign key to the World table.
    name: string;
    type: 'PC' | 'NPC' | 'Enemy';
    // An array of campaign IDs this character is involved in.
    campaignIds: number[];
    // The main description, background, etc. Can support Markdown.
    description: string;
    createdAt: Date;
}

// We will add more interfaces here as we build out other features
// like Lore, Abilities, Rules, etc.
