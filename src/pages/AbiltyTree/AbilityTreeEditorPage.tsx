// src/pages/AbiltyTree/AbilityTreeEditorPage.tsx
import { useState, useEffect, type FC } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import type { AbilityTree } from '../../db/types';
import type { Connection } from 'reactflow';
import { useAbilityTreeData } from '../../hooks/useAbilityTreeData';
import { AbilityTreeSidebar } from '../../components/specific/AbilityTree/AbilityTreeSidebar';
import { AbilityTreeCanvas } from '../../components/specific/AbilityTree/AbilityTreeCanvas';
// NEW: Import the modal and its logic type
import {
    PrerequisiteModal,
    type PrerequisiteLogicType,
} from '../../components/specific/AbilityTree/PrerequisiteModal';

interface AbilityTreeEditorPageProps {
    tree: AbilityTree;
    onClose: () => void;
}

/**
 * REWORKED: The full-screen editor page now manages the prerequisite selection modal.
 */
export const AbilityTreeEditorPage: FC<AbilityTreeEditorPageProps> = ({ tree, onClose }) => {
    const {
        abilities,
        isLoading,
        error,
        refreshAbilities,
        handleAddAbility,
        handleNodeDragStop,
        handleConnect, // We will call this from our new handler
    } = useAbilityTreeData(tree);

    // Form state for the sidebar
    const [newAbilityName, setNewAbilityName] = useState('');
    const [newAbilityDesc, setNewAbilityDesc] = useState('');
    const [newAbilityTier, setNewAbilityTier] = useState(1);
    const [newAbilityIconUrl, setNewAbilityIconUrl] = useState('');

    // NEW: State to manage the prerequisite modal
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

    /**
     * NEW: This function is called when the user completes a connection on the canvas.
     * It captures the connection details and opens the modal for the user to select the logic.
     */
    const onConnectStart = (connection: Connection) => {
        setPendingConnection(connection);
        setIsModalOpen(true);
    };

    /**
     * NEW: This function is called when the user selects a logic type from the modal.
     * It then calls the final `handleConnect` function from our hook with all the necessary data.
     */
    const handlePrerequisiteSelect = (type: PrerequisiteLogicType) => {
        if (pendingConnection) {
            // We pass the connection and the selected logic type to the hook
            handleConnect(pendingConnection, type);
        }
        // Clean up state
        setPendingConnection(null);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="ability-editor-page">
                <header className="ability-editor-page__header">
                    <div className="ability-editor-page__header-info">
                        <button onClick={onClose} className="button">
                            <ArrowLeft size={16} /> Back to List
                        </button>
                        <h2 className="ability-editor-page__title">Editing: {tree.name}</h2>
                    </div>
                    <button onClick={onClose} className="ability-editor-page__close-button">
                        <X size={24} />
                    </button>
                </header>
                <main className="ability-editor-page__main">
                    <AbilityTreeSidebar
                        tree={tree}
                        name={newAbilityName}
                        onNameChange={setNewAbilityName}
                        description={newAbilityDesc}
                        onDescriptionChange={setNewAbilityDesc}
                        tier={newAbilityTier}
                        onTierChange={setNewAbilityTier}
                        iconUrl={newAbilityIconUrl}
                        onIconUrlChange={setNewAbilityIconUrl}
                        onSubmit={handleCreateAbility}
                    />
                    <div className="ability-editor-page__canvas">
                        {isLoading && <p>Loading abilities...</p>}
                        {error && <p className="error-message">{error}</p>}
                        {!isLoading && !error && (
                            <AbilityTreeCanvas
                                abilities={abilities}
                                tierCount={tree.tierCount}
                                onNodeDragStop={handleNodeDragStop}
                                onConnect={onConnectStart} // REWORK: Pass the new handler
                            />
                        )}
                    </div>
                </main>
            </div>

            {/* NEW: Render the modal conditionally */}
            <PrerequisiteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handlePrerequisiteSelect}
            />
        </>
    );
};
