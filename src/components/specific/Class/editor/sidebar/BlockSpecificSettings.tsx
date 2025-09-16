// src/components/specific/Class/editor/sidebar/BlockSpecificSettings.tsx

import type { FC } from 'react';
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';
// NEW: Import the concrete settings component from its new location.
import { AbilityTreeSettings } from '../../../SheetBlocks/settings/content/AbilityTreeSettings';

/**
 * A "router" component that renders the appropriate settings UI based on the
 * currently selected block's type.
 */
export const BlockSpecificSettings: FC = () => {
    // --- ZUSTAND STORE ---
    const { selectedBlockId, getBlockById } = useClassSheetStore((state) => ({
        selectedBlockId: state.selectedBlockId,
        getBlockById: (id: string) =>
            state.editableClass?.characterSheet[state.activePageIndex]?.blocks.find(
                (b) => b.id === id,
            ),
    }));

    // --- DERIVED STATE ---
    const selectedBlock = selectedBlockId ? getBlockById(selectedBlockId) : null;

    if (!selectedBlock) {
        return null; // Should not happen if a block is selected, but a safe guard.
    }

    // --- RENDER LOGIC ---
    const renderSettings = () => {
        switch (selectedBlock.type) {
            case 'ability_tree':
                // REWORK: Replace the placeholder with the actual settings component.
                return <AbilityTreeSettings />;

            // Future block-specific settings components will be added here.
            case 'stats':
            case 'details':
            case 'inventory':
            case 'rich_text':
            case 'notes':
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
