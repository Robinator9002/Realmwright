// src/components/specific/Class/editor/PropertiesSidebar.tsx

/**
 * COMMIT: refactor(class-sheet): remove obsolete props from PropertiesSidebar
 *
 * Rationale:
 * This component was still passing props down to `BlockLayoutEditor` and
 * `BlockSpecificPropertiesEditor` after those components were refactored to
 * connect directly to the Zustand store. This caused TypeScript errors and
 * was unnecessary prop drilling.
 *
 * Implementation Details:
 * - Removed all props being passed to the child editor components. They are
 * now rendered with no props, as they are fully self-sufficient.
 * - This resolves the final TypeScript error and completes the component
 * decoupling initiated in Phase 3.
 */
import type { FC } from 'react';
import { Trash2 } from 'lucide-react';
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';
import { BlockLayoutEditor } from './sidebar/BlockLayoutEditor';
import { BlockSpecificPropertiesEditor } from './sidebar/BlockSpecificPropertiesEditor';

export const PropertiesSidebar: FC = () => {
    // --- ZUSTAND STORE ---
    const { selectedBlock, setSelectedBlockId, deleteBlock } = useClassSheetStore((state) => ({
        selectedBlock: state.selectedBlock, // Use the derived value from the store
        setSelectedBlockId: state.setSelectedBlockId,
        deleteBlock: state.deleteBlock,
    }));

    if (!selectedBlock) {
        return null;
    }

    return (
        <aside className="properties-sidebar">
            <div className="properties-sidebar__header">
                <h3 className="sidebar__title">Properties</h3>
                <button
                    onClick={() => setSelectedBlockId(null)}
                    className="properties-sidebar__close-button"
                >
                    &times;
                </button>
            </div>

            <div className="properties-sidebar__content">
                {/* FIX: Child components are now self-sufficient and take no props. */}
                <BlockLayoutEditor />
                <BlockSpecificPropertiesEditor />
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
