// src/components/specific/Class/editor/PropertiesSidebar.tsx

/**
 * COMMIT: refactor(class-sheet): connect PropertiesSidebar to Zustand store
 *
 * Rationale:
 * This commit completes Phase 1.3 by refactoring the final child component,
 * the PropertiesSidebar, to connect directly to the Zustand store.
 *
 * Implementation Details:
 * - The component's props interface has been completely removed.
 * - It now uses the `useClassSheetStore` hook to select the `selectedBlock`,
 * `editableClass`, and all necessary update/delete actions.
 * - Since the specific property editors (`StatsPropsEditor`, etc.) are not
 * yet refactored to use the store, the necessary state and actions are
 * still passed down to them as props from this component. They will be
 * refactored in a subsequent step.
 * - This change finalizes the decoupling of the main editor components,
 * making the entire system more modular and maintainable.
 */
import type { FC } from 'react';
import { Trash2 } from 'lucide-react';
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';
import { BlockLayoutEditor } from './sidebar/BlockLayoutEditor';
import { BlockSpecificPropertiesEditor } from './sidebar/BlockSpecificPropertiesEditor';

// This component no longer needs to receive any props.
export const PropertiesSidebar: FC = () => {
    // --- ZUSTAND STORE ---
    const {
        selectedBlock,
        characterClass,
        updateBlockLayout,
        updateBlockContent,
        updateBaseStat,
        setSelectedBlockId,
        deleteBlock,
    } = useClassSheetStore((state) => ({
        selectedBlock:
            state.editableClass?.characterSheet[state.activePageIndex]?.blocks.find(
                (b) => b.id === state.selectedBlockId,
            ) || null,
        characterClass: state.editableClass,
        updateBlockLayout: state.updateBlockLayout,
        updateBlockContent: state.updateBlockContent,
        updateBaseStat: state.updateBaseStat,
        setSelectedBlockId: state.setSelectedBlockId,
        deleteBlock: state.deleteBlock,
    }));

    if (!selectedBlock || !characterClass) {
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
                {/* BlockLayoutEditor can be refactored next to also use the store */}
                <BlockLayoutEditor
                    selectedBlock={selectedBlock}
                    onUpdateBlockLayout={updateBlockLayout}
                />
                {/* BlockSpecificPropertiesEditor will pass these props down for now */}
                <BlockSpecificPropertiesEditor
                    selectedBlock={selectedBlock}
                    characterClass={characterClass}
                    onUpdateBlockContent={updateBlockContent}
                    onUpdateBaseStat={updateBaseStat}
                />
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
