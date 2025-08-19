// src/components/specific/Character/ManageCharacterModal.tsx
import { useState, useEffect, type FC } from 'react';
import { useWorld } from '../../../context/WorldContext';
import { getClassesForWorld } from '../../../db/queries/class.queries';
import type { Character, CharacterClass } from '../../../db/types';

// The save data is now much simpler.
// For creation, it only needs the basics and the blueprint (classId).
// For updates, it's a partial of the editable fields.
export type CharacterSaveData = {
    name: string;
    description: string;
    type: 'PC' | 'NPC' | 'Enemy';
    classId: number;
};

export interface ManageCharacterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (
        data: CharacterSaveData | Partial<CharacterSaveData>,
        characterId?: number,
    ) => Promise<void>;
    characterToEdit: Character | null;
}

/**
 * A streamlined modal for creating characters from a class blueprint,
 * or editing their basic details.
 */
export const ManageCharacterModal: FC<ManageCharacterModalProps> = ({
    isOpen,
    onClose,
    onSave,
    characterToEdit,
}) => {
    const { selectedWorld } = useWorld();
    const isEditMode = !!characterToEdit;

    // --- Form State ---
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'PC' | 'NPC' | 'Enemy'>('NPC');
    const [classId, setClassId] = useState<number | undefined>(undefined);

    // --- Data Loading State ---
    const [characterClasses, setCharacterClasses] = useState<CharacterClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Effect to fetch available classes when the modal opens.
    useEffect(() => {
        if (isOpen && selectedWorld?.id) {
            setIsLoading(true);
            getClassesForWorld(selectedWorld.id).then((classData) => {
                setCharacterClasses(classData);
                // If creating, pre-select the first class if available.
                if (!isEditMode && classData.length > 0) {
                    setClassId(classData[0].id);
                }
                setIsLoading(false);
            });
        }
    }, [isOpen, selectedWorld, isEditMode]);

    // Effect to populate the form for editing.
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && characterToEdit) {
                setName(characterToEdit.name);
                setDescription(characterToEdit.description);
                setType(characterToEdit.type);
                setClassId(characterToEdit.classId);
            } else {
                // Reset for creation
                setName('');
                setDescription('');
                setType('NPC');
            }
        }
    }, [isOpen, isEditMode, characterToEdit]);

    const handleSave = async () => {
        if (isEditMode && characterToEdit) {
            const saveData: Partial<CharacterSaveData> = { name, description, type };
            await onSave(saveData, characterToEdit.id);
        } else {
            if (classId === undefined) {
                // In a real app, you'd show a proper alert here.
                alert('Please select a class.');
                return;
            }
            const saveData: CharacterSaveData = { name, description, type, classId };
            await onSave(saveData);
        }
        onClose();
    };

    if (!isOpen) return null;

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
                        <p>Loading classes...</p>
                    ) : (
                        <form className="form">
                            <div className="form__group">
                                <label htmlFor="charName" className="form__label">
                                    Name
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
                                    Type
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
                            {/* Class selection is only available during creation */}
                            {!isEditMode && (
                                <div className="form__group">
                                    <label htmlFor="charClass" className="form__label">
                                        Class
                                    </label>
                                    <select
                                        id="charClass"
                                        value={classId ?? ''}
                                        onChange={(e) => setClassId(parseInt(e.target.value, 10))}
                                        className="form__select"
                                        disabled={characterClasses.length === 0}
                                    >
                                        {characterClasses.length === 0 ? (
                                            <option>No classes created yet</option>
                                        ) : (
                                            characterClasses.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))
                                        )}
                                    </select>
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
                        {isEditMode ? 'Save Changes' : 'Create Character'}
                    </button>
                </div>
            </div>
        </div>
    );
};
