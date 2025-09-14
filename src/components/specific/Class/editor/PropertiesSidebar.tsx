// src/components/specific/Class/editor/PropertiesSidebar.tsx

import type { FC } from 'react';
import { Trash2 } from 'lucide-react';
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';
import { BlockLayoutEditor } from './sidebar/BlockLayoutEditor';
import { BlockSpecificPropertiesEditor } from './sidebar/BlockSpecificPropertiesEditor';

export const PropertiesSidebar: FC = () => {
    // --- ZUSTAND STORE ---
    const { selectedBlock, setSelectedBlockId, deleteBlock } = useClassSheetStore((state) => ({
        selectedBlock: state.selectedBlock,
        setSelectedBlockId: state.setSelectedBlockId,
        deleteBlock: state.deleteBlock,
    }));

    // REVERT: This component should only render when a block is selected.
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
