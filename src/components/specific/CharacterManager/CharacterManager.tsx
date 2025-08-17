// src/components/specific/CharacterManager/CharacterManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
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

    // State for the creation form
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
            // Reset form
            setNewCharName('');
            setNewCharType('NPC');
            setNewCharDescription('');
            await fetchCharacters(); // Refresh list
        } catch (err) {
            setError('Failed to save the new character.');
            console.error(err);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg mt-8">
            <h2 className="text-2xl font-semibold mb-4">Characters</h2>

            {/* Form for creating a new character */}
            <div className="bg-gray-900 p-4 rounded-md mb-6">
                <h3 className="text-xl font-semibold mb-3">Create New Character</h3>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label
                                htmlFor="charName"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Character Name
                            </label>
                            <input
                                id="charName"
                                type="text"
                                value={newCharName}
                                onChange={(e) => setNewCharName(e.target.value)}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                                placeholder="e.g., Kaelen the Silent"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="charType"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Character Type
                            </label>
                            <select
                                id="charType"
                                value={newCharType}
                                onChange={(e) =>
                                    setNewCharType(e.target.value as 'PC' | 'NPC' | 'Enemy')
                                }
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                            >
                                <option value="NPC">NPC</option>
                                <option value="PC">Player Character</option>
                                <option value="Enemy">Enemy</option>
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="charDescription"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                One-Line Pitch
                            </label>
                            <input
                                id="charDescription"
                                type="text"
                                value={newCharDescription}
                                onChange={(e) => setNewCharDescription(e.target.value)}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                                placeholder="A disgraced knight seeking redemption."
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold"
                    >
                        Create Character
                    </button>
                </form>
            </div>

            {/* List of existing characters */}
            <div>
                <h3 className="text-xl font-semibold mb-3">Existing Characters</h3>
                {error && <p className="text-red-500">{error}</p>}
                {isLoading ? (
                    <p>Loading characters...</p>
                ) : characters.length > 0 ? (
                    <ul className="space-y-3">
                        {characters.map((char) => (
                            <li key={char.id} className="bg-gray-700 p-3 rounded-md">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold">{char.name}</h4>
                                        <p className="text-sm text-gray-400 italic">
                                            "{char.description}"
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs uppercase font-semibold px-2 py-1 rounded-full ${
                                            char.type === 'PC'
                                                ? 'bg-green-600'
                                                : char.type === 'Enemy'
                                                ? 'bg-red-600'
                                                : 'bg-gray-600'
                                        }`}
                                    >
                                        {char.type}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">No characters created for this world yet.</p>
                )}
            </div>
        </div>
    );
};
