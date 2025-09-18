// src/components/specific/Map/ManageMapModal.tsx

import { useState, useEffect, type FC } from 'react';
import type { Map } from '../../../db/types';
import { useModal } from '../../../context/global/ModalContext';

export interface MapSaveData {
    name: string;
    description: string;
    // We will add imageDataUrl later
}

interface ManageMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    mapToEdit: Map | null;
    onSave: (saveData: MapSaveData) => Promise<void>;
}

export const ManageMapModal: FC<ManageMapModalProps> = ({ isOpen, onClose, mapToEdit, onSave }) => {
    const { showModal } = useModal();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (mapToEdit) {
            setName(mapToEdit.name || '');
            setDescription(mapToEdit.description || '');
        }
    }, [mapToEdit]);

    if (!isOpen) return null;

    const isEditing = !!mapToEdit?.id;
    const modalTitle = isEditing ? `Editing: ${mapToEdit.name}` : 'Create New Map';

    const handleSave = async () => {
        if (!name.trim()) {
            showModal({
                type: 'alert',
                title: 'Invalid Input',
                message: 'Map name cannot be empty.',
            });
            return;
        }
        await onSave({ name, description });
        onClose();
    };

    // For now, the modal will only handle name and description.
    // The image upload will be part of the editor itself.
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
                            <label htmlFor="mapName" className="form__label">
                                Map Name
                            </label>
                            <input
                                id="mapName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="form__input"
                                placeholder="e.g., The Sword Coast"
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="mapDescription" className="form__label">
                                Description
                            </label>
                            <textarea
                                id="mapDescription"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="form__textarea"
                                rows={4}
                                placeholder="A brief overview of the map's region or purpose."
                            />
                        </div>
                    </form>
                </div>
                <div className="modal__footer">
                    <button onClick={onClose} className="button">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="button button--primary">
                        Save Map
                    </button>
                </div>
            </div>
        </div>
    );
};
