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
 * REWORKED: The hook now includes logic for attaching and detaching ability trees.
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
        isAttachmentPoint: boolean,
    ) => {
        if (!name.trim() || !selectedWorld?.id) return;
        try {
            let attachmentPoint: AttachmentPoint | undefined = undefined;
            if (isAttachmentPoint) {
                attachmentPoint = { id: crypto.randomUUID() };
            }
            await addAbility({
                name,
                description,
                worldId: selectedWorld.id,
                abilityTreeId: tree.id!,
                tier,
                iconUrl,
                attachmentPoint,
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

    /**
     * NEW: Attaches a specified tree to an attachment point.
     */
    const handleAttachTree = async (abilityId: number, treeToAttachId: number) => {
        const targetAbility = abilities.find((a) => a.id === abilityId);
        if (targetAbility?.attachmentPoint) {
            const updatedAttachmentPoint: AttachmentPoint = {
                ...targetAbility.attachmentPoint,
                attachedTreeId: treeToAttachId,
            };
            try {
                await updateAbility(abilityId, { attachmentPoint: updatedAttachmentPoint });
                await refreshAbilities();
            } catch (err) {
                console.error('Failed to attach tree:', err);
                setError('Could not attach the selected tree.');
            }
        }
    };

    /**
     * NEW: Detaches a tree from an attachment point.
     */
    const handleDetachTree = async (abilityId: number) => {
        const targetAbility = abilities.find((a) => a.id === abilityId);
        if (targetAbility?.attachmentPoint) {
            const updatedAttachmentPoint: AttachmentPoint = {
                ...targetAbility.attachmentPoint,
                attachedTreeId: undefined,
            };
            try {
                await updateAbility(abilityId, { attachmentPoint: updatedAttachmentPoint });
                await refreshAbilities();
            } catch (err) {
                console.error('Failed to detach tree:', err);
                setError('Could not detach the tree.');
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
        handleDelete,
        handleAttachTree,
        handleDetachTree,
    };
};
