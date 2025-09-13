// src/components/specific/Class/editor/ClassSheetEditor.tsx

/**
 * COMMIT: fix(class-sheet): import required react-grid-layout styles
 *
 * Rationale:
 * THE CORE BUG: Newly created blocks were not appearing on the canvas because
 * the essential CSS files for the `react-grid-layout` library were never
 * imported into the project. Without these styles, the new grid items had no
 * positioning information (`position: absolute`, etc.) and rendered with zero
 * dimensions, making them invisible.
 *
 * Implementation Details:
 * - Imported `react-grid-layout/css/styles.css` and
 * `react-resizable/css/styles.css` at the top of the main editor component.
 * - This provides the necessary base styling for all grid items and resize
 * handles, ensuring that newly created blocks are now correctly positioned
 * and displayed on the canvas. This resolves the long-standing rendering bug.
 */
import { useEffect, type FC } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

// FIX: Import the required stylesheets for the grid library.
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';
import type { CharacterClass } from '../../../../db/types';
import { updateClass } from '../../../../db/queries/character/class.queries';
import { blockTypes } from '../../../../constants/sheetEditor.constants';
import { PageCanvas } from './PageCanvas';
import { PropertiesSidebar } from './PropertiesSidebar';
import { PageControls } from './PageControls';

export interface ClassSheetEditorProps {
    characterClass: CharacterClass;
    onBack: () => void;
}

export const ClassSheetEditor: FC<ClassSheetEditorProps> = ({ characterClass, onBack }) => {
    // --- ZUSTAND STORE ---
    const init = useClassSheetStore((state) => state.init);
    const isSaving = useClassSheetStore((state) => state.isSaving);
    const editableClass = useClassSheetStore((state) => state.editableClass);
    const setIsSaving = useClassSheetStore((state) => state.setIsSaving);
    const selectedBlockId = useClassSheetStore((state) => state.selectedBlockId);
    const addBlock = useClassSheetStore((state) => state.addBlock);

    useEffect(() => {
        init(characterClass);
    }, [characterClass, init]);

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

    if (!editableClass) {
        return <div>Loading Editor...</div>;
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
                    selectedBlockId ? 'sheet-editor__content--with-properties' : ''
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

                <PageCanvas />
                <PropertiesSidebar />
            </div>

            <PageControls />
        </div>
    );
};
