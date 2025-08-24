// src/pages/AbiltyTree/AbilityTreeEditorPage.tsx

/**
 * COMMIT: refactor(ability-tree): simplify editor page and add exit button
 *
 * This commit refactors the `AbilityTreeEditorPage` to be a simple layout
 * component that consumes the reactive state from the `AbilityTreeEditorContext`.
 *
 * Rationale:
 * The page component no longer needs to manage the `currentTree` state, as this
 * is now handled by the context provider. This change completes the state
 * management refactor and resolves the stale UI bug.
 *
 * Implementation Details:
 * - All local state for `currentTree` and the `onAddTier`/`onRemoveTier` handlers
 * have been removed. The component now relies entirely on the context.
 * - The `AbilityTreeSidebar` is now called without the tier-related props, as
 * the `TierControls` will get them from the context directly.
 * - A "Back to List" button has been added to the header, fulfilling a key
 * requirement from the final polish plan.
 */
import { useState, useEffect, type FC, useCallback } from 'react';
import { useWorld } from '../../context/WorldContext';
import type { AbilityTree } from '../../db/types';
import { getAbilityTreesForWorld } from '../../db/queries/ability.queries';
import { ReactFlowProvider } from 'reactflow';

import {
    AbilityTreeEditorProvider,
    useAbilityTreeEditor,
} from '../../context/AbilityTreeEditorContext';
import { AbilityTreeSidebar } from '../../components/specific/AbilityTree/Sidebar/AbilityTreeSidebar';
import { AbilityTreeCanvas } from '../../components/specific/AbilityTree/Canvas/AbilityTreeCanvas';
import { TierBar } from '../../components/specific/AbilityTree/Canvas/TierBar';
import { PrerequisiteModal } from '../../components/specific/AbilityTree/Sidebar/PrerequisiteModal';

type ViewportState = {
    y: number;
    zoom: number;
};

const AbilityTreeEditor: FC<{
    onClose: () => void;
}> = ({ onClose }) => {
    const { selectedWorld } = useWorld();
    // The reactive tree and handlers are now sourced from the context
    const { currentTree, handleConnect, pendingConnection, setPendingConnection } =
        useAbilityTreeEditor();

    const [availableTrees, setAvailableTrees] = useState<AbilityTree[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [canvasViewport, setCanvasViewport] = useState<ViewportState>({ y: 0, zoom: 1 });

    useEffect(() => {
        const fetchAvailableTrees = async () => {
            if (selectedWorld?.id) {
                const allTrees = await getAbilityTreesForWorld(selectedWorld.id);
                setAvailableTrees(allTrees.filter((t) => t.id !== currentTree.id));
            }
        };
        fetchAvailableTrees();
    }, [selectedWorld, currentTree.id]);

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

    return (
        <>
            <div className="ability-editor-page">
                <header className="ability-editor-page__header">
                    {/* NEW: Exit button added */}
                    <button onClick={onClose} className="button">
                        &larr; Back to List
                    </button>
                    <h2 className="ability-editor-page__title">Editing: {currentTree.name}</h2>
                </header>
                <main className="ability-editor-page__main">
                    {/* The sidebar no longer needs the tier handlers passed as props */}
                    <AbilityTreeSidebar availableTrees={availableTrees} />
                    <div className="ability-editor-page__canvas">
                        <ReactFlowProvider>
                            <AbilityTreeCanvas onViewportChange={setCanvasViewport} />
                        </ReactFlowProvider>
                    </div>
                    {/* TierBar now reads the reactive tierCount from the context-aware currentTree */}
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

export const AbilityTreeEditorPage: FC<{ tree: AbilityTree; onClose: () => void }> = ({
    tree,
    onClose,
}) => {
    return (
        <AbilityTreeEditorProvider initialTree={tree}>
            <AbilityTreeEditor onClose={onClose} />
        </AbilityTreeEditorProvider>
    );
};
