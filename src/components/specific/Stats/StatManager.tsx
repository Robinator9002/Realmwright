// src/components/specific/Stats/StatManager.tsx
import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { Settings, Trash2 } from 'lucide-react';
import { useWorld } from '../../../context/feature/WorldContext';
import { useModal } from '../../../context/global/ModalContext';
import {
    addStatDefinition,
    getStatDefinitionsForWorld,
    updateStatDefinition,
    deleteStatDefinition,
    type UpdateStatPayload,
} from '../../../db/queries/character/stat.queries';
import type { StatDefinition } from '../../../db/types';
// NEW: Import the specialized modal
import { ManageStatModal } from './ManageStatModal';

/**
 * A component for defining and managing game statistics for the active world.
 */
export const StatManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();

    const [stats, setStats] = useState<StatDefinition[]>([]);

    // State for the creation form fields
    const [newStatName, setNewStatName] = useState('');
    const [newStatDescription, setNewStatDescription] = useState('');
    const [newStatAbbr, setNewStatAbbr] = useState('');
    const [newStatDefault, setNewStatDefault] = useState(10);
    // NEW: Add state for the new stat's type
    const [newStatType, setNewStatType] = useState<'primary' | 'derived' | 'resource'>('primary');

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for the new ManageStatModal
    const [managingStat, setManagingStat] = useState<StatDefinition | null>(null);
    const isManageModalOpen = !!managingStat;

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
                type: newStatType, // NEW: Pass the type
                worldId: selectedWorld.id,
            });
            // Reset form fields
            setNewStatName('');
            setNewStatDescription('');
            setNewStatAbbr('');
            setNewStatDefault(10);
            setNewStatType('primary');
            await fetchStats();
        } catch (err) {
            setError('Failed to save the new stat definition.');
        }
    };

    // --- Handlers for the new ManageStatModal ---
    const handleSaveStat = async (updates: Partial<UpdateStatPayload>, statId: number) => {
        try {
            await updateStatDefinition(statId, updates);
            await fetchStats();
        } catch (err) {
            setError('Failed to update the stat definition.');
        }
    };

    const handleDeleteStat = (stat: StatDefinition) => {
        showModal('confirmation', {
            title: `Delete ${stat.name}?`,
            message:
                'Are you sure you want to delete this stat? This action is permanent and cannot be undone.',
            onConfirm: async () => {
                try {
                    await deleteStatDefinition(stat.id!);
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
                <h2 className="panel__title">Stat Definitions</h2>

                <div className="panel__form-section">
                    <h3 className="panel__form-title">Create New Stat</h3>
                    <form onSubmit={handleSubmit} className="form">
                        {/* Form fields are now in a grid for better layout */}
                        <div className="grid grid-cols-2 gap-4">
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
                                <label htmlFor="newStatType" className="form__label">
                                    Type
                                </label>
                                <select
                                    id="newStatType"
                                    value={newStatType}
                                    onChange={(e) =>
                                        setNewStatType(
                                            e.target.value as 'primary' | 'derived' | 'resource',
                                        )
                                    }
                                    className="form__select"
                                >
                                    <option value="primary">Primary</option>
                                    <option value="derived">Derived</option>
                                    <option value="resource">Resource</option>
                                </select>
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
                                        <button
                                            onClick={() => handleDeleteStat(stat)}
                                            className="button button--danger"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <span className="status-badge">{stat.type}</span>
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

            {/* The old generic modal is replaced with our new specialized one. */}
            <ManageStatModal
                isOpen={isManageModalOpen}
                onClose={() => setManagingStat(null)}
                statToEdit={managingStat}
                onSave={handleSaveStat}
            />
        </>
    );
};
