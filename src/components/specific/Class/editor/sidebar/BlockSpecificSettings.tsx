// src/components/specific/Class/editor/sidebar/BlockSpecificSettings.tsx

import type { FC } from 'react';
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';
import type { SheetBlock } from '../../../../../db/types';

/**
 * A "router" component that renders the appropriate settings UI for the
 * currently selected block based on its type. This keeps the main
 * properties sidebar clean and allows for modular, block-specific settings panels.
 */
export const BlockSpecificSettings: FC = () => {
    // --- ZUSTAND STORE ---
    const { editableClass, activePageIndex, selectedBlockId } = useClassSheetStore((state) => ({
        editableClass: state.editableClass,
        activePageIndex: state.activePageIndex,
        selectedBlockId: state.selectedBlockId,
    }));

    // --- DERIVED STATE ---
    const selectedBlock: SheetBlock | null =
        editableClass?.characterSheet[activePageIndex]?.blocks.find(
            (b) => b.id === selectedBlockId,
        ) || null;

    if (!selectedBlock) {
        // This should not happen if the component is used correctly within PropertiesSidebar
        return null;
    }

    /**
     * Renders the specific settings component based on the block type.
     * In the future, these will be broken out into their own components,
     * but are kept inline for this foundational step.
     */
    const renderSettings = () => {
        switch (selectedBlock.type) {
            case 'ability_tree':
                // Placeholder for AbilityTreeSettings.tsx
                return <p className="panel__empty-message--small">Ability Tree settings...</p>;

            case 'rich_text':
                // Placeholder for RichTextSettings.tsx
                return <p className="panel__empty-message--small">Rich Text settings...</p>;

            case 'notes':
                // Placeholder for NotesSettings.tsx
                return <p className="panel__empty-message--small">Notes settings...</p>;

            case 'inventory':
                // Placeholder for InventorySettings.tsx
                return <p className="panel__empty-message--small">Inventory settings...</p>;

            case 'details':
            case 'stats':
            default:
                return (
                    <p className="panel__empty-message--small">
                        No specific properties for this block type.
                    </p>
                );
        }
    };

    return (
        <div className="properties-sidebar__section">
            <h4 className="properties-sidebar__section-title">Block Specific</h4>
            {renderSettings()}
        </div>
    );
};
