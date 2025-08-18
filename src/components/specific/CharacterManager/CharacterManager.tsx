// src/components/specific/CharacterManager/CharacterManager.tsx
import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { Settings } from 'lucide-react'; // NEW: Import the icon for the manage button.
import { useWorld } from '../../../context/WorldContext';
import { useModal } from '../../../context/ModalContext';
// NEW: Import all necessary query functions.
import {
    addCharacter,
    getCharactersForWorld,
    updateCharacter,
    deleteCharacter,
} from '../../../db/queries/character.queries';
import type { Character } from '../../../db/types';
import { ManageModal } from '../../common/Modal/ManageModal'; // NEW: Import the ManageModal.

/**
 * A component for creating, listing, and managing characters within the active world.
 */
export const CharacterManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();
    const [characters, setCharacters] = useState<Character[]>([]);

    const [newCharName, setNewCharName] = useState('');
    const [newCharType, setNewCharType] = useState<'PC' | 'NPC' | 'Enemy'>('NPC');
    const [newCharDescription, setNewCharDescription] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // NEW: State to track which character is currently being edited in the modal.
    const [managingCharacter, setManagingCharacter] = useState<Character | null>(null);
    const isManageModalOpen = !!managingCharacter;

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

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newCharName.trim() || !selectedWorld?.id) {
            showModal('alert', {
                title: 'Invalid Input',
                message:
                    'Character name cannot be empty. Please provide a name for your character.',
            });
            return;
        }

        try {
            await addCharacter({
                name: newCharName,
                type: newCharType,
                description: newCharDescription,
                worldId: selectedWorld.id,
            });
            setNewCharName('');
            setNewCharType('NPC');
            setNewCharDescription('');
            await fetchCharacters();
        } catch (err) {
            setError('Failed to save the new character.');
            console.error(err);
        }
    };

    // --- NEW: Handlers for the ManageModal ---

    const handleSaveCharacter = async (updatedCharacter: Character) => {
        try {
            await updateCharacter(updatedCharacter.id!, {
                name: updatedCharacter.name,
                description: updatedCharacter.description,
            });
            await fetchCharacters(); // Refresh the list after saving
        } catch (err) {
            setError('Failed to update the character.');
        }
    };

    const handleDeleteCharacter = (characterId: number) => {
        // Close the manage modal first, then show the confirmation modal.
        setManagingCharacter(null);

        showModal('confirmation', {
            title: 'Delete Character?',
            message: 'Are you sure you want to delete this character? This action is permanent.',
            onConfirm: async () => {
                try {
                    await deleteCharacter(characterId);
                    await fetchCharacters(); // Refresh the list after deleting
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

                <div className="panel__form-section">
                    <h3 className="panel__form-title">Create New Character</h3>
                    <form onSubmit={handleSubmit} className="form">
                        {/* Form content remains unchanged */}
                        <div className="form__group">
                            <label htmlFor="charName" className="form__label">
                                Character Name
                            </label>
                            <input
                                id="charName"
                                type="text"
                                value={newCharName}
                                onChange={(e) => setNewCharName(e.target.value)}
                                className="form__input"
                                placeholder="e.g., Kaelen the Silent"
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="charType" className="form__label">
                                Character Type
                            </label>
                            <select
                                id="charType"
                                value={newCharType}
                                onChange={(e) =>
                                    setNewCharType(e.target.value as 'PC' | 'NPC' | 'Enemy')
                                }
                                className="form__select"
                            >
                                <option value="NPC">NPC</option>
                                <option value="PC">Player Character</option>
                                <option value="Enemy">Enemy</option>
                            </select>
                        </div>
                        <div className="form__group">
                            <label htmlFor="charDescription" className="form__label">
                                One-Line Pitch
                            </label>
                            <input
                                id="charDescription"
                                type="text"
                                value={newCharDescription}
                                onChange={(e) => setNewCharDescription(e.target.value)}
                                className="form__input"
                                placeholder="A disgraced knight seeking redemption."
                            />
                        </div>
                        <button type="submit" className="button button--primary">
                            Create Character
                        </button>
                    </form>
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
                                    {/* NEW: Action buttons for managing and identifying characters */}
                                    <div className="panel__item-actions">
                                        <button
                                            onClick={() => setManagingCharacter(char)}
                                            className="button"
                                        >
                                            <Settings size={16} /> Manage
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

            {/* NEW: Render the ManageModal for characters */}
            <ManageModal<Character>
                isOpen={isManageModalOpen}
                onClose={() => setManagingCharacter(null)}
                item={managingCharacter}
                onSave={handleSaveCharacter}
                onDelete={handleDeleteCharacter}
                itemType="Character"
            />
        </>
    );
};
