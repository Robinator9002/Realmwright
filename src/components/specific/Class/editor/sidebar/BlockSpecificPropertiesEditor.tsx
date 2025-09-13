// src/components/specific/Class/editor/sidebar/BlockSpecificPropertiesEditor.tsx

/**
 * COMMIT: feat(class-sheet): extract BlockSpecificPropertiesEditor component
 *
 * Rationale:
 * To continue the modularization of the PropertiesSidebar, this commit
 * extracts the dynamic `switch` statement responsible for rendering the
 * correct property editor into its own dedicated component.
 *
 * Implementation Details:
 * - This component serves as a "router" for the properties section,
 * consuming the selected block and rendering the appropriate editor.
 * - It imports specialized editor components (e.g., StatsPropsEditor),
 * which will be created in subsequent steps.
 * - This change further decouples the main sidebar from the specific logic
 * of each block type, making the system easier to maintain and extend.
 */
import type { FC } from 'react';
import type { PropertiesSidebarProps } from '../PropertiesSidebar';

// Import individual property editor components (to be created)
import { StatsPropsEditor } from '../property-editors/StatsPropsEditor';
import { AbilityTreePropsEditor } from '../property-editors/AbilityTreePropsEditor';
import { RichTextPropsEditor } from '../property-editors/RichTextPropsEditor';
import { InventoryPropsEditor } from '../property-editors/InventoryPropsEditor';

type BlockSpecificPropertiesEditorProps = Omit<
    PropertiesSidebarProps,
    'onUpdateBlockLayout' | 'onDeselect'
>;

export const BlockSpecificPropertiesEditor: FC<BlockSpecificPropertiesEditorProps> = (props) => {
    if (!props.selectedBlock) return null;

    const editorSwitch = () => {
        switch (props.selectedBlock?.type) {
            case 'stats':
                return (
                    <StatsPropsEditor
                        characterClass={props.characterClass}
                        onUpdateBaseStat={props.onUpdateBaseStat}
                    />
                );
            case 'ability_tree':
                return (
                    <AbilityTreePropsEditor
                        selectedBlock={props.selectedBlock}
                        onUpdateBlockContent={props.onUpdateBlockContent}
                    />
                );
            case 'rich_text':
                return (
                    <RichTextPropsEditor
                        selectedBlock={props.selectedBlock}
                        onUpdateBlockContent={props.onUpdateBlockContent}
                    />
                );
            case 'inventory':
                return (
                    <InventoryPropsEditor
                        selectedBlock={props.selectedBlock}
                        onUpdateBlockContent={props.onUpdateBlockContent}
                    />
                );
            default:
                return (
                    <p className="panel__empty-message--small">
                        This block type has no specific properties to edit.
                    </p>
                );
        }
    };

    return (
        <div className="properties-sidebar__section">
            <h4 className="properties-sidebar__section-title">Component Properties</h4>
            {editorSwitch()}
        </div>
    );
};
