// src/components/specific/Map/Modal/LinkLocationModal.tsx

import { useState, useEffect, type FC } from 'react';
import { useWorld } from '../../../../context/feature/WorldContext';
import { addLocation, getLocationsForWorld } from '../../../../db/queries/map/location.queries';
import type { Location } from '../../../../db/types';

interface LinkLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (locationId: number) => void;
}

type ModalTab = 'create' | 'link';

export const LinkLocationModal: FC<LinkLocationModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const { selectedWorld } = useWorld();
    const [activeTab, setActiveTab] = useState<ModalTab>('create');

    // State for the "Create New" tab
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');

    // State for the "Link Existing" tab
    const [existingLocations, setExistingLocations] = useState<Location[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        // Fetch existing locations when the modal opens and is on the 'link' tab
        if (isOpen && activeTab === 'link' && selectedWorld?.id) {
            getLocationsForWorld(selectedWorld.id).then(setExistingLocations);
        }
    }, [isOpen, activeTab, selectedWorld]);

    // Reset state when the modal is closed
    useEffect(() => {
        if (!isOpen) {
            setActiveTab('create');
            setNewName('');
            setNewDescription('');
            setSelectedLocationId(null);
            setFilter('');
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleCreateAndConfirm = async () => {
        if (!newName.trim() || !selectedWorld?.id) {
            // In a real app, show an error message
            return;
        }
        const newLocationId = await addLocation({
            worldId: selectedWorld.id,
            name: newName,
            description: newDescription,
        });
        onConfirm(newLocationId);
        onClose();
    };

    const handleLinkAndConfirm = () => {
        if (selectedLocationId) {
            onConfirm(selectedLocationId);
            onClose();
        }
    };

    const filteredLocations = existingLocations.filter((loc) =>
        loc.name.toLowerCase().includes(filter.toLowerCase()),
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal link-location-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">Link a Location</h2>
                    <button onClick={onClose} className="modal__close-button">
                        &times;
                    </button>
                </div>

                <div className="manage-modal__tabs">
                    <button
                        className={`manage-modal__tab-button ${
                            activeTab === 'create' ? 'manage-modal__tab-button--active' : ''
                        }`}
                        onClick={() => setActiveTab('create')}
                    >
                        Create New
                    </button>
                    <button
                        className={`manage-modal__tab-button ${
                            activeTab === 'link' ? 'manage-modal__tab-button--active' : ''
                        }`}
                        onClick={() => setActiveTab('link')}
                    >
                        Link Existing
                    </button>
                </div>

                <div className="modal__content">
                    {activeTab === 'create' && (
                        <form className="form">
                            <div className="form__group">
                                <label htmlFor="locationName" className="form__label">
                                    Location Name
                                </label>
                                <input
                                    id="locationName"
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="form__input"
                                    placeholder="e.g., The Whispering Caverns"
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="locationDescription" className="form__label">
                                    Description
                                </label>
                                <textarea
                                    id="locationDescription"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    className="form__textarea"
                                    rows={3}
                                    placeholder="A brief summary of the location."
                                />
                            </div>
                        </form>
                    )}
                    {activeTab === 'link' && (
                        <div className="form">
                            <input
                                type="text"
                                placeholder="Search existing locations..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="form__input"
                            />
                            <div className="link-location-modal__list">
                                {filteredLocations.map((loc) => (
                                    <button
                                        key={loc.id}
                                        onClick={() => setSelectedLocationId(loc.id!)}
                                        className={`link-location-modal__list-item ${
                                            selectedLocationId === loc.id
                                                ? 'link-location-modal__list-item--selected'
                                                : ''
                                        }`}
                                    >
                                        {loc.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal__footer">
                    <button onClick={onClose} className="button">
                        Cancel
                    </button>
                    {activeTab === 'create' ? (
                        <button
                            onClick={handleCreateAndConfirm}
                            className="button button--primary"
                            disabled={!newName.trim()}
                        >
                            Create & Link
                        </button>
                    ) : (
                        <button
                            onClick={handleLinkAndConfirm}
                            className="button button--primary"
                            disabled={!selectedLocationId}
                        >
                            Confirm Link
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
