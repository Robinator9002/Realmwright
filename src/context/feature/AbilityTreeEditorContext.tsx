// src/context/feature/AbilityTreeEditorContext.tsx

/**
 * COMMIT: feat(ability-tree): add edge management state to context
 *
 * This commit expands the editor context to support the selection, updating,
 * and deletion of edges (connections).
 *
 * Rationale:
 * To fulfill the requirement for interactive edge management, the context needs
 * to be the single source of truth for which edge is currently selected and
 * must provide the actions to modify it.
 *
 * Implementation Details:
 * - Added `selectedEdge` and `setSelectedEdge` to the context state and actions
 * to track the currently selected connection.
 * - Added a new `handleDeleteEdge` function. This complex action finds the
 * target ability of the selected edge and removes the corresponding
 * prerequisite from its data, then refreshes the state.
 * - Added a new `handleUpdateEdgeLogic` function to change the logic (AND/OR)
 * of an existing prerequisite group.
 */
import {
    createContext,
    useContext,
    useMemo,
    useState,
    useCallback,
    type FC,
    type ReactNode,
} from 'react';
import { type Node, type Edge, type Connection } from 'reactflow';
import { useAbilityTreeData } from '../../hooks/useAbilityTreeData';
import { updateAbilityTree, updateAbility } from '../../db/queries/character/ability.queries';
import type { Ability, AbilityTree, PrerequisiteLogicType } from '../../db/types';

interface AbilityTreeEditorContextType {
    // STATE
    currentTree: AbilityTree;
    abilities: Ability[];
    isLoading: boolean;
    error: string | null;
    selectedNode: Node | null;
    pendingConnection: Connection | null;
    selectedEdge: Edge | null; // NEW: Track the selected edge

    // ACTIONS
    setSelectedNode: (node: Node | null) => void;
    setPendingConnection: (connection: Connection | null) => void;
    setSelectedEdge: (edge: Edge | null) => void; // NEW: Action to set the edge
    handleAddTier: () => Promise<void>;
    handleRemoveTier: () => Promise<void>;
    handleDeleteEdge: () => Promise<void>; // NEW: Action to delete the edge
    handleUpdateEdgeLogic: (newLogic: PrerequisiteLogicType) => Promise<void>; // NEW: Action to update edge
    // ... other actions
    refreshAbilities: () => Promise<void>;
    handleAddAbility: (
        name: string,
        description: string,
        tier: number,
        iconUrl: string,
        isAttachmentPoint: boolean,
        allowedAttachmentType: string,
    ) => Promise<void>;
    handleNodeDragStop: (node: Node, closestTier: number) => Promise<void>;
    handleConnect: (connection: Connection, logicType: PrerequisiteLogicType) => Promise<void>;
    handleDelete: (deletedNodes: Node[], deletedEdges: Edge[]) => Promise<void>;
    handleAttachTree: (abilityId: number, treeToAttachId: number) => Promise<void>;
    handleDetachTree: (abilityId: number) => Promise<void>;
    handleUpdateAbility: (abilityId: number, updates: Partial<Ability>) => Promise<void>;
    handleDeleteAbility: (abilityId: number) => Promise<void>;
}

const AbilityTreeEditorContext = createContext<AbilityTreeEditorContextType | undefined>(undefined);

export const AbilityTreeEditorProvider: FC<{
    initialTree: AbilityTree;
    children: ReactNode;
}> = ({ initialTree, children }) => {
    const [currentTree, setCurrentTree] = useState<AbilityTree>(initialTree);
    const abilityTreeData = useAbilityTreeData(currentTree);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null); // NEW state

    const handleAddTier = useCallback(async () => {
        const newTierCount = currentTree.tierCount + 1;
        await updateAbilityTree(currentTree.id!, { tierCount: newTierCount });
        setCurrentTree((prevTree) => ({ ...prevTree, tierCount: newTierCount }));
    }, [currentTree]);

    const handleRemoveTier = useCallback(async () => {
        if (currentTree.tierCount <= 1) return;
        const newTierCount = currentTree.tierCount - 1;
        await updateAbilityTree(currentTree.id!, { tierCount: newTierCount });
        setCurrentTree((prevTree) => ({ ...prevTree, tierCount: newTierCount }));
    }, [currentTree]);

    // NEW: Logic to delete a prerequisite connection
    const handleDeleteEdge = useCallback(async () => {
        if (!selectedEdge) return;

        const targetAbilityId = parseInt(selectedEdge.target, 10);
        const sourceAbilityId = parseInt(selectedEdge.source, 10);
        const targetAbility = abilityTreeData.abilities.find((a) => a.id === targetAbilityId);

        if (targetAbility) {
            const updatedPrerequisites = targetAbility.prerequisites
                .map((group) => ({
                    ...group,
                    abilityIds: group.abilityIds.filter((id) => id !== sourceAbilityId),
                }))
                .filter((group) => group.abilityIds.length > 0); // Remove empty groups

            await updateAbility(targetAbilityId, { prerequisites: updatedPrerequisites });
            await abilityTreeData.refreshAbilities();
        }
        setSelectedEdge(null); // Close modal
    }, [selectedEdge, abilityTreeData.abilities, abilityTreeData.refreshAbilities]);

    // NEW: Logic to update an existing prerequisite's logic type
    const handleUpdateEdgeLogic = useCallback(
        async (newLogic: PrerequisiteLogicType) => {
            if (!selectedEdge) return;

            const targetAbilityId = parseInt(selectedEdge.target, 10);
            const sourceAbilityId = parseInt(selectedEdge.source, 10);
            const targetAbility = abilityTreeData.abilities.find((a) => a.id === targetAbilityId);

            if (targetAbility) {
                const updatedPrerequisites = targetAbility.prerequisites.map((group) => {
                    if (group.abilityIds.includes(sourceAbilityId)) {
                        return { ...group, type: newLogic };
                    }
                    return group;
                });

                await updateAbility(targetAbilityId, { prerequisites: updatedPrerequisites });
                await abilityTreeData.refreshAbilities();
            }
            setSelectedEdge(null); // Close modal
        },
        [selectedEdge, abilityTreeData.abilities, abilityTreeData.refreshAbilities],
    );

    const value = useMemo(
        () => ({
            currentTree,
            ...abilityTreeData,
            selectedNode,
            setSelectedNode,
            pendingConnection,
            setPendingConnection,
            selectedEdge,
            setSelectedEdge,
            handleAddTier,
            handleRemoveTier,
            handleDeleteEdge,
            handleUpdateEdgeLogic,
        }),
        [
            currentTree,
            abilityTreeData,
            selectedNode,
            pendingConnection,
            selectedEdge,
            handleAddTier,
            handleRemoveTier,
            handleDeleteEdge,
            handleUpdateEdgeLogic,
        ],
    );

    return (
        <AbilityTreeEditorContext.Provider value={value}>
            {children}
        </AbilityTreeEditorContext.Provider>
    );
};

export const useAbilityTreeEditor = (): AbilityTreeEditorContextType => {
    const context = useContext(AbilityTreeEditorContext);
    if (!context) {
        throw new Error('useAbilityTreeEditor must be used within an AbilityTreeEditorProvider');
    }
    return context;
};
