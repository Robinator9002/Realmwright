// src/components/common/Modal/ManageModal.tsx
import { useState, useEffect } from 'react';
import type { FC } from 'react';
import type { World, Campaign } from '../../../db/types';

// The item being managed can be a World or a Campaign.
// We'll expand this union type as we add more manageable items.
type ManageableItem = World | Campaign;

export interface ManageModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: ManageableItem | null;
    onSave: (updatedItem: ManageableItem) => Promise<void>;
    onDelete: (itemId: number) => void;
}

type ModalTab = 'general' | 'danger';

export const ManageModal: FC<ManageModalProps> = ({ isOpen, onClose, item, onSave, onDelete }) => {
    const [activeTab, setActiveTab] = useState<ModalTab>('general');

    // Internal state for the form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    // When the modal is opened or the item changes, populate the form fields.
    useEffect(() => {
        if (item) {
            setName(item.name);
            setDescription(item.description);
            setActiveTab('general'); // Reset to general tab on open
        }
    }, [item]);

    if (!isOpen || !item) {
        return null;
    }

    const handleSave = async () => {
        const updatedItem = { ...item, name, description };
        await onSave(updatedItem);
        onClose(); // Close the modal after saving
    };

    const handleDelete = () => {
        onDelete(item.id!);
        // The parent component will handle closing this modal
        // after the confirmation modal is resolved.
    };

    const itemType = 'worldId' in item ? 'Campaign' : 'World';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal manage-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">Manage {itemType}</h2>
                    <button onClick={onClose} className="modal__close-button">
                        &times;
                    </button>
                </div>

                <div className="manage-modal__tabs">
                    <button
                        className={`manage-modal__tab-button ${
                            activeTab === 'general' ? 'manage-modal__tab-button--active' : ''
                        }`}
                        onClick={() => setActiveTab('general')}
                    >
                        General
                    </button>
                    <button
                        className={`manage-modal__tab-button ${
                            activeTab === 'danger' ? 'manage-modal__tab-button--active' : ''
                        }`}
                        onClick={() => setActiveTab('danger')}
                    >
                        Danger Zone
                    </button>
                </div>

                <div className="modal__content">
                    {activeTab === 'general' && (
                        <form className="form">
                            <div className="form__group">
                                <label htmlFor="itemName" className="form__label">
                                    {itemType} Name
                                </label>
                                <input
                                    id="itemName"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="form__input"
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="itemDescription" className="form__label">
                                    Description
                                </label>
                                <textarea
                                    id="itemDescription"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="form__textarea"
                                    rows={4}
                                />
                            </div>
                        </form>
                    )}

                    {activeTab === 'danger' && (
                        <div className="danger-zone">
                            <h3 className="danger-zone__title">Delete this {itemType}</h3>
                            <p className="danger-zone__text">
                                Once you delete this {itemType}, there is no going back. Please be
                                certain.
                            </p>
                            <button onClick={handleDelete} className="button button--danger">
                                Delete {item.name}
                            </button>
                        </div>
                    )}
                </div>

                <div className="modal__footer">
                    <button onClick={onClose} className="button">
                        Cancel
                    </button>
                    {activeTab === 'general' && (
                        <button onClick={handleSave} className="button button--primary">
                            Save Changes
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
