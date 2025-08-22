// src/pages/AbiltyTree/AbilityTreeEditorPage.tsx
import { useState, useEffect, type FC } from 'react';
import { useWorld } from '../../context/WorldContext';
import type { Ability, AbilityTree } from '../../db/types';
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

interface AbilityTreeEditorPageProps {
    tree: AbilityTree;
    onClose: () => void;
}

/**
 * REWORKED: The page now gets the update and delete handlers from the
 * useAbilityTreeData hook and passes them down into the sidebar component.
 */
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
        // NEW: Destructure the new handlers from the hook.
        handleUpdateAbility,
        handleDeleteAbility,
    } = useAbilityTreeData(currentTree);

    const [availableTrees, setAvailableTrees] = useState<AbilityTree[]>([]);
    const [newAbilityName, setNewAbilityName] = useState('');
    const [newAbilityDesc, setNewAbilityDesc] = useState('');
    const [newAbilityTier, setNewAbilityTier] = useState(1);
    const [newAbilityIconUrl, setNewAbilityIconUrl] = useState('');
    const [isAttachmentPoint, setIsAttachmentPoint] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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
        );
        setNewAbilityName('');
        setNewAbilityDesc('');
        setNewAbilityTier(1);
        setNewAbilityIconUrl('');
        setIsAttachmentPoint(false);
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

    /**
     * NEW: A wrapper around the delete handler that also clears the
     * selected node from state, preventing the UI from trying to render
     * an edit panel for a node that no longer exists.
     */
    const handleDeleteAbilityFromSidebar = async (abilityId: number) => {
        await handleDeleteAbility(abilityId);
        setSelectedNode(null); // Deselect the node after deletion
    };

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
                        selectedNode={selectedNode}
                        availableTrees={availableTrees.filter((t) => t.id !== currentTree.id)}
                        onAttachTree={handleAttachTree}
                        onDetachTree={handleDetachTree}
                        // NEW: Pass the handlers down to the sidebar as props.
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
                            />
                        )}
                    </div>
                    <TierBar tierCount={currentTree.tierCount} />
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
