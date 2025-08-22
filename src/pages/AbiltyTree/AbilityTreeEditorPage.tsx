// src/pages/AbiltyTree/AbilityTreeEditorPage.tsx
import { useState, useEffect, type FC, useCallback } from 'react'; // Import useCallback
import { useWorld } from '../../context/WorldContext';
import type { AbilityTree } from '../../db/types';
import type { Connection, Node } from 'reactflow';
import { useAbilityTreeData } from '../../hooks/useAbilityTreeData';
import { updateAbilityTree, getAbilityTreesForWorld } from '../../db/queries/ability.queries';
import { AbilityTreeSidebar } from '../../components/specific/AbilityTree/Tree/AbilityTreeSidebar';
import { AbilityTreeCanvas } from '../../components/specific/AbilityTree/Tree/AbilityTreeCanvas';
// RE-IMPORTED: The TierBar is now part of the layout again.
import { TierBar } from '../../components/specific/AbilityTree/Sidebar/TierBar';
import {
    PrerequisiteModal,
    type PrerequisiteLogicType,
} from '../../components/specific/AbilityTree/Sidebar/PrerequisiteModal';

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
    // NEW: State to store the canvas viewport's Y position
    const [canvasViewportY, setCanvasViewportY] = useState(0);

    useEffect(() => {
        refreshAbilities();
        const fetchAvailableTrees = async () => {
            if (selectedWorld?.id) {
                const allTrees = await getAbilityTreesForWorld(selectedWorld.id);
                setAvailableTrees(allTrees);
            }
        };
        fetchAvailableTrees();
    }, [refreshAbilities, selectedWorld, currentTree.id]);

    const handleCreateAbility = async (e: React.FormEvent) => {
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
    };

    const onConnectStart = (connection: Connection) => {
        setPendingConnection(connection);
        setIsModalOpen(true);
    };

    const handlePrerequisiteSelect = (type: PrerequisiteLogicType) => {
        if (pendingConnection) {
            handleConnect(pendingConnection, type);
        }
        setPendingConnection(null);
        setIsModalOpen(false);
    };

    const handleAddTier = async () => {
        const newTierCount = currentTree.tierCount + 1;
        setCurrentTree({ ...currentTree, tierCount: newTierCount });
        await updateAbilityTree(currentTree.id!, { tierCount: newTierCount });
    };

    const handleRemoveTier = async () => {
        if (currentTree.tierCount <= 1) return;
        const newTierCount = currentTree.tierCount - 1;
        setCurrentTree({ ...currentTree, tierCount: newTierCount });
        await updateAbilityTree(currentTree.id!, { tierCount: newTierCount });
    };

    const handleNodeClick = (node: Node | null) => {
        setSelectedNode(node);
    };

    const handleDeleteAbilityFromSidebar = async (abilityId: number) => {
        await handleDeleteAbility(abilityId);
        setSelectedNode(null);
    };

    // NEW: Callback to update the canvasViewportY state
    const handleCanvasViewportChange = useCallback((viewportY: number) => {
        setCanvasViewportY(viewportY);
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
                        )}
                    </div>
                    {/* RE-ADDED: The TierBar is now rendered alongside the canvas. */}
                    <TierBar tierCount={currentTree.tierCount} viewportYOffset={canvasViewportY} /> {/* NEW: Pass viewport Y offset */}
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
