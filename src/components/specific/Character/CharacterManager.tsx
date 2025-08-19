// src/components/specific/CharacterManager/CharacterManager.tsx
import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { Settings, PlusCircle } from 'lucide-react';
import { useWorld } from '../../../context/WorldContext';
import { useModal } from '../../../context/ModalContext';
import {
    addCharacter,
    getCharactersForWorld,
    updateCharacter,
    deleteCharacter,
} from '../../../db/queries/character.queries';
import type { Character } from '../../../db/types';
// NEW: Import our new specialized modal and its save data type.
import {
    ManageCharacterModal,
    type CharacterSaveData,
} from './ManageCharacterModal';

/**
 * A component for listing and managing characters within the active world.
 * The creation and editing logic is now handled by the specialized ManageCharacterModal.
 */
export const CharacterManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();
    const [characters, setCharacters] = useState<Character[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // REFACTOR: This state now controls our new specialized modal.
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [characterToEdit, setCharacterToEdit] = useState<Character | null>(null);

    const fetchCharacters = useCallback(async () => {
        if (!selectedWorld?.id) return;
        try {
            setError(null);
            setIsLoading(true);
            const worldCharacters = await getCharactersForWorld(selectedWorld.id);
            setCharacters(worldCharacters);
        } catch (err) {
            setError('Failed to load characters.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedWorld]);

    useEffect(() => {
        fetchCharacters();
    }, [fetchCharacters]);

    // --- NEW: Handlers for the specialized modal ---

    const handleOpenCreateModal = () => {
        setCharacterToEdit(null); // Ensure we're in "create" mode
        setIsManageModalOpen(true);
    };

    const handleOpenEditModal = (character: Character) => {
        setCharacterToEdit(character); // Set the character to edit
        setIsManageModalOpen(true);
    };

    // This single function handles both creating and updating.
    const handleSaveCharacter = async (saveData: CharacterSaveData) => {
        if (!selectedWorld?.id) {
            setError('Cannot save character: No world selected.');
            return;
        }
        if (!saveData.name.trim()) {
            showModal('alert', {
                title: 'Invalid Input',
                message: 'Character name cannot be empty.',
            });
            return;
        }

        try {
            if (characterToEdit) {
                // Update existing character
                await updateCharacter(characterToEdit.id!, { ...saveData });
            } else {
                // Create new character
                await addCharacter({ ...saveData, worldId: selectedWorld.id });
            }
            await fetchCharacters(); // Refresh the list
        } catch (err) {
            setError('Failed to save the character.');
            console.error(err);
        }
    };

    const handleDeleteCharacter = (characterId: number) => {
        showModal('confirmation', {
            title: 'Delete Character?',
            message: 'Are you sure you want to delete this character? This action is permanent.',
            onConfirm: async () => {
                try {
                    await deleteCharacter(characterId);
                    await fetchCharacters();
                } catch (err) {
                    setError('Failed to delete the character.');
                }
            },
        });
    };

    const getBadgeClass = (type: Character['type']) => {
        switch (type) {
            case 'PC':
                return 'status-badge--pc';
            case 'Enemy':
                return 'status-badge--enemy';
            case 'NPC':
            default:
                return 'status-badge--npc';
        }
    };

    return (
        <>
            <div className="panel">
                <h2 className="panel__title">Characters</h2>

                {/* REFACTOR: The old form is gone, replaced by a single button. */}
                <div className="panel__header-actions">
                    <button onClick={handleOpenCreateModal} className="button button--primary">
                        <PlusCircle size={16} /> Create New Character
                    </button>
                </div>

                <div className="panel__list-section">
                    <h3 className="panel__list-title">Existing Characters</h3>
                    {error && <p className="error-message">{error}</p>}
                    {isLoading ? (
                        <p>Loading characters...</p>
                    ) : characters.length > 0 ? (
                        <ul className="panel__list">
                            {characters.map((char) => (
                                <li key={char.id} className="panel__list-item">
                                    <div className="panel__item-details">
                                        <h4 className="panel__item-title">{char.name}</h4>
                                        <p className="panel__item-description">
                                            "{char.description}"
                                        </p>
                                    </div>
                                    <div className="panel__item-actions">
                                        {/* REFACTOR: Manage button now opens the specialized modal */}
                                        <button
                                            onClick={() => handleOpenEditModal(char)}
                                            className="button"
                                        >
                                            <Settings size={16} /> Manage
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCharacter(char.id!)}
                                            className="button button--danger"
                                        >
                                            Delete
                                        </button>
                                        <span
                                            className={`status-badge ${getBadgeClass(char.type)}`}
                                        >
                                            {char.type}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="panel__empty-message">
                            No characters created for this world yet.
                        </p>
                    )}
                </div>
            </div>

            {/* REFACTOR: Render our new, powerful, specialized modal. */}
            <ManageCharacterModal
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                onSave={handleSaveCharacter}
                characterToEdit={characterToEdit}
            />
        </>
    );
};
