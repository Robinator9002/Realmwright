// src/context/AbilityTreeEditorContext.tsx

/**
 * COMMIT: fix(ability-tree): correct import path for PrerequisiteModal
 *
 * This commit corrects a file path error in the initial creation of the context.
 * The `PrerequisiteModal` component was incorrectly imported. With the full
 * project structure now available for reference, this path has been updated to
 * point to the correct location within the `/Sidebar/` directory.
 */
import { createContext, useContext, useMemo, useState, type FC, type ReactNode } from 'react';
import { type Node, type Edge, type Connection } from 'reactflow';
import { useAbilityTreeData } from '../hooks/useAbilityTreeData';
import type { Ability, AbilityTree } from '../db/types';
// CORRECTED IMPORT PATH
import type { PrerequisiteLogicType } from '../components/specific/AbilityTree/Sidebar/PrerequisiteModal';

// --- TYPE DEFINITION ---
// Defines the precise "shape" of the data and actions that will be available
// to any component that consumes this context. This ensures type safety.
interface AbilityTreeEditorContextType {
    // STATE: Read-only data representing the current state of the editor.
    tree: AbilityTree;
    abilities: Ability[];
    isLoading: boolean;
    error: string | null;
    selectedNode: Node | null;
    pendingConnection: Connection | null;

    // ACTIONS: Functions to modify the editor's state.
    setSelectedNode: (node: Node | null) => void;
    setPendingConnection: (connection: Connection | null) => void;
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

// --- CONTEXT CREATION ---
// We create the context here, initially with `undefined`. This forces us to
// provide a value and ensures any component trying to use the context outside
// of its provider will fail loudly, preventing bugs.
const AbilityTreeEditorContext = createContext<AbilityTreeEditorContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
// This is the component that will wrap the entire Ability Tree Editor. It is
// responsible for managing and providing the state to all its children.
export const AbilityTreeEditorProvider: FC<{
    tree: AbilityTree;
    children: ReactNode;
}> = ({ tree, children }) => {
    // The core data logic is still handled by our well-defined custom hook.
    const abilityTreeData = useAbilityTreeData(tree);

    // UI-specific state that lives here, close to where it's used.
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);

    // `useMemo` is a crucial optimization. It ensures that the context value
    // object is only recreated when its dependencies change. This prevents
    // unnecessary re-renders of all consumer components every time the provider
    // itself re-renders.
    const value = useMemo(
        () => ({
            tree,
            ...abilityTreeData,
            selectedNode,
            setSelectedNode,
            pendingConnection,
            setPendingConnection,
        }),
        [tree, abilityTreeData, selectedNode, pendingConnection],
    );

    return (
        <AbilityTreeEditorContext.Provider value={value}>
            {children}
        </AbilityTreeEditorContext.Provider>
    );
};

// --- CONSUMER HOOK ---
// This is the public-facing API for our context. Components will use this
// custom hook to gain access to the editor's state and actions.
export const useAbilityTreeEditor = (): AbilityTreeEditorContextType => {
    const context = useContext(AbilityTreeEditorContext);

    // This check is a safeguard. If a component tries to use this hook without
    // being a child of the Provider, we throw an explicit error, which makes
    // debugging much easier than dealing with silent failures.
    if (!context) {
        throw new Error('useAbilityTreeEditor must be used within an AbilityTreeEditorProvider');
    }

    return context;
};
