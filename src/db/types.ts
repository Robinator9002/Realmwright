// src/db/types.ts

// --- Character Sheet Structure Definition ---

export type SheetBlock = {
    id: string;
    type: 'details' | 'stats' | 'ability_tree' | 'inventory' | 'rich_text' | 'notes';
    content?: any;
};

export type SheetPage = {
    id: string;
    name: string;
    blocks: SheetBlock[];
};

// --- Core Entity Interfaces ---

export interface BaseManageable {
    id?: number;
    name: string;
    description: string;
}

export interface World extends BaseManageable {
    createdAt: Date;
}

export interface Campaign extends BaseManageable {
    worldId: number;
    status: 'active' | 'archived' | 'planned';
    createdAt: Date;
}

export interface Character extends BaseManageable {
    worldId: number;
    classId: number;
    type: 'PC' | 'NPC' | 'Enemy';
    campaignIds: number[];
    createdAt: Date;
    stats: { [statId: number]: number };
    learnedAbilities: number[];
    instanceData: { [blockId: string]: any };
}

export interface CharacterClass extends BaseManageable {
    worldId: number;
    baseStats: { [statId: number]: number };
    characterSheet: SheetPage[];
    createdAt: Date;
}

export interface LoreEntry extends BaseManageable {
    worldId: number;
    category: string;
    content: string;
    createdAt: Date;
}

export interface StatDefinition extends BaseManageable {
    worldId: number;
    abbreviation: string;
    defaultValue: number;
    createdAt: Date;
    type: 'primary' | 'derived' | 'resource';
}

// --- Ability System Interfaces ---

export type PrerequisiteGroup = {
    type: 'AND' | 'OR';
    abilityIds: number[];
};

/**
 * REWORKED: The AttachmentPoint now includes an optional property
 * to specify what kind of tree it is allowed to accept.
 */
export type AttachmentPoint = {
    id: string; // A unique ID for this specific socket
    // RENAMED for clarity from acceptedTreeType to allowedAttachmentType
    allowedAttachmentType?: string; // An optional tag to filter what can be attached
    attachedTreeId?: number; // The ID of the AbilityTree currently attached
};

/**
 * Represents a single ability or skill (a "node" in a tree).
 */
export interface Ability extends BaseManageable {
    worldId: number;
    abilityTreeId: number;
    prerequisites: PrerequisiteGroup[];
    createdAt: Date;
    x?: number;
    y?: number;
    tier: number;
    iconUrl?: string;
    attachmentPoint?: AttachmentPoint;
}

/**
 * REWORKED: An AbilityTree can now be categorized with an attachmentType,
 * defining what kind of "thing" it is (e.g., "Weapon Mod", "Class Feat").
 */
export interface AbilityTree extends BaseManageable {
    worldId: number;
    createdAt: Date;
    tierCount: number;
    // NEW: An optional type for categorization.
    attachmentType?: string;
}
