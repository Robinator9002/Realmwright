// src/context/AbilityTreeEditorContext.tsx

/**
 * COMMIT: feat(ability-tree): make tree state reactive within context
 *
 * This commit refactors the context to manage the `AbilityTree` object as a
 * reactive state, resolving the stale tier counter bug.
 *
 * Rationale:
 * The previous implementation passed a static `tree` object to the provider,
 * which never updated. This caused UI components to display stale data (like
 * the tier count) until the entire editor was remounted.
 *
 * Implementation Details:
 * - The provider now initializes the `AbilityTree` in a `useState` hook,
 * making it a piece of reactive state (`currentTree`).
 * - The logic for `onAddTier` and `onRemoveTier` has been moved directly
 * into the provider. These functions now perform the database update and then
 * call `setCurrentTree` to publish the new state to all consumers.
 * - The context now exposes the reactive `currentTree` and the new handler
 * functions, ensuring the entire UI updates instantly when the tree changes.
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
import { useAbilityTreeData } from '../hooks/useAbilityTreeData';
import { updateAbilityTree } from '../db/queries/ability.queries'; // Import the query
import type { Ability, AbilityTree } from '../db/types';
import type { PrerequisiteLogicType } from '../components/specific/AbilityTree/Sidebar/PrerequisiteModal';

interface AbilityTreeEditorContextType {
    // STATE
    currentTree: AbilityTree; // Changed from 'tree' to 'currentTree' for clarity
    abilities: Ability[];
    isLoading: boolean;
    error: string | null;
    selectedNode: Node | null;
    pendingConnection: Connection | null;

    // ACTIONS
    setSelectedNode: (node: Node | null) => void;
    setPendingConnection: (connection: Connection | null) => void;
    handleAddTier: () => Promise<void>; // New action
    handleRemoveTier: () => Promise<void>; // New action
    // ... other actions from useAbilityTreeData
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
    initialTree: AbilityTree; // Renamed for clarity
    children: ReactNode;
}> = ({ initialTree, children }) => {
    // --- STATE MANAGEMENT ---
    const [currentTree, setCurrentTree] = useState<AbilityTree>(initialTree);
    const abilityTreeData = useAbilityTreeData(currentTree); // The hook now depends on the reactive state
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);

    // --- NEW TIER HANDLERS ---
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

    const value = useMemo(
        () => ({
            currentTree,
            ...abilityTreeData,
            selectedNode,
            setSelectedNode,
            pendingConnection,
            setPendingConnection,
            handleAddTier,
            handleRemoveTier,
        }),
        [
            currentTree,
            abilityTreeData,
            selectedNode,
            pendingConnection,
            handleAddTier,
            handleRemoveTier,
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
