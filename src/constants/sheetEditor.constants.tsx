// src/constants/sheetEditor.constants.tsx

/**
 * COMMIT: fix(class-sheet): correct file type and imports for constants
 *
 * Rationale:
 * The previous commit created this file as a `.ts` file, which cannot
 * contain JSX. This caused TypeScript compilation errors. Additionally, the
 * import path to the types file was incorrect based on the new project
 * structure.
 *
 * Implementation Details:
 * - Renamed the file to `sheetEditor.constants.tsx` to allow for JSX syntax.
 * - Added `import type { ReactNode } from 'react'` to satisfy the JSX type
 * requirements.
 * - Corrected the import path for `SheetBlock` from `../../../db/types` to
 * the correct `../db/types`.
 */
import type { ReactNode } from 'react';
import { Type, BarChart2, Swords, Backpack, FileText } from 'lucide-react';
// FIX: Corrected the import path based on the new file location.
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
];
