// src/components/specific/Location/ManageLocationModal.tsx

import { useState, useEffect, type FC } from 'react';
import type { Location } from '../../../db/types';
import { useModal } from '../../../context/global/ModalContext';

/**
 * Defines the shape of the data that the modal will pass back on save.
 * It omits fields that are managed automatically (like id, createdAt).
 */
export interface LocationSaveData {
    name: string;
    description: string;
}

interface ManageLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    locationToEdit: Location | null;
    onSave: (saveData: LocationSaveData) => Promise<void>;
}

/**
 * A modal form for creating a new location or editing an existing one.
 * It's a direct adaptation of the ManageMapModal component.
 */
export const ManageLocationModal: FC<ManageLocationModalProps> = ({
    isOpen,
    onClose,
    locationToEdit,
    onSave,
}) => {
    const { showModal } = useModal();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    // When the locationToEdit prop changes (i.e., when the modal is opened
    // for editing), populate the form fields with its data.
    useEffect(() => {
        if (locationToEdit) {
            setName(locationToEdit.name || '');
            setDescription(locationToEdit.description || '');
        }
    }, [locationToEdit]);

    // Do not render the modal if it's not supposed to be open.
    if (!isOpen) return null;

    const isEditing = !!locationToEdit?.id;
    const modalTitle = isEditing ? `Editing: ${locationToEdit.name}` : 'Create New Location';

    const handleSave = async () => {
        // Basic validation to prevent empty names.
        if (!name.trim()) {
            showModal({
                type: 'alert',
                title: 'Invalid Input',
                message: 'Location name cannot be empty.',
            });
            return;
        }
        // Call the onSave callback provided by the parent component.
        await onSave({ name, description });
        onClose(); // Close the modal after saving.
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
                            <label htmlFor="locationName" className="form__label">
                                Location Name
                            </label>
                            <input
                                id="locationName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="form__input"
                                placeholder="e.g., The Sunken City of Y'ha-nthlei"
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="locationDescription" className="form__label">
                                Description
                            </label>
                            <textarea
                                id="locationDescription"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="form__textarea"
                                rows={4}
                                placeholder="A brief overview of the location's significance or appearance."
                            />
                        </div>
                    </form>
                </div>
                <div className="modal__footer">
                    <button onClick={onClose} className="button">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="button button--primary">
                        Save Location
                    </button>
                </div>
            </div>
        </div>
    );
};
