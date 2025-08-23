// src/pages/AbiltyTree/AbilityTreeEditorPage.tsx
import { useState, useEffect, type FC, useCallback } from 'react';
import { useWorld } from '../../context/WorldContext';
import type { AbilityTree } from '../../db/types';
import type { Connection, Node } from 'reactflow';
import { useAbilityTreeData } from '../../hooks/useAbilityTreeData';
import { updateAbilityTree, getAbilityTreesForWorld } from '../../db/queries/ability.queries';
import { AbilityTreeSidebar } from '../../components/specific/AbilityTree/Tree/AbilityTreeSidebar';
import { AbilityTreeCanvas } from '../../components/specific/AbilityTree/Tree/AbilityTreeCanvas';
import { TierBar } from '../../components/specific/AbilityTree/Sidebar/TierBar';
import {
    PrerequisiteModal,
    type PrerequisiteLogicType,
} from '../../components/specific/AbilityTree/Sidebar/PrerequisiteModal';
import { ReactFlowProvider } from 'reactflow';

// NEW: Define a type for the viewport state for clarity.
type ViewportState = {
    y: number;
    zoom: number;
};

interface AbilityTreeEditorPageProps {
    tree: AbilityTree;
    onClose: () => void;
}

export const AbilityTreeEditorPage: FC<AbilityTreeEditorPageProps> = ({ tree, onClose }) => {
    const { selectedWorld } = useWorld();
    const [currentTree, setCurrentTree] = useState<AbilityTree>(tree);

    const {
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
        handleUpdateAbility,
        handleDeleteAbility,
    } = useAbilityTreeData(currentTree);

    const [availableTrees, setAvailableTrees] = useState<AbilityTree[]>([]);
    const [newAbilityName, setNewAbilityName] = useState('');
    const [newAbilityDesc, setNewAbilityDesc] = useState('');
    const [newAbilityTier, setNewAbilityTier] = useState(1);
    const [newAbilityIconUrl, setNewAbilityIconUrl] = useState('');
    const [isAttachmentPoint, setIsAttachmentPoint] = useState(false);
    const [newAllowedAttachmentType, setNewAllowedAttachmentType] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    // REWORKED: The state now holds both y and zoom.
    const [canvasViewport, setCanvasViewport] = useState<ViewportState>({ y: 0, zoom: 1 });

    useEffect(() => {
        refreshAbilities();
        const fetchAvailableTrees = async () => {
            if (selectedWorld?.id) {
                const allTrees = await getAbilityTreesForWorld(selectedWorld.id);
                setAvailableTrees(allTrees);
            }
        };
        fetchAvailableTrees();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedWorld, currentTree.id]);

    const handleCreateAbility = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            await handleAddAbility(
                newAbilityName,
                newAbilityDesc,
                newAbilityTier,
                newAbilityIconUrl,
                isAttachmentPoint,
                newAllowedAttachmentType,
            );
            setNewAbilityName('');
            setNewAbilityDesc('');
            setNewAbilityTier(1);
            setNewAbilityIconUrl('');
            setIsAttachmentPoint(false);
            setNewAllowedAttachmentType('');
        },
        [
            handleAddAbility,
            newAbilityName,
            newAbilityDesc,
            newAbilityTier,
            newAbilityIconUrl,
            isAttachmentPoint,
            newAllowedAttachmentType,
        ],
    );

    const onConnectStart = useCallback((connection: Connection) => {
        setPendingConnection(connection);
        setIsModalOpen(true);
    }, []);

    const handlePrerequisiteSelect = useCallback(
        (type: PrerequisiteLogicType) => {
            if (pendingConnection) {
                handleConnect(pendingConnection, type);
            }
            setPendingConnection(null);
            setIsModalOpen(false);
        },
        [handleConnect, pendingConnection],
    );

    const handleAddTier = useCallback(async () => {
        const newTierCount = currentTree.tierCount + 1;
        setCurrentTree((prevTree) => ({ ...prevTree, tierCount: newTierCount }));
        await updateAbilityTree(currentTree.id!, { tierCount: newTierCount });
    }, [currentTree]);

    const handleRemoveTier = useCallback(async () => {
        if (currentTree.tierCount <= 1) return;
        const newTierCount = currentTree.tierCount - 1;
        setCurrentTree((prevTree) => ({ ...prevTree, tierCount: newTierCount }));
        await updateAbilityTree(currentTree.id!, { tierCount: newTierCount });
    }, [currentTree]);

    const handleNodeClick = useCallback((node: Node | null) => {
        setSelectedNode(node);
    }, []);

    const handleDeleteAbilityFromSidebar = useCallback(
        async (abilityId: number) => {
            await handleDeleteAbility(abilityId);
            setSelectedNode(null);
        },
        [handleDeleteAbility],
    );

    // REWORKED: The handler now accepts the new viewport object.
    const handleCanvasViewportChange = useCallback((viewport: ViewportState) => {
        setCanvasViewport(viewport);
    }, []);

    return (
        <>
            <div className="ability-editor-page">
                <header className="ability-editor-page__header">
                    <div className="ability-editor-page__header-info">
                        <button onClick={onClose} className="button">
                            &larr; Back to List
                        </button>
                        <h2 className="ability-editor-page__title">Editing: {currentTree.name}</h2>
                    </div>
                </header>
                <main className="ability-editor-page__main">
                    <AbilityTreeSidebar
                        tree={currentTree}
                        name={newAbilityName}
                        onNameChange={setNewAbilityName}
                        description={newAbilityDesc}
                        onDescriptionChange={setNewAbilityDesc}
                        tier={newAbilityTier}
                        onTierChange={setNewAbilityTier}
                        iconUrl={newAbilityIconUrl}
                        onIconUrlChange={setNewAbilityIconUrl}
                        onSubmit={handleCreateAbility}
                        tierCount={currentTree.tierCount}
                        onAddTier={handleAddTier}
                        onRemoveTier={handleRemoveTier}
                        isAttachmentPoint={isAttachmentPoint}
                        onIsAttachmentPointChange={setIsAttachmentPoint}
                        allowedAttachmentType={newAllowedAttachmentType}
                        onAllowedAttachmentTypeChange={setNewAllowedAttachmentType}
                        selectedNode={selectedNode}
                        availableTrees={availableTrees.filter((t) => t.id !== currentTree.id)}
                        onAttachTree={handleAttachTree}
                        onDetachTree={handleDetachTree}
                        onUpdateAbility={handleUpdateAbility}
                        onDeleteAbility={handleDeleteAbilityFromSidebar}
                    />
                    <div className="ability-editor-page__canvas">
                        {isLoading && <p>Loading abilities...</p>}
                        {error && <p className="error-message">{error}</p>}
                        {!isLoading && !error && (
                            <ReactFlowProvider>
                                <AbilityTreeCanvas
                                    abilities={abilities}
                                    tierCount={currentTree.tierCount}
                                    onNodeDragStop={handleNodeDragStop}
                                    onConnect={onConnectStart}
                                    onDelete={handleDelete}
                                    onNodeClick={handleNodeClick}
                                    availableTrees={availableTrees}
                                    onViewportChange={handleCanvasViewportChange}
                                />
                            </ReactFlowProvider>
                        )}
                    </div>
                    {/* REWORKED: Pass both y offset and zoom to the TierBar */}
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
