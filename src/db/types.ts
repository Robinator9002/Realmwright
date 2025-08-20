// src/db/types.ts

// --- NEW: Character Sheet Structure Definition ---

/**
 * Represents a single configurable block on a character sheet.
 * The 'content' will hold different data depending on the block type.
 * e.g., for 'ability_tree', content would be an abilityTreeId.
 * e.g., for 'rich_text', content would be a string of HTML/Markdown.
 */
export type SheetBlock = {
    id: string; // A unique ID for this block (e.g., generated with crypto.randomUUID())
    type: 'details' | 'stats' | 'ability_tree' | 'inventory' | 'rich_text' | 'notes';
    content?: any;
};

/**
 * Represents a single page within a character sheet layout.
 */
export type SheetPage = {
    id: string; // A unique ID for the page
    name: string;
    blocks: SheetBlock[];
};

// --- Core Entity Interfaces ---

/**
 * A base interface for all manageable entities.
 */
export interface BaseManageable {
    id?: number;
    name: string;
    description: string;
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
 * Represents a Character, which is an INSTANCE of a Class.
 */
export interface Character extends BaseManageable {
    worldId: number;
    classId: number; // A character MUST belong to a class now.
    type: 'PC' | 'NPC' | 'Enemy';
    campaignIds: number[];
    createdAt: Date;
    // Holds the character's CURRENT stats, which may be modified from the class base.
    stats: { [statId: number]: number };
    // Holds the IDs of abilities the character has specifically learned.
    learnedAbilities: number[];
    // Holds instance-specific data, like inventory items or notes content.
    instanceData: { [blockId: string]: any };
}

/**
 * Represents a Character Class, the BLUEPRINT for a character sheet.
 */
export interface CharacterClass extends BaseManageable {
    worldId: number;
    // The base stats for any character of this class.
    baseStats: { [statId: number]: number };
    // The layout and structure of the character sheet for this class.
    characterSheet: SheetPage[];
    createdAt: Date;
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
    // NEW: Categorizes the stat to determine its behavior.
    type: 'primary' | 'derived' | 'resource';
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
