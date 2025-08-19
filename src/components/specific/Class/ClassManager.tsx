// src/components/specific/Class/ClassManager.tsx
import { useState, useEffect, useCallback, type FC } from 'react';
import { Settings, PlusCircle, Trash2, Edit } from 'lucide-react';
import { useWorld } from '../../../context/WorldContext';
import { useModal } from '../../../context/ModalContext';
import {
    getClassesForWorld,
    deleteClass,
    addClass,
    updateClass,
} from '../../../db/queries/class.queries';
import type { CharacterClass } from '../../../db/types';
// We are no longer using the ManageClassModal, so it can be removed.
// We will build a simple creation modal later if needed.
import { ManageModal } from '../../common/Modal/ManageModal';

// NEW: Import the ClassSheetEditor.
import { ClassSheetEditor } from './ClassSheetEditor';

/**
 * A component for listing and managing Character Classes within the active world.
 * It can now switch between the list view and the sheet editor view.
 */
export const ClassManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();
    const [classes, setClasses] = useState<CharacterClass[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // NEW: State to track which class is being edited in the full-page editor.
    const [editingClass, setEditingClass] = useState<CharacterClass | null>(null);

    // State for the simple name/description management modal
    const [managingClass, setManagingClass] = useState<CharacterClass | null>(null);
    const isManageModalOpen = !!managingClass;

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

    const handleCreateClass = async () => {
        if (!selectedWorld?.id) return;
        // For now, we'll use a simple prompt. We can build a creation modal later.
        const name = prompt('Enter new class name:');
        if (name) {
            await addClass({ name, description: '', worldId: selectedWorld.id });
            await fetchClasses();
        }
    };

    const handleSaveClassDetails = async (updatedClass: CharacterClass) => {
        // This only saves name and description from the generic modal.
        await updateClass(updatedClass.id!, {
            name: updatedClass.name,
            description: updatedClass.description,
        });
        await fetchClasses();
    };

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

    // If a class is being edited, render the editor.
    if (editingClass) {
        return (
            <ClassSheetEditor characterClass={editingClass} onBack={() => setEditingClass(null)} />
        );
    }

    // Otherwise, render the list of classes.
    return (
        <>
            <div className="panel">
                <div className="panel__header-actions">
                    <h2 className="panel__title" style={{ border: 'none', padding: 0 }}>
                        Character Classes
                    </h2>
                    <button onClick={handleCreateClass} className="button button--primary">
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
                                            onClick={() => setManagingClass(charClass)}
                                            className="button"
                                        >
                                            <Settings size={16} /> Details
                                        </button>
                                        <button
                                            onClick={() => setEditingClass(charClass)}
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

            <ManageModal<CharacterClass>
                isOpen={isManageModalOpen}
                onClose={() => setManagingClass(null)}
                item={managingClass}
                onSave={handleSaveClassDetails}
                onDelete={() => {
                    if (managingClass) handleDeleteClass(managingClass);
                }}
                itemType="Class"
            />
        </>
    );
};
