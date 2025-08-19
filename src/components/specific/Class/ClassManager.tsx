// src/components/specific/Class/ClassManager.tsx
import { useState, useEffect, useCallback, type FC } from 'react';
import { Settings, PlusCircle, Trash2 } from 'lucide-react';
import { useWorld } from '../../../context/WorldContext';
import { useModal } from '../../../context/ModalContext';
import { getClassesForWorld, deleteClass } from '../../../db/queries/class.queries';
import type { CharacterClass } from '../../../db/types';
// We will create this modal in the next step.
// import { ManageClassModal } from './ManageClassModal';

/**
 * A component for listing and managing Character Classes within the active world.
 */
export const ClassManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();
    const [classes, setClasses] = useState<CharacterClass[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for the management modal (to be built next)
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [classToEdit, setClassToEdit] = useState<CharacterClass | null>(null);

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

    const handleOpenCreateModal = () => {
        setClassToEdit(null);
        // setIsManageModalOpen(true); // This will be enabled when the modal is created
        alert('ManageClassModal not yet implemented!'); // Placeholder
    };

    const handleOpenEditModal = (characterClass: CharacterClass) => {
        setClassToEdit(characterClass);
        // setIsManageModalOpen(true); // This will be enabled when the modal is created
        alert('ManageClassModal not yet implemented!'); // Placeholder
    };

    const handleDeleteClass = (characterClass: CharacterClass) => {
        showModal('confirmation', {
            title: `Delete ${characterClass.name}?`,
            message:
                'Are you sure you want to delete this class? This does not delete characters using this class, but they will no longer be linked to it. This action is permanent.',
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
                                        <p className="panel__item-meta">
                                            Base Stats: {Object.keys(charClass.baseStats).length} |
                                            Ability Trees: {charClass.abilityTreeIds.length}
                                        </p>
                                    </div>
                                    <div className="panel__item-actions">
                                        <button
                                            onClick={() => handleOpenEditModal(charClass)}
                                            className="button"
                                        >
                                            <Settings size={16} /> Manage
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

            {/* <ManageClassModal
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                onSave={handleSaveClass} // We will create this handler
                classToEdit={classToEdit}
            />
            */}
        </>
    );
};
