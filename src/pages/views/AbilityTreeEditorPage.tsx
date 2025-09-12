// src/pages/views/AbilityTreeEditorPage.tsx

/**
 * COMMIT: fix(ability-tree): ensure edge click correctly triggers edit modal
 *
 * This commit resolves a critical bug where clicking an edge to edit it did
 * not open the PrerequisiteModal.
 *
 * Rationale:
 * The root cause was a state-to-UI disconnect. The `selectedEdge` state was
 * being set correctly in the context, but the `AbilityTreeEditorPage` was not
 * reacting to this change to set its local `isModalOpen` state to true.
 *
 * Implementation Details:
 * 1.  **State Synchronization:**
 * - A new `useEffect` hook has been added to the `AbilityTreeEditor` component.
 * - This effect listens for changes to both `pendingConnection` (for creation)
 * and `selectedEdge` (for editing). If either exists, it sets
 * `isModalOpen` to `true`, ensuring the modal always appears when needed.
 * 2.  **Centralized Modal Close Logic:**
 * - A new `handleModalClose` function now handles all modal closing logic.
 * - It correctly resets `isModalOpen`, `pendingConnection`, and `selectedEdge`,
 * preventing stale state and ensuring the modal behaves predictably.
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
    const {
        currentTree,
        handleConnect,
        pendingConnection,
        setPendingConnection,
        selectedEdge,
        setSelectedEdge,
    } = useAbilityTreeEditor();

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

    // NEW: This effect synchronizes the modal's visibility with the context state.
    useEffect(() => {
        // If a new connection is pending OR an existing edge is selected, open the modal.
        if (pendingConnection || selectedEdge) {
            setIsModalOpen(true);
        }
    }, [pendingConnection, selectedEdge]);

    const handlePrerequisiteSelect = useCallback(
        (type: 'AND' | 'OR') => {
            if (pendingConnection) {
                handleConnect(pendingConnection, type);
            }
            // The modal close logic will handle resetting state.
        },
        [handleConnect, pendingConnection],
    );

    // NEW: Centralized handler for closing the modal and resetting all related state.
    const handleModalClose = () => {
        setIsModalOpen(false);
        setPendingConnection(null);
        setSelectedEdge(null);
    };

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
                    <AbilityTreeSidebar availableTrees={availableTrees} />
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
                onClose={handleModalClose}
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
