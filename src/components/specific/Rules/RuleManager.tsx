// src/components/specific/RuleManager/RuleManager.tsx
import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { Settings } from 'lucide-react';
import { useWorld } from '../../../context/WorldContext';
import { useModal } from '../../../context/ModalContext';
import {
    addStatDefinition,
    getStatDefinitionsForWorld,
    updateStatDefinition,
    deleteStatDefinition,
} from '../../../db/queries/rule.queries';
import type { StatDefinition } from '../../../db/types';
import { ManageModal } from '../../common/Modal/ManageModal';

/**
 * A component for defining and managing game statistics for the active world.
 */
export const RuleManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();

    // State for the list of stat definitions
    const [stats, setStats] = useState<StatDefinition[]>([]);

    // State for the creation form fields
    const [newStatName, setNewStatName] = useState('');
    const [newStatDescription, setNewStatDescription] = useState('');
    const [newStatAbbr, setNewStatAbbr] = useState('');
    const [newStatDefault, setNewStatDefault] = useState(10);

    // Standard loading and error states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for the ManageModal
    const [managingStat, setManagingStat] = useState<StatDefinition | null>(null);
    const isManageModalOpen = !!managingStat;

    // Fetches all stat definitions for the currently selected world.
    const fetchStats = useCallback(async () => {
        if (!selectedWorld?.id) return;
        try {
            setError(null);
            setIsLoading(true);
            const worldStats = await getStatDefinitionsForWorld(selectedWorld.id);
            setStats(worldStats);
        } catch (err) {
            setError('Failed to load stat definitions.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedWorld]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Handles the submission of the new stat definition form.
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newStatName.trim() || !newStatAbbr.trim() || !selectedWorld?.id) {
            showModal('alert', {
                title: 'Invalid Input',
                message: 'Stat Name and Abbreviation cannot be empty.',
            });
            return;
        }

        try {
            await addStatDefinition({
                name: newStatName,
                description: newStatDescription,
                abbreviation: newStatAbbr,
                defaultValue: newStatDefault,
                worldId: selectedWorld.id,
            });
            // Reset form fields
            setNewStatName('');
            setNewStatDescription('');
            setNewStatAbbr('');
            setNewStatDefault(10);
            await fetchStats(); // Refresh the list
        } catch (err) {
            setError('Failed to save the new stat definition.');
        }
    };

    // --- Handlers for the ManageModal ---

    // Saves changes to a stat's name and description from the ManageModal.
    const handleSaveStat = async (updatedStat: StatDefinition) => {
        try {
            // Our generic modal only handles name/description, which is fine for this entity.
            // The more complex fields (abbr, default) are set at creation.
            await updateStatDefinition(updatedStat.id!, {
                name: updatedStat.name,
                description: updatedStat.description,
                abbreviation: updatedStat.abbreviation,
                defaultValue: updatedStat.defaultValue,
            });
            await fetchStats();
        } catch (err) {
            setError('Failed to update the stat definition.');
        }
    };

    // Triggers the deletion confirmation process.
    const handleDeleteStat = (statId: number) => {
        setManagingStat(null); // Close the manage modal
        showModal('confirmation', {
            title: 'Delete Stat Definition?',
            message:
                'Are you sure you want to delete this stat? This action is permanent and cannot be undone.',
            onConfirm: async () => {
                try {
                    await deleteStatDefinition(statId);
                    await fetchStats();
                } catch (err) {
                    setError('Failed to delete the stat definition.');
                }
            },
        });
    };

    return (
        <>
            <div className="panel">
                <h2 className="panel__title">Rules: Stat Definitions</h2>

                <div className="panel__form-section">
                    <h3 className="panel__form-title">Create New Stat</h3>
                    <form onSubmit={handleSubmit} className="form">
                        <div className="form__group">
                            <label htmlFor="statName" className="form__label">
                                Stat Name
                            </label>
                            <input
                                id="statName"
                                type="text"
                                value={newStatName}
                                onChange={(e) => setNewStatName(e.target.value)}
                                className="form__input"
                                placeholder="e.g., Strength"
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="statAbbr" className="form__label">
                                Abbreviation
                            </label>
                            <input
                                id="statAbbr"
                                type="text"
                                value={newStatAbbr}
                                onChange={(e) => setNewStatAbbr(e.target.value)}
                                className="form__input"
                                placeholder="e.g., STR"
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="statDesc" className="form__label">
                                Description
                            </label>
                            <input
                                id="statDesc"
                                type="text"
                                value={newStatDescription}
                                onChange={(e) => setNewStatDescription(e.target.value)}
                                className="form__input"
                                placeholder="A brief summary of what this stat represents."
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="statDefault" className="form__label">
                                Default Value
                            </label>
                            <input
                                id="statDefault"
                                type="number"
                                value={newStatDefault}
                                onChange={(e) =>
                                    setNewStatDefault(parseInt(e.target.value, 10) || 0)
                                }
                                className="form__input"
                            />
                        </div>
                        <button type="submit" className="button button--primary">
                            Create Stat
                        </button>
                    </form>
                </div>

                <div className="panel__list-section">
                    <h3 className="panel__list-title">Defined Stats</h3>
                    {error && <p className="error-message">{error}</p>}
                    {isLoading ? (
                        <p>Loading stats...</p>
                    ) : stats.length > 0 ? (
                        <ul className="panel__list">
                            {stats.map((stat) => (
                                <li key={stat.id} className="panel__list-item">
                                    <div className="panel__item-details">
                                        <h4 className="panel__item-title">
                                            {stat.name} ({stat.abbreviation})
                                        </h4>
                                        <p className="panel__item-description">
                                            {stat.description}
                                        </p>
                                    </div>
                                    <div className="panel__item-actions">
                                        <button
                                            onClick={() => setManagingStat(stat)}
                                            className="button"
                                        >
                                            <Settings size={16} /> Manage
                                        </button>
                                        <span className="status-badge">
                                            Default: {stat.defaultValue}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="panel__empty-message">
                            No stats have been defined for this world yet.
                        </p>
                    )}
                </div>
            </div>

            <ManageModal<StatDefinition>
                isOpen={isManageModalOpen}
                onClose={() => setManagingStat(null)}
                item={managingStat}
                onSave={handleSaveStat}
                onDelete={handleDeleteStat}
                itemType="Stat Definition"
            />
        </>
    );
};
