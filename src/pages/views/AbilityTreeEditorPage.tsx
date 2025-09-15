// src/pages/views/AbilityTreeEditorPage.tsx

/**
 * COMMIT: refactor(ability-tree): make AbilityTreeEditorPage responsible for its own data fetching
 *
 * Rationale:
 * To complete the architectural consolidation, this page component is being
 * refactored to be self-sufficient. It no longer receives a pre-fetched
 * `AbilityTree` object but instead takes a `treeId` and fetches its own data.
 *
 * Implementation Details:
 * - The props for `AbilityTreeEditorPage` have been changed from `tree` to `treeId`.
 * - The component now contains its own `useEffect` hook to call
 * `getAbilityTreeById` when it mounts.
 * - It manages its own loading and error states, providing feedback to the user
 * while the data is being fetched.
 * - The fetched `AbilityTree` object is then used to initialize the
 * `AbilityTreeEditorProvider`, completing the data flow.
 */
import { useState, useEffect, type FC, useCallback } from 'react';
import { useWorld } from '../../context/feature/WorldContext';
import type { AbilityTree } from '../../db/types';
import {
    getAbilityTreesForWorld,
    getAbilityTreeById,
} from '../../db/queries/character/ability.queries';
import { ReactFlowProvider } from 'reactflow';

import {
    AbilityTreeEditorProvider,
    useAbilityTreeEditor,
} from '../../context/feature/AbilityTreeEditorContext';
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

    useEffect(() => {
        if (pendingConnection || selectedEdge) {
            setIsModalOpen(true);
        }
    }, [pendingConnection, selectedEdge]);

    const handlePrerequisiteSelect = useCallback(
        (type: 'AND' | 'OR') => {
            if (pendingConnection) {
                handleConnect(pendingConnection, type);
            }
        },
        [handleConnect, pendingConnection],
    );

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

// The page now accepts a treeId and fetches the data itself.
export const AbilityTreeEditorPage: FC<{ treeId: number; onClose: () => void }> = ({
    treeId,
    onClose,
}) => {
    const [tree, setTree] = useState<AbilityTree | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTree = async () => {
            try {
                const fetchedTree = await getAbilityTreeById(treeId);
                if (fetchedTree) {
                    setTree(fetchedTree);
                } else {
                    setError(`Ability Tree with ID ${treeId} not found.`);
                }
            } catch (err) {
                setError('Failed to load the ability tree.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTree();
    }, [treeId]);

    if (isLoading) {
        return <p>Loading Editor...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (!tree) {
        return <p>Could not load ability tree data.</p>;
    }

    return (
        <AbilityTreeEditorProvider initialTree={tree}>
            <AbilityTreeEditor onClose={onClose} />
        </AbilityTreeEditorProvider>
    );
};
