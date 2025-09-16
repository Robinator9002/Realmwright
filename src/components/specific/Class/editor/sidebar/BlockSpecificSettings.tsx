// src/components/specific/Class/editor/sidebar/BlockSpecificSettings.tsx

import type { FC } from 'react';
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';
import { AbilityTreeSettings } from '../../../SheetBlocks/settings/content/AbilityTreeSettings';
import { RichTextBlockSettings } from '../../../SheetBlocks/settings/content/RichTextBlockSettings';
// NEW: Import the settings panel for the notes block.
import { NotesBlockSettings } from '../../../SheetBlocks/settings/content/NotesBlockSettings';

/**
 * A "router" component that renders the appropriate settings UI based on the
 * currently selected block's type.
 */
export const BlockSpecificSettings: FC = () => {
    // --- ZUSTAND STORE ---
    const selectedBlock = useClassSheetStore((state) => {
        if (!state.selectedBlockId) return null;
        return (
            state.editableClass?.characterSheet[state.activePageIndex]?.blocks.find(
                (b) => b.id === state.selectedBlockId,
            ) || null
        );
    });

    if (!selectedBlock) {
        return null;
    }

    // --- RENDER LOGIC ---
    // This switch statement determines which settings component to show.
    const renderSettings = () => {
        switch (selectedBlock.type) {
            case 'ability_tree':
                return <AbilityTreeSettings />;

            case 'rich_text':
                return <RichTextBlockSettings />;

            // NEW: Add the case for the notes block.
            case 'notes':
                return <NotesBlockSettings />;

            // Other block types will be added here in the future.
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
