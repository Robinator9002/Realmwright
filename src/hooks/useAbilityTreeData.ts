// src/hooks/useAbilityTreeData.ts
import { useState, useCallback } from 'react';
import { type Node, type Edge, type Connection } from 'reactflow';
import { useWorld } from '../context/WorldContext';
import {
    addAbility,
    getAbilitiesForTree,
    updateAbility,
    deleteAbility, // NEW: Import the deleteAbility query
} from '../db/queries/ability.queries';
import type { Ability, AbilityTree, PrerequisiteGroup } from '../db/types';
import type { PrerequisiteLogicType } from '../components/specific/AbilityTree/PrerequisiteModal';

/**
 * REWORKED: The hook now manages the full lifecycle of abilities, including deletion.
 */
export const useAbilityTreeData = (tree: AbilityTree) => {
    const { selectedWorld } = useWorld();
    const [abilities, setAbilities] = useState<Ability[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshAbilities = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const treeAbilities = await getAbilitiesForTree(tree.id!);
            setAbilities(treeAbilities);
        } catch (err) {
            console.error('Failed to refresh abilities:', err);
            setError('Could not load abilities for this tree.');
        } finally {
            setIsLoading(false);
        }
    }, [tree.id]);

    const handleAddAbility = async (
        name: string,
        description: string,
        tier: number,
        iconUrl: string,
    ) => {
        if (!name.trim() || !selectedWorld?.id) return;
        try {
            await addAbility({
                name,
                description,
                worldId: selectedWorld.id,
                abilityTreeId: tree.id!,
                tier,
                iconUrl,
            });
            await refreshAbilities();
        } catch (err) {
            console.error('Failed to add ability:', err);
            setError('There was an issue creating the new ability.');
        }
    };

    const handleNodeDragStop = async (node: Node, closestTier: number) => {
        const abilityId = parseInt(node.id, 10);
        try {
            await updateAbility(abilityId, {
                x: node.position.x,
                y: node.position.y,
                tier: closestTier,
            });
            setAbilities((prev) =>
                prev.map((a) =>
                    a.id === abilityId
                        ? { ...a, x: node.position.x, y: node.position.y, tier: closestTier }
                        : a,
                ),
            );
        } catch (err) {
            console.error('Failed to update ability position:', err);
            setError('Could not save the new ability position.');
        }
    };

    const handleConnect = async (connection: Connection, logicType: PrerequisiteLogicType) => {
        const sourceId = parseInt(connection.source!, 10);
        const targetId = parseInt(connection.target!, 10);
        const targetAbility = abilities.find((a) => a.id === targetId);

        if (targetAbility) {
            const newPrereqGroup: PrerequisiteGroup = { type: logicType, abilityIds: [sourceId] };
            const updatedPrerequisites = [...(targetAbility.prerequisites || []), newPrereqGroup];
            try {
                await updateAbility(targetId, { prerequisites: updatedPrerequisites });
                await refreshAbilities();
            } catch (err) {
                console.error('Failed to create prerequisite connection:', err);
                setError('Could not save the new prerequisite link.');
            }
        }
    };

    /**
     * NEW: Handles the deletion of nodes (abilities) and edges (prerequisites).
     */
    const handleDelete = async (deletedNodes: Node[], deletedEdges: Edge[]) => {
        try {
            // Handle node deletions
            for (const node of deletedNodes) {
                await deleteAbility(parseInt(node.id, 10));
            }

            // Handle edge deletions
            for (const edge of deletedEdges) {
                const targetId = parseInt(edge.target, 10);
                const sourceId = parseInt(edge.source, 10);
                const targetAbility = abilities.find((a) => a.id === targetId);

                if (targetAbility) {
                    // Filter out the prerequisite group that corresponds to the deleted edge
                    const updatedPrerequisites = targetAbility.prerequisites.filter((group) => {
                        // This logic is simple for now. If a group has the sourceId, we remove it.
                        // A more complex system might only remove the sourceId from the group's array.
                        return !group.abilityIds.includes(sourceId);
                    });
                    await updateAbility(targetId, { prerequisites: updatedPrerequisites });
                }
            }

            // If anything was deleted, refresh the data from the DB
            if (deletedNodes.length > 0 || deletedEdges.length > 0) {
                await refreshAbilities();
            }
        } catch (err) {
            console.error('Failed to delete elements:', err);
            setError('Could not save the deletions.');
        }
    };

    return {
        abilities,
        isLoading,
        error,
        refreshAbilities,
        handleAddAbility,
        handleNodeDragStop,
        handleConnect,
        handleDelete, // Expose the new handler
    };
};
