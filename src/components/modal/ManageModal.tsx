// src/components/Modal/ManageModal.tsx
import { useState, useEffect } from 'react';
// REFACTOR: Import our new base interface. We no longer need to import specific types like World or Campaign.
import type { BaseManageable } from '../../db/types';

// REFACTOR: The props interface is now generic.
// It accepts a type `T` that MUST extend our BaseManageable interface.
// This is the core of our type-safe refactor.
export interface ManageModalProps<T extends BaseManageable> {
    isOpen: boolean;
    onClose: () => void;
    item: T | null;
    onSave: (updatedItem: T) => Promise<void>; // onSave now expects the specific type T.
    onDelete: (itemId: number) => void;
    itemType: string; // We now require an explicit `itemType` string for display purposes.
}

type ModalTab = 'general' | 'danger';

// REFACTOR: The component function is now also generic.
export const ManageModal = <T extends BaseManageable>({
    isOpen,
    onClose,
    item,
    onSave,
    onDelete,
    itemType, // Use the new, explicit prop.
}: ManageModalProps<T>) => {
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
        // The `updatedItem` is now correctly and safely typed as T.
        const updatedItem = { ...item, name, description };
        await onSave(updatedItem);
        onClose(); // Close the modal after saving
    };

    const handleDelete = () => {
        // item.id is guaranteed to exist if the item is not null.
        onDelete(item.id!);
        // The parent component will handle closing this modal
        // after the confirmation modal is resolved.
    };

    // REFACTOR: The old, brittle type check has been removed. We now rely on the `itemType` prop.
    // const itemType = 'worldId' in item ? 'Campaign' : 'World'; // DELETED!

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal manage-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    {/* Use the itemType prop for the title */}
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
                                    {/* Use the itemType prop for the label */}
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
                            {/* Use the itemType prop for the danger zone text */}
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
