// src/components/specific/Class/editor/PropertiesSidebar.tsx

import type { FC } from 'react';
import { Trash2 } from 'lucide-react';
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';
import type { SheetBlock } from '../../../../db/types';
import { BlockLayoutSettings } from './sidebar/BlockLayoutSettings';
import { BlockAppearanceSettings } from './sidebar/BlockAppearanceSettings';

export const PropertiesSidebar: FC = () => {
    // --- ZUSTAND STORE ---
    const { editableClass, activePageIndex, selectedBlockId, setSelectedBlockId, deleteBlock } =
        useClassSheetStore((state) => ({
            editableClass: state.editableClass,
            activePageIndex: state.activePageIndex,
            selectedBlockId: state.selectedBlockId,
            setSelectedBlockId: state.setSelectedBlockId,
            deleteBlock: state.deleteBlock,
        }));

    // --- DERIVED STATE ---
    const selectedBlock: SheetBlock | null =
        editableClass?.characterSheet[activePageIndex]?.blocks.find(
            (b) => b.id === selectedBlockId,
        ) || null;

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
                <BlockLayoutSettings />
                <BlockAppearanceSettings />
                {/* A placeholder for the future contextual settings */}
                <div className="properties-sidebar__section">
                    <h4 className="properties-sidebar__section-title">Block Specific</h4>
                    <p className="panel__empty-message--small">
                        No specific properties for this block type.
                    </p>
                </div>
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
