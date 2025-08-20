// src/components/specific/Rules/ManageStatModal.tsx
import { useState, useEffect, type FC } from 'react';
import type { StatDefinition } from '../../../db/types';
import type { UpdateStatPayload } from '../../../db/queries/rule.queries';

/**
 * The shape of the data that this modal will save.
 * It's a clean subset of the full StatDefinition type.
 */
export type StatSaveData = UpdateStatPayload;

export interface ManageStatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<StatSaveData>, statId: number) => Promise<void>;
    statToEdit: StatDefinition | null;
}

/**
 * A specialized modal for editing Stat Definitions.
 */
export const ManageStatModal: FC<ManageStatModalProps> = ({
    isOpen,
    onClose,
    onSave,
    statToEdit,
}) => {
    // We only ever edit, so isEditMode is always true when the modal is open.
    if (!isOpen || !statToEdit) {
        return null;
    }

    // --- Form State ---
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [abbreviation, setAbbreviation] = useState('');
    const [defaultValue, setDefaultValue] = useState(10);
    const [type, setType] = useState<'primary' | 'derived' | 'resource'>('primary');

    // Effect to populate the form for editing.
    useEffect(() => {
        if (statToEdit) {
            setName(statToEdit.name);
            setDescription(statToEdit.description);
            setAbbreviation(statToEdit.abbreviation);
            setDefaultValue(statToEdit.defaultValue);
            setType(statToEdit.type);
        }
    }, [statToEdit]);

    const handleSave = async () => {
        const saveData: Partial<StatSaveData> = {
            name,
            description,
            abbreviation,
            defaultValue,
            type,
        };
        await onSave(saveData, statToEdit.id!);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">Edit {statToEdit.name}</h2>
                    <button onClick={onClose} className="modal__close-button">
                        &times;
                    </button>
                </div>

                <div className="modal__content">
                    <form className="form">
                        <div className="form__group">
                            <label htmlFor="statName" className="form__label">
                                Stat Name
                            </label>
                            <input
                                id="statName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="form__input"
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="statAbbr" className="form__label">
                                Abbreviation
                            </label>
                            <input
                                id="statAbbr"
                                type="text"
                                value={abbreviation}
                                onChange={(e) => setAbbreviation(e.target.value)}
                                className="form__input"
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="statType" className="form__label">
                                Type
                            </label>
                            <select
                                id="statType"
                                value={type}
                                onChange={(e) =>
                                    setType(e.target.value as 'primary' | 'derived' | 'resource')
                                }
                                className="form__select"
                            >
                                <option value="primary">Primary</option>
                                <option value="derived">Derived</option>
                                <option value="resource">Resource</option>
                            </select>
                        </div>
                        <div className="form__group">
                            <label htmlFor="statDesc" className="form__label">
                                Description
                            </label>
                            <textarea
                                id="statDesc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="form__textarea"
                                rows={3}
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="statDefault" className="form__label">
                                Default Value
                            </label>
                            <input
                                id="statDefault"
                                type="number"
                                value={defaultValue}
                                onChange={(e) => setDefaultValue(parseInt(e.target.value, 10) || 0)}
                                className="form__input"
                            />
                        </div>
                    </form>
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
