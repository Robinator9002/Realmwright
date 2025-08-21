// src/hooks/useAbilityTreeData.ts
import { useState, useCallback } from 'react';
import { type Node, type Edge, type Connection } from 'reactflow';
import { useWorld } from '../context/WorldContext';
import {
    addAbility,
    getAbilitiesForTree,
    updateAbility,
    deleteAbility,
} from '../db/queries/ability.queries';
import type { Ability, AbilityTree, PrerequisiteGroup, AttachmentPoint } from '../db/types';
import type { PrerequisiteLogicType } from '../components/specific/AbilityTree/PrerequisiteModal';

/**
 * REWORKED: The hook now handles the creation of abilities that are
 * designated as Attachment Points.
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

    /**
     * REWORKED: This function now accepts an `isAttachmentPoint` flag to
     * determine what kind of ability to create.
     */
    const handleAddAbility = async (
        name: string,
        description: string,
        tier: number,
        iconUrl: string,
        isAttachmentPoint: boolean, // NEW parameter
    ) => {
        if (!name.trim() || !selectedWorld?.id) return;
        try {
            let attachmentPoint: AttachmentPoint | undefined = undefined;

            // If the checkbox was checked, create the attachment point object
            if (isAttachmentPoint) {
                attachmentPoint = {
                    id: crypto.randomUUID(), // Generate a unique ID for the socket
                };
            }

            await addAbility({
                name,
                description,
                worldId: selectedWorld.id,
                abilityTreeId: tree.id!,
                tier,
                iconUrl,
                attachmentPoint, // Pass the new object to the query
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

    const handleDelete = async (deletedNodes: Node[], deletedEdges: Edge[]) => {
        try {
            for (const node of deletedNodes) {
                await deleteAbility(parseInt(node.id, 10));
            }
            for (const edge of deletedEdges) {
                const targetId = parseInt(edge.target, 10);
                const sourceId = parseInt(edge.source, 10);
                const targetAbility = abilities.find((a) => a.id === targetId);
                if (targetAbility) {
                    const updatedPrerequisites = targetAbility.prerequisites.filter(
                        (group) => !group.abilityIds.includes(sourceId),
                    );
                    await updateAbility(targetId, { prerequisites: updatedPrerequisites });
                }
            }
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
        handleDelete,
    };
};
