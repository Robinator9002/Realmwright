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
 * REWORKED: The editor page now manages the state for the
 * "Is Attachment Point" checkbox in the sidebar.
 */
export const AbilityTreeEditorPage: FC<AbilityTreeEditorPageProps> = ({ tree, onClose }) => {
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
    } = useAbilityTreeData(currentTree);

    // Form state for the sidebar
    const [newAbilityName, setNewAbilityName] = useState('');
    const [newAbilityDesc, setNewAbilityDesc] = useState('');
    const [newAbilityTier, setNewAbilityTier] = useState(1);
    const [newAbilityIconUrl, setNewAbilityIconUrl] = useState('');
    // NEW: State for the attachment point checkbox
    const [isAttachmentPoint, setIsAttachmentPoint] = useState(false);

    // State to manage the prerequisite modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);

    useEffect(() => {
        refreshAbilities();
    }, [refreshAbilities]);

    const handleCreateAbility = async (e: React.FormEvent) => {
        e.preventDefault();
        // We will pass `isAttachmentPoint` to the handler in the next step
        await handleAddAbility(newAbilityName, newAbilityDesc, newAbilityTier, newAbilityIconUrl);
        // Reset the form
        setNewAbilityName('');
        setNewAbilityDesc('');
        setNewAbilityTier(1);
        setNewAbilityIconUrl('');
        setIsAttachmentPoint(false); // Reset the checkbox
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
                        tierCount={currentTree.tierCount}
                        onAddTier={handleAddTier}
                        onRemoveTier={handleRemoveTier}
                        // NEW: Pass the state and setter to the sidebar
                        isAttachmentPoint={isAttachmentPoint}
                        onIsAttachmentPointChange={setIsAttachmentPoint}
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
