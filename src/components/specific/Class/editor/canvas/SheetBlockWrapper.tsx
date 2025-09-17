// src/components/specific/Class/editor/canvas/SheetBlockWrapper.tsx

import type { FC, ReactNode, CSSProperties } from 'react';
import { Settings } from 'lucide-react';
import type { SheetBlock } from '../../../../../db/types';
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';

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

    // REWORK: Create a style object to apply dynamic styles from the block's data.
    const contentStyles: CSSProperties = {
        textAlign: block.styles?.textAlign || 'left',
    };

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
            {/* REWORK: Apply the dynamic styles to the content wrapper. */}
            <div className="sheet-block__content" style={contentStyles}>
                {children}
            </div>
        </div>
    );
};
