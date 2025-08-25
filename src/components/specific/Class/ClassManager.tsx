// src/components/specific/Class/ClassManager.tsx

/**
 * COMMIT: refactor(class-sheet): integrate ClassManager with new view context
 *
 * Rationale:
 * To complete the integration of the new ClassSheetEditor, the ClassManager
 * must be updated to use the global view context for navigation instead of

 * managing its own local state for the editor.
 *
 * Implementation Details:
 * - Imported and consumed the `useView` hook.
 * - The local `editingClass` state and the direct rendering of the
 * `ClassSheetEditor` have been removed.
 * - The "Design Sheet" button's `onClick` handler now calls
 * `setEditingClassId` and `setCurrentView('class_sheet_editor')`.
 * - This change fully decouples the manager from the editor and aligns its
 * behavior with the application's established navigation patterns.
 */
import { useState, useEffect, useCallback, type FC } from 'react';
import { Settings, PlusCircle, Trash2, Edit } from 'lucide-react';
import { useWorld } from '../../../context/WorldContext';
import { useModal } from '../../../context/ModalContext';
// NEW: Import useView to control navigation to the editor.
import { useView } from '../../../context/ViewContext';
import {
    getClassesForWorld,
    deleteClass,
    addClass,
    updateClass,
} from '../../../db/queries/class.queries';
import type { CharacterClass } from '../../../db/types';
import { ManageClassModal, type ClassSaveData } from './ManageClassModal';

/**
 * A component for listing and managing Character Classes within the active world.
 */
export const ClassManager: FC = () => {
    // --- HOOKS ---
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();
    // NEW: Get the necessary functions from useView to navigate to the editor.
    const { setCurrentView, setEditingClassId } = useView();

    // --- STATE ---
    const [classes, setClasses] = useState<CharacterClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for the "Manage Details" modal.
    const [managingClass, setManagingClass] = useState<CharacterClass | null>(null);
    const isManageModalOpen = !!managingClass;

    // --- DATA FETCHING ---
    const fetchClasses = useCallback(async () => {
        if (!selectedWorld?.id) return;
        try {
            setError(null);
            setIsLoading(true);
            const worldClasses = await getClassesForWorld(selectedWorld.id);
            setClasses(worldClasses);
        } catch (err) {
            setError('Failed to load character classes.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedWorld]);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    // --- EVENT HANDLERS ---

    // Opens the modal for creating a new class.
    const handleOpenCreateModal = () => {
        setManagingClass({} as CharacterClass); // Open modal with a placeholder
    };

    // Opens the modal for editing a class's details (name, stats).
    const handleOpenEditModal = (characterClass: CharacterClass) => {
        setManagingClass(characterClass);
    };

    // REWORKED: Navigates to the full-page sheet editor.
    const handleOpenSheetEditor = (characterClass: CharacterClass) => {
        if (characterClass.id) {
            setEditingClassId(characterClass.id);
            setCurrentView('class_sheet_editor');
        }
    };

    // Handles saving from the ManageClassModal (for create or edit).
    const handleSaveClass = async (saveData: ClassSaveData) => {
        if (!selectedWorld?.id) return;
        try {
            if (managingClass && managingClass.id) {
                await updateClass(managingClass.id, saveData);
            } else {
                await addClass({ ...saveData, worldId: selectedWorld.id });
            }
            await fetchClasses();
        } catch (err) {
            setError('Failed to save class.');
        }
    };

    // Handles deleting a class after confirmation.
    const handleDeleteClass = (characterClass: CharacterClass) => {
        showModal('confirmation', {
            title: `Delete ${characterClass.name}?`,
            message:
                'Are you sure you want to delete this class blueprint? This action is permanent.',
            onConfirm: async () => {
                try {
                    await deleteClass(characterClass.id!);
                    await fetchClasses();
                } catch (err) {
                    setError('Failed to delete the character class.');
                }
            },
        });
    };

    // --- JSX ---
    // The editor is no longer rendered here; App.tsx handles it.
    return (
        <>
            <div className="panel">
                <div className="panel__header-actions">
                    <h2 className="panel__title" style={{ border: 'none', padding: 0 }}>
                        Character Classes
                    </h2>
                    <button onClick={handleOpenCreateModal} className="button button--primary">
                        <PlusCircle size={16} /> Create New Class
                    </button>
                </div>

                <div className="panel__list-section">
                    {error && <p className="error-message">{error}</p>}
                    {isLoading ? (
                        <p>Loading classes...</p>
                    ) : classes.length > 0 ? (
                        <ul className="panel__list">
                            {classes.map((charClass) => (
                                <li key={charClass.id} className="panel__list-item">
                                    <div className="panel__item-details">
                                        <h4 className="panel__item-title">{charClass.name}</h4>
                                        <p className="panel__item-description">
                                            {charClass.description}
                                        </p>
                                    </div>
                                    <div className="panel__item-actions">
                                        <button
                                            onClick={() => handleOpenEditModal(charClass)}
                                            className="button"
                                        >
                                            <Settings size={16} /> Details
                                        </button>
                                        <button
                                            onClick={() => handleOpenSheetEditor(charClass)}
                                            className="button button--primary"
                                        >
                                            <Edit size={16} /> Design Sheet
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClass(charClass)}
                                            className="button button--danger"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="panel__empty-message">
                            No character classes defined for this world yet.
                        </p>
                    )}
                </div>
            </div>

            <ManageClassModal
                isOpen={isManageModalOpen}
                onClose={() => setManagingClass(null)}
                classToEdit={managingClass}
                onSave={handleSaveClass}
            />
        </>
    );
};
