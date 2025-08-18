// src/components/specific/ManageCharacterModal/ManageCharacterModal.tsx
import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useWorld } from '../../../context/WorldContext';
import { getStatDefinitionsForWorld } from '../../../db/queries/rule.queries';
import type { Character, StatDefinition } from '../../../db/types';

// Define the shape of the data this modal will save.
// This matches the payload for our `addCharacter` and `updateCharacter` queries.
export type CharacterSaveData = {
    name: string;
    description: string;
    type: 'PC' | 'NPC' | 'Enemy';
    stats: { [statId: number]: number };
};

// Define the props for our new, specialized modal.
export interface ManageCharacterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CharacterSaveData) => Promise<void>;
    characterToEdit: Character | null; // If null, we're in "create" mode.
}

/**
 * A specialized modal for creating and editing characters, including their stats.
 */
export const ManageCharacterModal: FC<ManageCharacterModalProps> = ({
    isOpen,
    onClose,
    onSave,
    characterToEdit,
}) => {
    const { selectedWorld } = useWorld();
    const isEditMode = !!characterToEdit;

    // State for the form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'PC' | 'NPC' | 'Enemy'>('NPC');
    const [stats, setStats] = useState<{ [statId: number]: number }>({});

    // State to hold the world's stat definitions
    const [statDefs, setStatDefs] = useState<StatDefinition[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Effect to fetch stat definitions when the modal is opened.
    useEffect(() => {
        if (isOpen && selectedWorld?.id) {
            setIsLoading(true);
            getStatDefinitionsForWorld(selectedWorld.id)
                .then(setStatDefs)
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, selectedWorld]);

    // Effect to populate the form when the modal opens or the character changes.
    useEffect(() => {
        if (isOpen && !isLoading) {
            if (isEditMode && characterToEdit) {
                // Edit mode: Populate from the existing character.
                setName(characterToEdit.name);
                setDescription(characterToEdit.description);
                setType(characterToEdit.type);
                setStats(characterToEdit.stats || {});
            } else {
                // Create mode: Populate with default values.
                setName('');
                setDescription('');
                setType('NPC');
                // Create a default stat block from the definitions.
                const defaultStats: { [statId: number]: number } = {};
                for (const def of statDefs) {
                    defaultStats[def.id!] = def.defaultValue;
                }
                setStats(defaultStats);
            }
        }
    }, [isOpen, isLoading, isEditMode, characterToEdit, statDefs]);

    // Handles changes to a specific stat input.
    const handleStatChange = (statId: number, value: string) => {
        setStats((prevStats) => ({
            ...prevStats,
            [statId]: parseInt(value, 10) || 0,
        }));
    };

    // Gathers all form data and calls the onSave prop.
    const handleSave = async () => {
        const saveData: CharacterSaveData = { name, description, type, stats };
        await onSave(saveData);
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">
                        {isEditMode ? `Edit ${characterToEdit.name}` : 'Create New Character'}
                    </h2>
                    <button onClick={onClose} className="modal__close-button">
                        &times;
                    </button>
                </div>

                <div className="modal__content">
                    {isLoading ? (
                        <p>Loading rules...</p>
                    ) : (
                        <form className="form">
                            {/* --- Core Details Section --- */}
                            <div className="form__group">
                                <label htmlFor="charName" className="form__label">
                                    Character Name
                                </label>
                                <input
                                    id="charName"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="form__input"
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="charDesc" className="form__label">
                                    Description
                                </label>
                                <textarea
                                    id="charDesc"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="form__textarea"
                                    rows={3}
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="charType" className="form__label">
                                    Character Type
                                </label>
                                <select
                                    id="charType"
                                    value={type}
                                    onChange={(e) =>
                                        setType(e.target.value as 'PC' | 'NPC' | 'Enemy')
                                    }
                                    className="form__select"
                                >
                                    <option value="NPC">NPC</option>
                                    <option value="PC">Player Character</option>
                                    <option value="Enemy">Enemy</option>
                                </select>
                            </div>

                            {/* --- Dynamic Stats Section --- */}
                            {statDefs.length > 0 && (
                                <div className="form__group">
                                    <label className="form__label">Statistics</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {statDefs.map((def) => (
                                            <div key={def.id} className="form__group">
                                                <label
                                                    htmlFor={`stat-${def.id}`}
                                                    className="form__label text-xs"
                                                >
                                                    {def.name} ({def.abbreviation})
                                                </label>
                                                <input
                                                    id={`stat-${def.id}`}
                                                    type="number"
                                                    value={stats[def.id!] || ''}
                                                    onChange={(e) =>
                                                        handleStatChange(def.id!, e.target.value)
                                                    }
                                                    className="form__input"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                <div className="modal__footer">
                    <button onClick={onClose} className="button">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="button button--primary">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
