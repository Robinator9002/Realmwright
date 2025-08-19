// src/components/specific/Character/ManageCharacterModal.tsx
import { useState, useEffect, type FC } from 'react';
import { useWorld } from '../../../context/WorldContext';
import { useModal } from '../../../context/ModalContext'; // NEW: For confirmation
import { getClassesForWorld } from '../../../db/queries/class.queries';
import type { Character, CharacterClass } from '../../../db/types';

// The save data is now much simpler.
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
    const { showModal } = useModal(); // NEW: For confirmation
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
                setName('');
                setDescription('');
                setType('NPC');
            }
        }
    }, [isOpen, isEditMode, characterToEdit]);

    const handleSave = async () => {
        if (isEditMode && characterToEdit) {
            const saveData: Partial<CharacterSaveData> = { name, description, type, classId };
            await onSave(saveData, characterToEdit.id);
        } else {
            if (classId === undefined) {
                showModal('alert', { title: 'Error', message: 'Please select a class.' });
                return;
            }
            const saveData: CharacterSaveData = { name, description, type, classId };
            await onSave(saveData);
        }
        onClose();
    };

    // NEW: Handle class changes with a confirmation dialog in edit mode.
    const handleClassChange = (newClassId: number | undefined) => {
        if (isEditMode) {
            showModal('confirmation', {
                title: 'Change Class?',
                message:
                    "Changing a character's class will reset their stats to the new class's defaults. This action cannot be undone.",
                onConfirm: () => {
                    setClassId(newClassId);
                    // Note: The stat reset will be handled by the character sheet view later.
                    // For now, this just allows changing the blueprint link.
                },
            });
        } else {
            setClassId(newClassId);
        }
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
                            {/* NEW: Class selection is now always visible */}
                            <div className="form__group">
                                <label htmlFor="charClass" className="form__label">
                                    Class
                                </label>
                                <select
                                    id="charClass"
                                    value={classId ?? ''}
                                    onChange={(e) =>
                                        handleClassChange(
                                            e.target.value
                                                ? parseInt(e.target.value, 10)
                                                : undefined,
                                        )
                                    }
                                    className="form__select"
                                    disabled={characterClasses.length === 0}
                                >
                                    {characterClasses.length === 0 ? (
                                        <option>No classes created yet</option>
                                    ) : (
                                        <>
                                            {/* In edit mode, a character can be classless if their class was deleted. */}
                                            {isEditMode && <option value="">None</option>}
                                            {characterClasses.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </>
                                    )}
                                </select>
                            </div>
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
