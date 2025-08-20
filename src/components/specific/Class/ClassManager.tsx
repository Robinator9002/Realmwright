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
// FIX: The generic ManageModal has been replaced by the specialized ManageClassModal
import { ManageClassModal, type ClassSaveData } from './ManageClassModal';
import { ClassSheetEditor } from './ClassSheetEditor';

/**
 * A component for listing and managing Character Classes within the active world.
 */
export const ClassManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();
    const [classes, setClasses] = useState<CharacterClass[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editingClass, setEditingClass] = useState<CharacterClass | null>(null);
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

    // FIX: Replaced prompt() with modal logic.
    const handleOpenCreateModal = () => {
        setManagingClass({} as CharacterClass); // Open modal with a placeholder
    };

    const handleOpenEditModal = (characterClass: CharacterClass) => {
        setManagingClass(characterClass);
    };

    const handleSaveClass = async (saveData: ClassSaveData) => {
        if (!selectedWorld?.id) return;
        try {
            if (managingClass && managingClass.id) {
                // This is an update
                await updateClass(managingClass.id, saveData);
            } else {
                // This is a creation
                await addClass({ ...saveData, worldId: selectedWorld.id });
            }
            await fetchClasses();
        } catch (err) {
            setError('Failed to save class.');
        }
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

    if (editingClass) {
        return (
            <ClassSheetEditor characterClass={editingClass} onBack={() => setEditingClass(null)} />
        );
    }

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

            <ManageClassModal
                isOpen={isManageModalOpen}
                onClose={() => setManagingClass(null)}
                classToEdit={managingClass}
                onSave={handleSaveClass}
            />
        </>
    );
};
