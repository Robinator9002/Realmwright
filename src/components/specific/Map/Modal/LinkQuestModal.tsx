// src/components/specific/Map/Modal/LinkQuestModal.tsx

import { useState, useEffect, type FC } from 'react';
import { useWorld } from '../../../../context/feature/WorldContext';
import { addQuest, getQuestsForWorld } from '../../../../db/queries/map/quest.queries';
import type { Quest } from '../../../../db/types';

interface LinkQuestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (questId: number) => void;
}

type ModalTab = 'create' | 'link';

/**
 * A modal window for either creating a new quest or linking an existing one
 * to a map marker. It mirrors the functionality of LinkLocationModal.
 */
export const LinkQuestModal: FC<LinkQuestModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const { selectedWorld } = useWorld();
    const [activeTab, setActiveTab] = useState<ModalTab>('create');

    // State for the "Create New" tab
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');

    // State for the "Link Existing" tab
    const [existingQuests, setExistingQuests] = useState<Quest[]>([]);
    const [selectedQuestId, setSelectedQuestId] = useState<number | null>(null);
    const [filter, setFilter] = useState('');

    // Fetch existing quests when the modal opens on the 'link' tab.
    useEffect(() => {
        if (isOpen && activeTab === 'link' && selectedWorld?.id) {
            getQuestsForWorld(selectedWorld.id).then(setExistingQuests);
        }
    }, [isOpen, activeTab, selectedWorld]);

    // Reset all local state when the modal is closed to ensure it's clean on next open.
    useEffect(() => {
        if (!isOpen) {
            setActiveTab('create');
            setNewName('');
            setNewDescription('');
            setSelectedQuestId(null);
            setFilter('');
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    // Handler for creating a new quest and immediately confirming the link.
    const handleCreateAndConfirm = async () => {
        if (!newName.trim() || !selectedWorld?.id) return;
        try {
            const newQuestId = await addQuest({
                worldId: selectedWorld.id,
                name: newName,
                description: newDescription,
            });
            onConfirm(newQuestId);
            onClose();
        } catch (error) {
            console.error('Failed to create and link quest:', error);
            // In a real app, you might show an error modal here.
        }
    };

    // Handler for confirming the link of a pre-selected existing quest.
    const handleLinkAndConfirm = () => {
        if (selectedQuestId) {
            onConfirm(selectedQuestId);
            onClose();
        }
    };

    // Filter the list of existing quests based on user input.
    const filteredQuests = existingQuests.filter((quest) =>
        quest.name.toLowerCase().includes(filter.toLowerCase()),
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal link-location-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">Link a Quest</h2>
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
                                <label htmlFor="questName" className="form__label">
                                    Quest Name
                                </label>
                                <input
                                    id="questName"
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="form__input"
                                    placeholder="e.g., The Serpent's Head"
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="questDescription" className="form__label">
                                    Description
                                </label>
                                <textarea
                                    id="questDescription"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    className="form__textarea"
                                    rows={3}
                                    placeholder="A brief summary of the quest."
                                />
                            </div>
                        </form>
                    )}
                    {activeTab === 'link' && (
                        <div className="form">
                            <input
                                type="text"
                                placeholder="Search existing quests..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="form__input"
                            />
                            <div className="link-location-modal__list">
                                {filteredQuests.map((quest) => (
                                    <button
                                        key={quest.id}
                                        onClick={() => setSelectedQuestId(quest.id!)}
                                        className={`link-location-modal__list-item ${
                                            selectedQuestId === quest.id
                                                ? 'link-location-modal__list-item--selected'
                                                : ''
                                        }`}
                                    >
                                        {quest.name}
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
                            disabled={!selectedQuestId}
                        >
                            Confirm Link
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
