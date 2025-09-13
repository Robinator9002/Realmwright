// src/components/specific/Stats/StatManager.tsx

/**
 * COMMIT: refactor(stats): simplify StatManager into a container component
 *
 * Rationale:
 * To complete the refactoring of the stats management feature, this commit
 * transforms the `StatManager` into a pure container component. It no longer
 * handles the rendering logic for its sub-sections directly.
 *
 * Implementation Details:
 * - The local state and handlers for the creation form have been removed.
 * - The rendering logic for the stat list has been removed.
 * - The new `CreateStatForm` and `StatList` components are now imported and
 * rendered.
 * - `StatManager` is now solely responsible for fetching data, managing the
 * state for the "Manage" modal, and passing the necessary data and callbacks
 * down to its children. This results in a much cleaner, more maintainable
 * component that adheres to the single-responsibility principle.
 */
import { useState, useEffect, useCallback, type FC } from 'react';
import { useWorld } from '../../../context/feature/WorldContext';
import { useModal } from '../../../context/global/ModalContext';
import {
    getStatDefinitionsForWorld,
    updateStatDefinition,
    deleteStatDefinition,
    type UpdateStatPayload,
} from '../../../db/queries/character/stat.queries';
import type { StatDefinition } from '../../../db/types';
import { ManageStatModal } from './ManageStatModal';
import { CreateStatForm } from './management/CreateStatForm';
import { StatList } from './management/StatList';

export const StatManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();

    const [stats, setStats] = useState<StatDefinition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

                <CreateStatForm onStatCreated={fetchStats} />

                <StatList
                    stats={stats}
                    isLoading={isLoading}
                    error={error}
                    onManage={setManagingStat}
                    onDelete={handleDeleteStat}
                />
            </div>

            <ManageStatModal
                isOpen={isManageModalOpen}
                onClose={() => setManagingStat(null)}
                statToEdit={managingStat}
                onSave={handleSaveStat}
            />
        </>
    );
};
