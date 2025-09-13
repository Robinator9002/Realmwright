// src/components/specific/Class/editor/PropertiesSidebar.tsx

/**
 * COMMIT: refactor(class-sheet): simplify PropertiesSidebar into a container
 *
 * Rationale:
 * To complete its refactoring, the PropertiesSidebar is now a lean container
 * component. It delegates all complex rendering logic to its new, specialized
 * child components, adhering to the single-responsibility principle.
 *
 * Implementation Details:
 * - The component now imports and renders `<BlockLayoutEditor />` and
 * `<BlockSpecificPropertiesEditor />`.
 * - All internal logic for rendering specific property editors has been
 * removed, as it now resides in the new child components.
 * - The component's primary role is to render the main sidebar structure
 * (header, content sections) and pass the necessary props down the chain.
 * This significantly reduces its complexity and improves maintainability.
 */
import type { FC } from 'react';
import type { SheetBlock, CharacterClass, SheetBlockLayout } from '../../../../db/types';
import { BlockLayoutEditor } from './sidebar/BlockLayoutEditor';
import { BlockSpecificPropertiesEditor } from './sidebar/BlockSpecificPropertiesEditor';

export interface PropertiesSidebarProps {
    selectedBlock: SheetBlock | null;
    characterClass: CharacterClass;
    onUpdateBlockLayout: (blockId: string, newLayout: Partial<SheetBlockLayout>) => void;
    onUpdateBlockContent: (blockId: string, newContent: any) => void;
    onUpdateBaseStat: (statId: number, value: number) => void;
    onDeselect: () => void;
}

export const PropertiesSidebar: FC<PropertiesSidebarProps> = (props) => {
    const { selectedBlock, onDeselect } = props;

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
        </aside>
    );
};
