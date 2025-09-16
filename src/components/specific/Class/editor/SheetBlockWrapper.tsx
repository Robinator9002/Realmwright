// src/components/specific/Class/editor/SheetBlockWrapper.tsx

import type { FC, ReactNode } from 'react';
import { Settings } from 'lucide-react';
import type { SheetBlock } from '../../../../db/types';
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';

// --- HELPER FUNCTIONS ---

/**
 * Converts a block type string (e.g., 'rich_text') into a human-readable name.
 * @param type The block type from the SheetBlock object.
 * @returns A formatted string (e.g., 'Rich Text').
 */
const getBlockDisplayName = (type: string): string => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

// --- COMPONENT PROPS ---

interface SheetBlockWrapperProps {
    block: SheetBlock;
    children: ReactNode;
}

// --- COMPONENT DEFINITION ---

/**
 * A universal wrapper component that provides the common UI "chrome" for any
 * type of sheet block. This includes the header with a title and settings
 * button, and the main content area.
 */
export const SheetBlockWrapper: FC<SheetBlockWrapperProps> = ({ block, children }) => {
    const setSelectedBlockId = useClassSheetStore((state) => state.setSelectedBlockId);
    const displayName = getBlockDisplayName(block.type);

    return (
        <div className="sheet-block">
            <div className="sheet-block__header">
                <h5 className="sheet-block__title">{displayName}</h5>
                <button
                    className="sheet-block__config-button"
                    title={`Configure ${displayName}`}
                    onClick={() => setSelectedBlockId(block.id)}
                >
                    <Settings size={14} />
                </button>
            </div>
            <div className="sheet-block__content">{children}</div>
        </div>
    );
};
