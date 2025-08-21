// src/pages/AbiltyTree/AbilityTreeEditorPage.tsx
import { useState, useEffect, type FC } from 'react';
import { useWorld } from '../../context/WorldContext';
import type { AbilityTree } from '../../db/types';
import type { Connection, Node } from 'reactflow';
import { useAbilityTreeData } from '../../hooks/useAbilityTreeData';
import {
    updateAbilityTree,
    getAbilityTreesForWorld, // NEW: Import query to get all trees
} from '../../db/queries/ability.queries';
import { AbilityTreeSidebar } from '../../components/specific/AbilityTree/AbilityTreeSidebar';
import { AbilityTreeCanvas } from '../../components/specific/AbilityTree/AbilityTreeCanvas';
import {
    PrerequisiteModal,
    type PrerequisiteLogicType,
} from '../../components/specific/AbilityTree/PrerequisiteModal';

interface AbilityTreeEditorPageProps {
    tree: AbilityTree;
    onClose: () => void;
}

/**
 * REWORKED: The editor page now fetches all available trees and passes
 * the attachment handlers down to the sidebar.
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
    } = useAbilityTreeData(currentTree);

    // NEW: State to hold all available trees for the attachment dropdown
    const [availableTrees, setAvailableTrees] = useState<AbilityTree[]>([]);

    // Form state for the sidebar
    const [newAbilityName, setNewAbilityName] = useState('');
    const [newAbilityDesc, setNewAbilityDesc] = useState('');
    const [newAbilityTier, setNewAbilityTier] = useState(1);
    const [newAbilityIconUrl, setNewAbilityIconUrl] = useState('');
    const [isAttachmentPoint, setIsAttachmentPoint] = useState(false);

    // State for modals and selections
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    // Fetch abilities and all available trees when the component mounts
    useEffect(() => {
        refreshAbilities();
        const fetchAvailableTrees = async () => {
            if (selectedWorld?.id) {
                const allTrees = await getAbilityTreesForWorld(selectedWorld.id);
                // Filter out the current tree so it can't be attached to itself
                setAvailableTrees(allTrees.filter((t) => t.id !== currentTree.id));
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
        /* ... */
    };
    const handleRemoveTier = async () => {
        /* ... */
    };
    const handleNodeClick = (node: Node | null) => {
        setSelectedNode(node);
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
                    <button onClick={onClose} className="ability-editor-page__close-button">
                        &times;
                    </button>
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
                        // NEW: Pass down the new data and handlers
                        availableTrees={availableTrees}
                        onAttachTree={handleAttachTree}
                        onDetachTree={handleDetachTree}
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
                            />
                        )}
                    </div>
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
