// src/components/specific/Class/editor/sidebar/BlockSpecificPropertiesEditor.tsx

/**
 * COMMIT: feat(class-sheet): create contextual property editor component
 *
 * Rationale:
 * To fulfill Phase 3.1 of the plan, this commit introduces a new "router"
 * component. Its sole responsibility is to render the correct property
 * editor UI based on the type of the currently selected sheet block.
 *
 * Implementation Details:
 * - The component consumes the `useClassSheetStore` to get the selected block.
 * - A `switch` statement is used to determine which specific property editor
 * component (e.g., StatsPropsEditor, RichTextPropsEditor) to render.
 * - It provides a default message for block types that do not have any
 * specific properties to edit.
 * - This acts as the central hub for the sidebar's contextual content.
 */
import type { FC } from 'react';
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';
import { StatsPropsEditor } from '../property-editors/StatsPropsEditor';
import { RichTextPropsEditor } from '../property-editors/RichTextPropsEditor';
import { AbilityTreePropsEditor } from '../property-editors/AbilityTreePropsEditor';
import { InventoryPropsEditor } from '../property-editors/InventoryPropsEditor';

export const BlockSpecificPropertiesEditor: FC = () => {
    // This component no longer needs props; it gets everything from the store.
    const selectedBlock = useClassSheetStore((state) => state.selectedBlock);

    // If no block is selected, render nothing.
    if (!selectedBlock) {
        return null;
    }

    // This component acts as a router, rendering the correct editor
    // based on the selected block's type.
    const renderEditorForBlockType = () => {
        switch (selectedBlock.type) {
            case 'stats':
                return <StatsPropsEditor />;
            case 'rich_text':
            case 'notes': // Notes and Rich Text use the same editor
                return <RichTextPropsEditor />;
            case 'ability_tree':
                return <AbilityTreePropsEditor />;
            case 'inventory':
                return <InventoryPropsEditor />;
            default:
                // For blocks with no specific properties (like 'details')
                return (
                    <p className="panel__empty-message--small">
                        This block has no specific properties to edit.
                    </p>
                );
        }
    };

    return (
        <div className="properties-sidebar__section">
            <h4 className="properties-sidebar__section-title">Block Properties</h4>
            {renderEditorForBlockType()}
        </div>
    );
};
