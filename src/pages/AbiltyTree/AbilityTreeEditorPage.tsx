// src/pages/AbiltyTree/AbilityTreeEditorPage.tsx

/**
 * COMMIT: refactor(ability-tree): implement context provider in editor page
 *
 * This commit refactors the main editor page component to utilize the new
 * `AbilityTreeEditorContext`.
 *
 * Rationale:
 * The original `AbilityTreeEditorPage` was a monolithic component responsible for
 * fetching data, managing all UI state, and passing a large number of props down
 * to its children. This created tight coupling and made the component difficult
 * to reason about.
 *
 * Implementation Details:
 * - The component is now split into two parts:
 * 1. `AbilityTreeEditorPage`: The main export, whose only job is to wrap the
 * editor in the `AbilityTreeEditorProvider`, supplying it with the tree.
 * 2. `AbilityTreeEditor`: An inner component that consumes the context via the
 * `useAbilityTreeEditor` hook. It manages state that is truly local to the
 * page layout (like viewport dimensions and modal visibility) and renders
 * the primary child components (Sidebar, Canvas).
 * - All state and logic related to abilities, selected nodes, etc., are now
 * sourced directly from the context, eliminating prop drilling entirely.
 * - The component is significantly cleaner, more declarative, and easier to
 * understand.
 */
import { useState, useEffect, type FC, useCallback } from 'react';
import { useWorld } from '../../context/WorldContext';
import type { AbilityTree } from '../../db/types';
import { updateAbilityTree, getAbilityTreesForWorld } from '../../db/queries/ability.queries';
import { ReactFlowProvider } from 'reactflow';

// Import the new context and the future locations of our refactored components
import {
    AbilityTreeEditorProvider,
    useAbilityTreeEditor,
} from '../../context/AbilityTreeEditorContext';
import { AbilityTreeSidebar } from '../../components/specific/AbilityTree/Sidebar/AbilityTreeSidebar';
import { AbilityTreeCanvas } from '../../components/specific/AbilityTree/Canvas/AbilityTreeCanvas';
import { TierBar } from '../../components/specific/AbilityTree/Canvas/TierBar';
import { PrerequisiteModal } from '../../components/specific/AbilityTree/Sidebar/PrerequisiteModal';

// A simple type for the viewport state, kept locally as it's not shared.
type ViewportState = {
    y: number;
    zoom: number;
};

// --- INNER EDITOR COMPONENT ---
// This component does the actual work of laying out the editor. It can only
// function as a child of the `AbilityTreeEditorProvider`.
const AbilityTreeEditor: FC<{
    initialTree: AbilityTree;
    onClose: () => void;
}> = ({ initialTree, onClose }) => {
    const { selectedWorld } = useWorld();
    // All complex state and handlers are now pulled from our context.
    const { handleConnect, pendingConnection, setPendingConnection } = useAbilityTreeEditor();

    // This state is truly local to the page component itself.
    const [currentTree, setCurrentTree] = useState<AbilityTree>(initialTree);
    const [availableTrees, setAvailableTrees] = useState<AbilityTree[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [canvasViewport, setCanvasViewport] = useState<ViewportState>({ y: 0, zoom: 1 });

    // Fetch trees that can be attached to sockets.
    useEffect(() => {
        const fetchAvailableTrees = async () => {
            if (selectedWorld?.id) {
                const allTrees = await getAbilityTreesForWorld(selectedWorld.id);
                setAvailableTrees(allTrees.filter((t) => t.id !== currentTree.id));
            }
        };
        fetchAvailableTrees();
    }, [selectedWorld, currentTree.id]);

    // Effect to open the modal when a new connection is initiated.
    useEffect(() => {
        if (pendingConnection) {
            setIsModalOpen(true);
        }
    }, [pendingConnection]);

    const handlePrerequisiteSelect = useCallback(
        (type: 'AND' | 'OR') => {
            if (pendingConnection) {
                handleConnect(pendingConnection, type);
            }
            setPendingConnection(null);
            setIsModalOpen(false);
        },
        [handleConnect, pendingConnection, setPendingConnection],
    );

    // Handlers for modifying the tree's tier count. These remain here as they
    // modify the `currentTree` state, which is local to this component.
    const handleAddTier = useCallback(async () => {
        const newTierCount = currentTree.tierCount + 1;
        await updateAbilityTree(currentTree.id!, { tierCount: newTierCount });
        setCurrentTree((prev) => ({ ...prev, tierCount: newTierCount }));
    }, [currentTree]);

    const handleRemoveTier = useCallback(async () => {
        if (currentTree.tierCount <= 1) return;
        const newTierCount = currentTree.tierCount - 1;
        await updateAbilityTree(currentTree.id!, { tierCount: newTierCount });
        setCurrentTree((prev) => ({ ...prev, tierCount: newTierCount }));
    }, [currentTree]);

    return (
        <>
            <div className="ability-editor-page">
                <header className="ability-editor-page__header">
                    <button onClick={onClose} className="button">
                        &larr; Back to List
                    </button>
                    <h2 className="ability-editor-page__title">Editing: {currentTree.name}</h2>
                </header>
                <main className="ability-editor-page__main">
                    {/* Note the drastically reduced number of props being passed. */}
                    <AbilityTreeSidebar
                        availableTrees={availableTrees}
                        onAddTier={handleAddTier}
                        onRemoveTier={handleRemoveTier}
                    />
                    <div className="ability-editor-page__canvas">
                        <ReactFlowProvider>
                            <AbilityTreeCanvas onViewportChange={setCanvasViewport} />
                        </ReactFlowProvider>
                    </div>
                    <TierBar
                        tierCount={currentTree.tierCount}
                        viewportYOffset={canvasViewport.y}
                        viewportZoom={canvasViewport.zoom}
                    />
                </main>
            </div>
            <PrerequisiteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handlePrerequisiteSelect}
            />
        </>
    );
};

// --- MAIN PAGE COMPONENT ---
// This is the component that gets exported. Its only job is to set up the context provider.
export const AbilityTreeEditorPage: FC<{ tree: AbilityTree; onClose: () => void }> = ({
    tree,
    onClose,
}) => {
    return (
        <AbilityTreeEditorProvider tree={tree}>
            <AbilityTreeEditor initialTree={tree} onClose={onClose} />
        </AbilityTreeEditorProvider>
    );
};
