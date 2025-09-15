// src/components/specific/Class/editor/sidebar/BlockSpecificPropertiesEditor.tsx

/**
 * COMMIT: feat(class-sheet): implement block-specific properties editor
 *
 * Rationale:
 * The properties sidebar was rendering as an empty container because the
 * component responsible for displaying contextual editors was not implemented.
 * This commit introduces the necessary logic to render the correct property
 * editor based on the selected block's type.
 *
 * Implementation Details:
 * - The component now uses the `useClassSheetStore` to get the `selectedBlock`.
 * - A `switch` statement on `selectedBlock.type` acts as a router.
 * - Each `case` returns the corresponding editor component (e.g.,
 * `StatsPropsEditor` for a 'stats' block).
 * - A `default` case is included to gracefully handle blocks that have no
 * specific properties to edit, displaying a user-friendly message instead
 * of an empty space. This completes the functionality of the properties sidebar.
 */
import type { FC } from 'react';
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';

// Import all the specific property editor components
import { StatsPropsEditor } from '../property-editors/StatsPropsEditor';
import { RichTextPropsEditor } from '../property-editors/RichTextPropsEditor';
import { AbilityTreePropsEditor } from '../property-editors/AbilityTreePropsEditor';
import { InventoryPropsEditor } from '../property-editors/InventoryPropsEditor';

export const BlockSpecificPropertiesEditor: FC = () => {
    const selectedBlock = useClassSheetStore((state) => state.selectedBlock);

    if (!selectedBlock) {
        return null;
    }

    switch (selectedBlock.type) {
        case 'stats':
            return <StatsPropsEditor />;
        case 'rich_text':
            return <RichTextPropsEditor />;
        case 'ability_tree':
            return <AbilityTreePropsEditor />;
        case 'inventory':
            return <InventoryPropsEditor />;
        // Handle blocks with no specific properties.
        case 'details':
        case 'notes':
        default:
            return (
                <p className="panel__empty-message--small">
                    This block has no specific properties to edit.
                </p>
            );
    }
};
