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

/**
 * REWORK: Defines a group of prerequisites with a specific logical operator.
 * This allows for creating complex requirements like (AbilityA AND AbilityB) OR (AbilityC).
 */
export type PrerequisiteGroup = {
    type: 'AND' | 'OR'; // The logic gate for this group.
    abilityIds: number[];
    // In the future, we could even nest groups: nestedGroups?: PrerequisiteGroup[];
};

/**
 * Represents a single ability or skill (a "node" in a tree).
 */
export interface Ability extends BaseManageable {
    worldId: number;
    abilityTreeId: number;
    // REWORK: Prerequisites are now an array of logical groups.
    prerequisites: PrerequisiteGroup[];
    createdAt: Date;
    x?: number;
    y?: number;
    tier: number;
    // NEW: An optional URL for a custom icon image.
    iconUrl?: string;
}

/**
 * Represents a container for a set of related abilities (a "tree").
 */
export interface AbilityTree extends BaseManageable {
    worldId: number;
    createdAt: Date;
    // NEW: The number of tiers this specific tree has.
    tierCount: number;
}
