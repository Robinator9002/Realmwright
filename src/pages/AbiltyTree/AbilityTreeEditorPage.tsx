// src/pages/AbiltyTree/AbilityTreeEditorPage.tsx
import { useState, useEffect, type FC } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import type { AbilityTree } from '../../db/types';
import type { Connection } from 'reactflow';
import { useAbilityTreeData } from '../../hooks/useAbilityTreeData';
import { updateAbilityTree } from '../../db/queries/ability.queries';
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
 * REWORKED: The editor page now manages the state of the tree itself,
 * including the tier count, and passes the necessary handlers to the sidebar.
 */
export const AbilityTreeEditorPage: FC<AbilityTreeEditorPageProps> = ({ tree, onClose }) => {
    // NEW: The tree passed via props is the initial state. We hold the mutable,
    // "live" version of the tree in this component's state.
    const [currentTree, setCurrentTree] = useState<AbilityTree>(tree);

    const {
        abilities,
        isLoading,
        error,
        refreshAbilities,
        handleAddAbility,
        handleNodeDragStop,
        handleConnect,
    } = useAbilityTreeData(currentTree); // Pass the state version to the hook

    // Form state for the sidebar
    const [newAbilityName, setNewAbilityName] = useState('');
    const [newAbilityDesc, setNewAbilityDesc] = useState('');
    const [newAbilityTier, setNewAbilityTier] = useState(1);
    const [newAbilityIconUrl, setNewAbilityIconUrl] = useState('');

    // State to manage the prerequisite modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);

    useEffect(() => {
        refreshAbilities();
    }, [refreshAbilities]);

    const handleCreateAbility = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleAddAbility(newAbilityName, newAbilityDesc, newAbilityTier, newAbilityIconUrl);
        setNewAbilityName('');
        setNewAbilityDesc('');
        setNewAbilityTier(1);
        setNewAbilityIconUrl('');
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

    /**
     * NEW: Handles the logic for adding a new tier to the tree.
     */
    const handleAddTier = async () => {
        const newTierCount = currentTree.tierCount + 1;
        // Optimistically update the UI
        setCurrentTree({ ...currentTree, tierCount: newTierCount });
        // Persist the change to the database
        await updateAbilityTree(currentTree.id!, { tierCount: newTierCount });
    };

    /**
     * NEW: Handles the logic for removing the last tier from the tree.
     */
    const handleRemoveTier = async () => {
        if (currentTree.tierCount <= 1) return; // Safety check
        const newTierCount = currentTree.tierCount - 1;
        setCurrentTree({ ...currentTree, tierCount: newTierCount });
        await updateAbilityTree(currentTree.id!, { tierCount: newTierCount });
        // Note: We might want to add logic here to handle abilities in the removed tier.
        // For now, they will remain but may be inaccessible in the UI.
    };

    return (
        <>
            <div className="ability-editor-page">
                <header className="ability-editor-page__header">
                    <div className="ability-editor-page__header-info">
                        <button onClick={onClose} className="button">
                            <ArrowLeft size={16} /> Back to List
                        </button>
                        <h2 className="ability-editor-page__title">Editing: {currentTree.name}</h2>
                    </div>
                    <button onClick={onClose} className="ability-editor-page__close-button">
                        <X size={24} />
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
                        // NEW: Pass the state and handlers to the sidebar
                        tierCount={currentTree.tierCount}
                        onAddTier={handleAddTier}
                        onRemoveTier={handleRemoveTier}
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
