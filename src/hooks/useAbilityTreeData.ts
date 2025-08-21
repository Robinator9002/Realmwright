// src/hooks/useAbilityTreeData.ts
import { useState, useCallback } from 'react';
import type { Node, Connection } from 'reactflow';
import { useWorld } from '../context/WorldContext';
import { addAbility, getAbilitiesForTree, updateAbility } from '../db/queries/ability.queries';
import type { Ability, AbilityTree, PrerequisiteGroup } from '../db/types';
import type { PrerequisiteLogicType } from '../components/specific/AbilityTree/PrerequisiteModal';

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

    /**
     * REWORKED: Handles creating a prerequisite link between two abilities,
     * now accepting a logic type from the UI.
     * @param connection - The connection object from React Flow.
     * @param logicType - The selected logic ('AND', 'OR', etc.).
     */
    const handleConnect = async (connection: Connection, logicType: PrerequisiteLogicType) => {
        const sourceId = parseInt(connection.source!, 10);
        const targetId = parseInt(connection.target!, 10);
        const targetAbility = abilities.find((a) => a.id === targetId);

        if (targetAbility) {
            // The logic type from the modal is now used to create the group.
            const newPrereqGroup: PrerequisiteGroup = { type: logicType, abilityIds: [sourceId] };

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
