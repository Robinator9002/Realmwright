// src/components/specific/Character/CharacterManager.tsx
import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { Settings, PlusCircle, Trash2 } from 'lucide-react';
import { useWorld } from '../../../context/WorldContext';
import { useModal } from '../../../context/ModalContext';
import {
    addCharacter,
    getCharactersForWorld,
    updateCharacter,
    deleteCharacter,
} from '../../../db/queries/character.queries';
import type { Character } from '../../../db/types';
// REFACTOR: Corrected import path for the specialized modal.
import { ManageCharacterModal, type CharacterSaveData } from './ManageCharacterModal';

/**
 * A component for listing and managing characters within the active world.
 */
export const CharacterManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();
    const [characters, setCharacters] = useState<Character[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const handleOpenCreateModal = () => {
        setCharacterToEdit(null);
        setIsManageModalOpen(true);
    };

    const handleOpenEditModal = (character: Character) => {
        setCharacterToEdit(character);
        setIsManageModalOpen(true);
    };

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
                await updateCharacter(characterToEdit.id!, { ...saveData });
            } else {
                await addCharacter({ ...saveData, worldId: selectedWorld.id });
            }
            await fetchCharacters();
        } catch (err) {
            setError('Failed to save the character.');
            console.error(err);
        }
    };

    const handleDeleteCharacter = (character: Character) => {
        showModal('confirmation', {
            title: `Delete ${character.name}?`,
            message: 'Are you sure you want to delete this character? This action is permanent.',
            onConfirm: async () => {
                try {
                    await deleteCharacter(character.id!);
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
                <div className="panel__header-actions">
                    <h2 className="panel__title" style={{ border: 'none', padding: 0 }}>
                        Characters
                    </h2>
                    <button onClick={handleOpenCreateModal} className="button button--primary">
                        <PlusCircle size={16} /> Create New Character
                    </button>
                </div>

                <div className="panel__list-section">
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
                                        {/* NEW: Display the count of learned abilities */}
                                        <p className="panel__item-meta">
                                            Learned Abilities: {char.learnedAbilities?.length || 0}
                                        </p>
                                    </div>
                                    <div className="panel__item-actions">
                                        <button
                                            onClick={() => handleOpenEditModal(char)}
                                            className="button"
                                        >
                                            <Settings size={16} /> Manage
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCharacter(char)}
                                            className="button button--danger"
                                        >
                                            <Trash2 size={16} />
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

            <ManageCharacterModal
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                onSave={handleSaveCharacter}
                characterToEdit={characterToEdit}
            />
        </>
    );
};
