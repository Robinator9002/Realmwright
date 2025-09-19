// src/components/specific/Quest/ManageQuestModal.tsx

import { useState, useEffect, type FC } from 'react';
import type { Quest } from '../../../db/types';
import { useModal } from '../../../context/global/ModalContext';

/**
 * Defines the shape of the data that the modal will pass back on save.
 */
export interface QuestSaveData {
    name: string;
    description: string;
}

interface ManageQuestModalProps {
    isOpen: boolean;
    onClose: () => void;
    questToEdit: Quest | null;
    onSave: (saveData: QuestSaveData) => Promise<void>;
}

/**
 * A modal form for creating a new quest or editing an existing one.
 * It mirrors the structure and logic of ManageLocationModal.
 */
export const ManageQuestModal: FC<ManageQuestModalProps> = ({
    isOpen,
    onClose,
    questToEdit,
    onSave,
}) => {
    const { showModal } = useModal();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    // Populate form fields when the modal is opened for editing.
    useEffect(() => {
        if (questToEdit) {
            setName(questToEdit.name || '');
            setDescription(questToEdit.description || '');
        }
    }, [questToEdit]);

    if (!isOpen) return null;

    const isEditing = !!questToEdit?.id;
    const modalTitle = isEditing ? `Editing: ${questToEdit.name}` : 'Create New Quest';

    const handleSave = async () => {
        if (!name.trim()) {
            showModal({
                type: 'alert',
                title: 'Invalid Input',
                message: 'Quest name cannot be empty.',
            });
            return;
        }
        await onSave({ name, description });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">{modalTitle}</h2>
                    <button onClick={onClose} className="modal__close-button">
                        &times;
                    </button>
                </div>
                <div className="modal__content">
                    <form className="form">
                        <div className="form__group">
                            <label htmlFor="questName" className="form__label">
                                Quest Name
                            </label>
                            <input
                                id="questName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="form__input"
                                placeholder="e.g., The Shadow Over Innsmouth"
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="questDescription" className="form__label">
                                Description
                            </label>
                            <textarea
                                id="questDescription"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="form__textarea"
                                rows={4}
                                placeholder="A brief overview of the quest's objective or starting hook."
                            />
                        </div>
                    </form>
                </div>
                <div className="modal__footer">
                    <button onClick={onClose} className="button">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="button button--primary">
                        Save Quest
                    </button>
                </div>
            </div>
        </div>
    );
};
