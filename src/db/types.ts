// src/db/types.ts

/**
 * COMMIT: feat(class-sheet): overhaul SheetBlock type for canvas editor
 *
 * Rationale:
 * To support the new free-form, WYSIWYG page canvas editor, the data model
 * for a SheetBlock has been fundamentally changed. The previous grid-based
 * `width` property is insufficient for tracking position, size, and style.
 *
 * Implementation Details:
 * - Removed the `width?: 'full' | 'half'` property from `SheetBlock`.
 * - Added a mandatory `layout` object to store the block's position (x, y),
 * dimensions (w, h), and stacking order (zIndex). This data will be
 * managed by the `react-grid-layout` library.
 * - Added an optional `styles` object to store customizable visual
 * properties like font size and text alignment, enabling deeper user
 * customization.
 */

// --- Character Sheet Structure Definition ---

export interface SheetBlockLayout {
    x: number; // Position from the left edge of the page
    y: number; // Position from the top edge of the page
    w: number; // Width of the block
    h: number; // Height of the block
    zIndex: number; // Stacking order
}

export interface SheetBlockStyles {
    fontSize?: string;
    textAlign?: 'left' | 'center' | 'right';
    // Future style properties (e.g., color, backgroundColor) can be added here.
}

export type SheetBlock = {
    id: string;
    type: 'details' | 'stats' | 'ability_tree' | 'inventory' | 'rich_text' | 'notes';
    content?: any;
    layout: SheetBlockLayout;
    styles?: SheetBlockStyles;
    config?: any;
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
