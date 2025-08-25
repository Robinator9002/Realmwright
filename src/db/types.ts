// src/db/types.ts

/**
 * COMMIT: feat(class-sheet): add layout properties to SheetBlock type
 *
 * Rationale:
 * To support the new grid-based, multi-column character sheet editor, the
 * core `SheetBlock` type needs to be aware of layout. This commit introduces
 * an optional `width` property.
 *
 * Implementation Details:
 * - Added `width?: 'full' | 'half'` to the `SheetBlock` interface.
 * - This property will allow the `ClassSheetEditor` to render blocks that
 * span one or two columns, enabling much more flexible and visually
 * appealing character sheet designs.
 * - The property is optional to maintain backward compatibility and to allow
 * for a default behavior (e.g., defaulting to 'half' width).
 */

// --- Character Sheet Structure Definition ---

export type SheetBlock = {
    id: string;
    type: 'details' | 'stats' | 'ability_tree' | 'inventory' | 'rich_text' | 'notes';
    content?: any;
    // NEW: Optional layout properties for the grid-based sheet editor.
    // 'full' will span two columns, 'half' will span one.
    width?: 'full' | 'half';
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

export type PrerequisiteLogicType = 'AND' | 'OR';

export type PrerequisiteGroup = {
    type: PrerequisiteLogicType;
    abilityIds: number[];
};

export type AttachmentPoint = {
    id: string;
    allowedAttachmentType?: string;
    attachedTreeId?: number;
};

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

export interface AbilityTree extends BaseManageable {
    worldId: number;
    createdAt: Date;
    tierCount: number;
    attachmentType?: string;
}
