// src/components/specific/AbilityTree/AbilityManager.tsx

/**
 * COMMIT: refactor(abilities): simplify AbilityManager into a container component
 *
 * Rationale:
 * To complete the refactoring of the ability tree management feature, this
 * commit transforms the `AbilityManager` into a pure container component. It
 * no longer handles the rendering logic for its sub-sections directly.
 *
 * Implementation Details:
 * - The `ManageAbilityTreeModal` component, the creation form, and the list
 * rendering logic have all been removed.
 * - The new, extracted components (`CreateAbilityTreeForm`, `AbilityTreeList`,
 * `ManageAbilityTreeModal`) are now imported and rendered.
 * - `AbilityManager` is now solely responsible for fetching data, managing
 * state, and passing the necessary data and callbacks down to its children,
 * resulting in a much cleaner and more maintainable architecture.
 */
import { useState, useEffect, useCallback, type FC } from 'react';
import { useWorld } from '../../../context/feature/WorldContext';
import { useModal } from '../../../context/global/ModalContext';
import { useView } from '../../../context/global/ViewContext';
import {
    getAbilityTreesForWorld,
    updateAbilityTree,
    deleteAbilityTree,
    type UpdateAbilityTreePayload,
} from '../../../db/queries/character/ability.queries';
import type { AbilityTree } from '../../../db/types';
import { CreateAbilityTreeForm } from './management/CreateAbilityTreeForm';
import { AbilityTreeList } from './management/AbilityTreeList';
import { ManageAbilityTreeModal } from './management/ManageAbilityTreeModal';

export const AbilityManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();
    const { setCurrentView, setEditingAbilityTreeId } = useView();

    const [abilityTrees, setAbilityTrees] = useState<AbilityTree[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [managingTree, setManagingTree] = useState<AbilityTree | null>(null);

    const fetchTrees = useCallback(async () => {
        if (!selectedWorld?.id) return;
        try {
            setError(null);
            setIsLoading(true);
            const trees = await getAbilityTreesForWorld(selectedWorld.id);
            setAbilityTrees(trees);
        } catch (err) {
            setError('Failed to load ability trees.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedWorld]);

    useEffect(() => {
        fetchTrees();
    }, [fetchTrees]);

    const handleSaveTree = async (updates: Partial<UpdateAbilityTreePayload>, treeId: number) => {
        try {
            await updateAbilityTree(treeId, updates);
            await fetchTrees();
        } catch (err) {
            setError('Failed to update ability tree.');
        }
    };

    const handleDeleteTree = (treeId: number) => {
        setManagingTree(null);
        showModal('confirmation', {
            title: 'Delete Ability Tree?',
            message: 'This will delete the tree and ALL abilities within it. This is permanent.',
            onConfirm: async () => {
                try {
                    await deleteAbilityTree(treeId);
                    await fetchTrees();
                } catch (err) {
                    setError('Failed to delete ability tree.');
                }
            },
        });
    };

    const handleOpenEditor = (tree: AbilityTree) => {
        if (tree.id) {
            setEditingAbilityTreeId(tree.id);
            setCurrentView('ability_tree_editor');
        }
    };

    return (
        <>
            <div className="panel">
                <h2 className="panel__title">Ability Trees</h2>

                <CreateAbilityTreeForm onTreeCreated={fetchTrees} />

                <AbilityTreeList
                    trees={abilityTrees}
                    isLoading={isLoading}
                    error={error}
                    onManage={setManagingTree}
                    onOpenEditor={handleOpenEditor}
                />
            </div>

            <ManageAbilityTreeModal
                isOpen={!!managingTree}
                onClose={() => setManagingTree(null)}
                item={managingTree}
                onSave={handleSaveTree}
                onDelete={handleDeleteTree}
            />
        </>
    );
};
