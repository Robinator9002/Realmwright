// src/components/specific/Quest/QuestManager.tsx

import { useState, useEffect, useCallback, type FC } from 'react';
import { Settings, PlusCircle, Trash2 } from 'lucide-react';
import { useWorld } from '../../../context/feature/WorldContext';
import { useModal } from '../../../context/global/ModalContext';
import {
    getQuestsForWorld,
    deleteQuest,
    addQuest,
    updateQuest,
} from '../../../db/queries/map/quest.queries';
import type { Quest } from '../../../db/types';
import { ManageQuestModal, type QuestSaveData } from './ManageQuestModal';

export const QuestManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();

    const [quests, setQuests] = useState<Quest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [managingQuest, setManagingQuest] = useState<Quest | null>(null);
    const isManageModalOpen = !!managingQuest;

    const fetchQuests = useCallback(async () => {
        if (!selectedWorld?.id) return;
        try {
            setError(null);
            setIsLoading(true);
            const worldQuests = await getQuestsForWorld(selectedWorld.id);
            setQuests(worldQuests);
        } catch (err) {
            setError('Failed to load quests.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedWorld]);

    useEffect(() => {
        fetchQuests();
    }, [fetchQuests]);

    const handleOpenCreateModal = () => {
        setManagingQuest({} as Quest);
    };

    const handleOpenEditModal = (quest: Quest) => {
        setManagingQuest(quest);
    };

    const handleSaveQuest = async (saveData: QuestSaveData) => {
        if (!selectedWorld?.id) return;
        try {
            if (managingQuest && managingQuest.id) {
                await updateQuest(managingQuest.id, saveData);
            } else {
                await addQuest({
                    ...saveData,
                    worldId: selectedWorld.id,
                });
            }
            await fetchQuests();
        } catch (err) {
            setError('Failed to save quest.');
        }
    };

    const handleDeleteQuest = (quest: Quest) => {
        showModal({
            type: 'confirmation',
            title: `Delete ${quest.name}?`,
            message:
                'Are you sure you want to delete this quest? This action is permanent and cannot be undone.',
            isDanger: true,
            onConfirm: async () => {
                try {
                    await deleteQuest(quest.id!);
                    await fetchQuests();
                } catch (err) {
                    setError('Failed to delete the quest.');
                }
            },
        });
    };

    return (
        <>
            <div className="panel">
                <div className="panel__header-actions">
                    <h2 className="panel__title" style={{ border: 'none', padding: 0 }}>
                        World Quests
                    </h2>
                    <button onClick={handleOpenCreateModal} className="button button--primary">
                        <PlusCircle size={16} /> Create New Quest
                    </button>
                </div>

                <div className="panel__list-section">
                    {error && <p className="error-message">{error}</p>}
                    {isLoading ? (
                        <p>Loading quests...</p>
                    ) : quests.length > 0 ? (
                        <ul className="panel__list">
                            {quests.map((quest) => (
                                <li key={quest.id} className="panel__list-item">
                                    <div className="panel__item-details">
                                        <h4 className="panel__item-title">{quest.name}</h4>
                                        <p className="panel__item-description">
                                            {quest.description}
                                        </p>
                                    </div>
                                    <div className="panel__item-actions">
                                        <button
                                            onClick={() => handleOpenEditModal(quest)}
                                            className="button"
                                        >
                                            <Settings size={16} /> Details
                                        </button>
                                        <button
                                            onClick={() => handleDeleteQuest(quest)}
                                            className="button button--danger"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="panel__empty-message">
                            No quests defined for this world yet.
                        </p>
                    )}
                </div>
            </div>

            <ManageQuestModal
                isOpen={isManageModalOpen}
                onClose={() => setManagingQuest(null)}
                questToEdit={managingQuest}
                onSave={handleSaveQuest}
            />
        </>
    );
};
