// src/constants/sheetEditor.constants.tsx

/**
 * COMMIT: feat(class-sheet): add 'Notes' block type
 *
 * Rationale:
 * As part of the final polishing phase, this commit introduces a new,
 * versatile "Notes" block. This provides users with a generic, unformatted
 * text area for private GM notes, flavor text, or any other custom
 * information they wish to include on a character sheet.
 *
 * Implementation Details:
 * - Imported the `StickyNote` icon from `lucide-react`.
 * - Added a new entry to the `blockTypes` array for the 'notes' block type,
 * associating it with the new icon and a user-friendly label.
 * - This change makes the "Add Note" button available in the editor's
 * "Add Blocks" sidebar.
 */
import type { ReactNode } from 'react';
// NEW: Import the StickyNote icon for the new block type.
import { Type, BarChart2, Swords, Backpack, FileText, StickyNote } from 'lucide-react';
import type { SheetBlock } from '../db/types';

// Defines the available blocks that a user can add to a character sheet.
// This array is used to render the buttons in the editor's sidebar.
export const blockTypes: {
    type: SheetBlock['type'];
    label: string;
    icon: ReactNode;
}[] = [
    { type: 'details', label: 'Details', icon: <Type size={16} /> },
    { type: 'stats', label: 'Stats Panel', icon: <BarChart2 size={16} /> },
    { type: 'ability_tree', label: 'Ability Tree', icon: <Swords size={16} /> },
    { type: 'inventory', label: 'Inventory', icon: <Backpack size={16} /> },
    { type: 'rich_text', label: 'Rich Text', icon: <FileText size={16} /> },
    // NEW: Add the Notes block to the list of available blocks.
    { type: 'notes', label: 'Note', icon: <StickyNote size={16} /> },
];
