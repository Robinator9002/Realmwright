// src/components/specific/Class/editor/ClassSheetEditor.tsx

/**
 * COMMIT: refactor(class-sheet): connect component to Zustand store
 *
 * Rationale:
 * This commit completes the architectural refactor initiated in Phase 1.2
 * by connecting the main ClassSheetEditor component to the new Zustand store.
 *
 * Implementation Details:
 * - All local `useState` hooks for managing the editor's state have been removed.
 * - The component now imports and uses the `useClassSheetStore` hook.
 * - State and action functions are selected from the store and passed down as
 * props to the child components (PageCanvas, PropertiesSidebar, etc.).
 * - A `useEffect` hook has been added to call the store's `init` action
 * when the component mounts, seeding it with the class data to be edited.
 * - The `handleSaveChanges` logic remains in the component but now pulls data
 * from and dispatches actions to the store.
 * - This change dramatically simplifies the component, offloading all state
 * management to the central store and turning the editor into a pure
 * presentational container.
 */
import { useEffect, useMemo, type FC } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

import type { CharacterClass } from '../../../../db/types';
import { updateClass } from '../../../../db/queries/character/class.queries';
import { blockTypes } from '../../../../constants/sheetEditor.constants';
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';

import { PageCanvas } from './PageCanvas';
import { PropertiesSidebar } from './PropertiesSidebar';
import { PageControls } from './PageControls';

export interface ClassSheetEditorProps {
    characterClass: CharacterClass;
    onBack: () => void;
}

export const ClassSheetEditor: FC<ClassSheetEditorProps> = ({ characterClass, onBack }) => {
    // --- ZUSTAND STORE ---
    // Select all the state and actions needed for the editor from the central store.
    const {
        init,
        editableClass,
        isSaving,
        activePageIndex,
        selectedBlockId,
        addBlock,
        deleteBlock,
        handleLayoutChange,
        updateBlockLayout,
        updateBlockContent,
        updateBaseStat,
        addPage,
        deletePage,
        renamePage,
        setSelectedBlockId,
        setActivePageIndex,
        setIsSaving,
    } = useClassSheetStore();

    // --- INITIALIZATION ---
    // When the component mounts or the characterClass prop changes,
    // initialize the store with the data to be edited.
    useEffect(() => {
        init(characterClass);
    }, [characterClass, init]);

    // --- DERIVED STATE ---
    // Memoize the derived values to prevent unnecessary recalculations.
    const sheet = useMemo(() => editableClass?.characterSheet || [], [editableClass]);
    const selectedBlock = useMemo(
        () => sheet[activePageIndex]?.blocks.find((block) => block.id === selectedBlockId) || null,
        [sheet, activePageIndex, selectedBlockId],
    );
    const currentPage = useMemo(() => sheet[activePageIndex], [sheet, activePageIndex]);

    // --- EVENT HANDLERS ---
    // This handler performs the async save operation.
    const handleSaveChanges = async () => {
        if (!editableClass) return;
        setIsSaving(true);
        try {
            await updateClass(editableClass.id!, {
                characterSheet: editableClass.characterSheet,
                baseStats: editableClass.baseStats,
            });
        } catch (error) {
            console.error('Failed to save changes:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // --- RENDER LOGIC ---
    // If the store hasn't been initialized yet, show a loading state.
    if (!editableClass) {
        return <div className="panel">Loading Editor...</div>;
    }

    return (
        <div className="panel sheet-editor">
            <div className="panel__header-actions">
                <button onClick={onBack} className="button">
                    <ArrowLeft size={16} /> Back
                </button>
                <h2 className="panel__title" style={{ border: 'none', padding: 0 }}>
                    Designing: {editableClass.name}
                </h2>
                <button
                    onClick={handleSaveChanges}
                    className="button button--primary"
                    disabled={isSaving}
                >
                    <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div
                className={`sheet-editor__content ${
                    selectedBlock ? 'sheet-editor__content--with-properties' : ''
                }`}
            >
                <div className="sheet-editor__sidebar">
                    <h3 className="sidebar__title">Add Blocks</h3>
                    {blockTypes.map(({ type, label, icon }) => (
                        <button
                            key={type}
                            onClick={() => addBlock(type)}
                            className="button sidebar__block-button"
                        >
                            {icon} {label}
                        </button>
                    ))}
                </div>

                {currentPage ? (
                    <PageCanvas
                        page={currentPage}
                        characterClass={editableClass}
                        onLayoutChange={handleLayoutChange}
                        selectedBlockId={selectedBlockId}
                        onSelectBlock={setSelectedBlockId}
                    />
                ) : (
                    <div className="page-canvas__container">
                        <p className="panel__empty-message">Add a page to begin.</p>
                    </div>
                )}

                <PropertiesSidebar
                    selectedBlock={selectedBlock}
                    onUpdateBlockLayout={updateBlockLayout}
                    onUpdateBlockContent={updateBlockContent}
                    onUpdateBaseStat={updateBaseStat}
                    characterClass={editableClass}
                    onDeselect={() => setSelectedBlockId(null)}
                    onDeleteBlock={deleteBlock}
                />
            </div>

            <PageControls
                pages={sheet}
                activePageIndex={activePageIndex}
                onSelectPage={setActivePageIndex}
                onAddPage={addPage}
                onDeletePage={deletePage}
                onRenamePage={renamePage}
            />
        </div>
    );
};
