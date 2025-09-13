// src/components/specific/Class/editor/sidebar/BlockSpecificPropertiesEditor.tsx

/**
 * COMMIT: feat(class-sheet): add default case to properties editor
 *
 * Rationale:
 * To complete the editor's functionality, the properties sidebar needs to
 * gracefully handle blocks that do not have any specific, configurable
 * properties (e.g., the 'Details' or 'Notes' blocks).
 *
 * Implementation Details:
 * - Added `case` statements for 'details' and 'notes' to the `switch`.
 * - These cases, along with the `default` case, now render a user-friendly
 * message indicating that no specific properties are available for editing.
 * - This prevents the sidebar from appearing empty or broken and provides
 * clear feedback to the user, completing the planned feature set.
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
        // NEW: Handle blocks with no specific properties.
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
