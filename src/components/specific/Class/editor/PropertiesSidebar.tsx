// src/components/specific/Class/editor/PropertiesSidebar.tsx

/**
 * COMMIT: feat(class-sheet): add block deletion functionality to sidebar
 *
 * Rationale:
 * To fulfill a core requirement of the editor, this commit introduces the
 * ability for users to delete a selected block via the properties sidebar.
 *
 * Implementation Details:
 * - A new `onDeleteBlock` callback prop has been added to the component's
 * interface.
 * - A "Delete Block" button is now rendered in the footer of the sidebar.
 * - The button's `onClick` handler invokes the `onDeleteBlock` callback,
 * passing up the ID of the currently selected block to be deleted.
 * - This provides the essential UI hook for the deletion logic, which will be
 * handled by the parent ClassSheetEditor.
 */
import type { FC } from 'react';
import type { SheetBlock, CharacterClass, SheetBlockLayout } from '../../../../db/types';
import { BlockLayoutEditor } from './sidebar/BlockLayoutEditor';
import { BlockSpecificPropertiesEditor } from './sidebar/BlockSpecificPropertiesEditor';
import { Trash2 } from 'lucide-react';

export interface PropertiesSidebarProps {
    selectedBlock: SheetBlock | null;
    characterClass: CharacterClass;
    onUpdateBlockLayout: (blockId: string, newLayout: Partial<SheetBlockLayout>) => void;
    onUpdateBlockContent: (blockId: string, newContent: any) => void;
    onUpdateBaseStat: (statId: number, value: number) => void;
    onDeselect: () => void;
    // NEW: Add a prop for the delete handler.
    onDeleteBlock: (blockId: string) => void;
}

export const PropertiesSidebar: FC<PropertiesSidebarProps> = (props) => {
    const { selectedBlock, onDeselect, onDeleteBlock } = props;

    if (!selectedBlock) {
        return null;
    }

    return (
        <aside className="properties-sidebar">
            <div className="properties-sidebar__header">
                <h3 className="sidebar__title">Properties</h3>
                <button onClick={onDeselect} className="properties-sidebar__close-button">
                    &times;
                </button>
            </div>

            <div className="properties-sidebar__content">
                <BlockLayoutEditor
                    selectedBlock={selectedBlock}
                    onUpdateBlockLayout={props.onUpdateBlockLayout}
                />
                <BlockSpecificPropertiesEditor {...props} />
            </div>

            {/* NEW: Added a footer with a delete button. */}
            <div className="properties-sidebar__footer">
                <button
                    onClick={() => onDeleteBlock(selectedBlock.id)}
                    className="button button--danger w-full"
                >
                    <Trash2 size={16} /> Delete Block
                </button>
            </div>
        </aside>
    );
};
