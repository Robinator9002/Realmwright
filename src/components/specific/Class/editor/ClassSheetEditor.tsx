// src/components/specific/Class/editor/ClassSheetEditor.tsx

/**
 * COMMIT: refactor(class-sheet): make ClassSheetEditor responsible for its own data fetching
 *
 * Rationale:
 * As part of the final architectural consolidation, the responsibility for
 * fetching the CharacterClass data has been moved from the root App component
 * to this editor component itself. This makes the component more self-contained.
 *
 * Implementation Details:
 * - The component's props interface has been changed from expecting a full
 * `characterClass` object to accepting a `classId`.
 * - It now uses local state (`isLoading`, `error`) and a `useEffect` hook to
 * fetch the `CharacterClass` data from the database when it mounts.
 * - The Zustand store's `init` function is called only after the data has been
 * successfully fetched, ensuring the store is initialized correctly.
 * - This change completes the architectural shift, making the component fully
 * responsible for its own data dependencies.
 */
import { useEffect, useState, type FC } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';
import { getClassById } from '../../../../db/queries/character/class.queries';
import { updateClass } from '../../../../db/queries/character/class.queries';
import { blockTypes } from '../../../../constants/sheetEditor.constants';
import { PageCanvas } from './PageCanvas';
import { PropertiesSidebar } from './PropertiesSidebar';
import { PageControls } from './PageControls';

export interface ClassSheetEditorProps {
    classId: number;
    onBack: () => void;
}

export const ClassSheetEditor: FC<ClassSheetEditorProps> = ({ classId, onBack }) => {
    // --- ZUSTAND STORE ---
    const init = useClassSheetStore((state) => state.init);
    const isSaving = useClassSheetStore((state) => state.isSaving);
    const editableClass = useClassSheetStore((state) => state.editableClass);
    const setIsSaving = useClassSheetStore((state) => state.setIsSaving);
    const selectedBlockId = useClassSheetStore((state) => state.selectedBlockId);
    const addBlock = useClassSheetStore((state) => state.addBlock);

    // --- LOCAL STATE FOR DATA FETCHING ---
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchClassData = async () => {
            try {
                const characterClass = await getClassById(classId);
                if (characterClass) {
                    init(characterClass);
                } else {
                    setError(`Class with ID ${classId} not found.`);
                }
            } catch (err) {
                setError('Failed to load class data.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchClassData();
    }, [classId, init]);

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

    if (isLoading) {
        return <div>Loading Editor...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!editableClass) {
        return <div>Class data could not be loaded.</div>;
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
