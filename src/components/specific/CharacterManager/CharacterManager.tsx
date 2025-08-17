// src/components/specific/CharacterManager/CharacterManager.tsx
import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { useWorld } from '../../../context/WorldContext';
import { addCharacter, getCharactersForWorld } from '../../../db/queries/character.queries';
import type { Character } from '../../../db/types';

/**
 * A component for creating and listing characters within the active world.
 */
export const CharacterManager: FC = () => {
    const { selectedWorld } = useWorld();
    const [characters, setCharacters] = useState<Character[]>([]);

    const [newCharName, setNewCharName] = useState('');
    const [newCharType, setNewCharType] = useState<'PC' | 'NPC' | 'Enemy'>('NPC');
    const [newCharDescription, setNewCharDescription] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            alert('Character name cannot be empty.');
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
        <div className="panel">
            <h2 className="panel__title">Characters</h2>

            <div className="panel__form-section">
                <h3 className="panel__form-title">Create New Character</h3>
                <form onSubmit={handleSubmit} className="form">
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
                                    <p className="panel__item-description">"{char.description}"</p>
                                </div>
                                <span className={`status-badge ${getBadgeClass(char.type)}`}>
                                    {char.type}
                                </span>
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
    );
};
