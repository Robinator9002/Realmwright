// src/hooks/useAbilityTreeData.ts
import { useState, useCallback } from 'react';
import type { Node, Connection } from 'reactflow';
import { useWorld } from '../context/WorldContext';
import { addAbility, getAbilitiesForTree, updateAbility } from '../db/queries/ability.queries';
import type { Ability, AbilityTree, PrerequisiteGroup } from '../db/types';

/**
 * A custom hook to manage the data and logic for a single ability tree.
 * It encapsulates fetching, creating, and updating abilities.
 *
 * @param tree The AbilityTree for which to manage data.
 * @returns An object containing the abilities state and handler functions.
 */
export const useAbilityTreeData = (tree: AbilityTree) => {
    const { selectedWorld } = useWorld();
    const [abilities, setAbilities] = useState<Ability[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetches all abilities for the current tree from the database
     * and updates the component's state.
     */
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

    /**
     * Handles the creation of a new ability.
     * @param name - The name of the new ability.
     * @param description - The description of the new ability.
     * @param tier - The tier of the new ability.
     * @param iconUrl - The optional icon URL for the new ability.
     */
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
            await refreshAbilities(); // Refresh the list to show the new ability
        } catch (err) {
            console.error('Failed to add ability:', err);
            setError('There was an issue creating the new ability.');
            // Optionally, re-throw or handle the error in the UI
        }
    };

    /**
     * Handles updating an ability's position and tier after it has been dragged.
     * @param node - The React Flow node that was dragged.
     * @param closestTier - The calculated tier the node was dropped in.
     */
    const handleNodeDragStop = async (node: Node, closestTier: number) => {
        const abilityId = parseInt(node.id, 10);
        try {
            await updateAbility(abilityId, {
                x: node.position.x,
                y: node.position.y,
                tier: closestTier,
            });
            // Optimistically update the local state for a smoother UX
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

    /**
     * Handles creating a prerequisite link between two abilities.
     * @param connection - The connection object from React Flow.
     */
    const handleConnect = async (connection: Connection) => {
        const sourceId = parseInt(connection.source!, 10);
        const targetId = parseInt(connection.target!, 10);
        const targetAbility = abilities.find((a) => a.id === targetId);

        if (targetAbility) {
            // NOTE: This is where we will later insert the logic for the prerequisite type modal (AND, OR, etc.).
            // For now, we default to the existing 'AND' logic.
            const newPrereqGroup: PrerequisiteGroup = { type: 'AND', abilityIds: [sourceId] };

            // Create a new array for prerequisites, ensuring we don't add duplicates.
            const existingPrereqs = targetAbility.prerequisites || [];
            const updatedPrerequisites = [...existingPrereqs, newPrereqGroup];

            try {
                await updateAbility(targetId, { prerequisites: updatedPrerequisites });
                await refreshAbilities(); // Refresh to show the new connection
            } catch (err) {
                console.error('Failed to create prerequisite connection:', err);
                setError('Could not save the new prerequisite link.');
            }
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
    };
};
