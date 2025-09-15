// src/components/specific/Class/editor/PropertiesSidebar.tsx

import type { FC } from 'react';
import { Trash2 } from 'lucide-react';
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';
import { BlockLayoutEditor } from './sidebar/BlockLayoutEditor';
import { BlockSpecificPropertiesEditor } from './sidebar/BlockSpecificPropertiesEditor';
import type { SheetBlock } from '../../../../db/types';

export const PropertiesSidebar: FC = () => {
    // --- ZUSTAND STORE ---
    // REWORK: Select the raw state needed to find the block, ensuring reactivity.
    const { editableClass, activePageIndex, selectedBlockId, setSelectedBlockId, deleteBlock } =
        useClassSheetStore((state) => ({
            editableClass: state.editableClass,
            activePageIndex: state.activePageIndex,
            selectedBlockId: state.selectedBlockId,
            setSelectedBlockId: state.setSelectedBlockId,
            deleteBlock: state.deleteBlock,
        }));

    // --- DERIVED STATE ---
    // Find the selected block object based on the current state.
    const selectedBlock: SheetBlock | null =
        editableClass?.characterSheet[activePageIndex]?.blocks.find(
            (b) => b.id === selectedBlockId,
        ) || null;

    // This component only renders when a block is selected.
    if (!selectedBlock) {
        return null;
    }

    return (
        <aside className="properties-sidebar">
            <div className="properties-sidebar__header">
                <h3 className="sidebar__title">Block Properties</h3>
                <button
                    onClick={() => setSelectedBlockId(null)}
                    className="properties-sidebar__close-button"
                    title="Close Properties"
                >
                    &times;
                </button>
            </div>

            <div className="properties-sidebar__content">
                {/* These children will be updated next to use the new pattern */}
                <BlockLayoutEditor />
                <BlockSpecificPropertiesEditor />
            </div>

            <div className="properties-sidebar__footer">
                <button
                    onClick={() => deleteBlock(selectedBlock.id)}
                    className="button button--danger w-full"
                >
                    <Trash2 size={16} /> Delete Block
                </button>
            </div>
        </aside>
    );
};
