// src/pages/AbilityTreeEditorPage.tsx
import { useState, useEffect, type FC } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import type { AbilityTree } from '../../db/types';
import { useAbilityTreeData } from '../../hooks/useAbilityTreeData';
import { AbilityTreeSidebar } from '../../components/specific/AbilityTree/AbilityTreeSidebar';
import { AbilityTreeCanvas } from '../../components/specific/AbilityTree/AbilityTreeCanvas';

// NOTE: This component is intended to be rendered by a router or view manager.
// For now, we assume it receives the `tree` to edit and an `onClose` callback.
interface AbilityTreeEditorPageProps {
    tree: AbilityTree;
    onClose: () => void;
}

/**
 * A full-screen page for editing a single Ability Tree.
 * It orchestrates the sidebar for creating abilities and the main canvas for visualization.
 */
export const AbilityTreeEditorPage: FC<AbilityTreeEditorPageProps> = ({ tree, onClose }) => {
    // The core logic and data are now managed by our custom hook.
    const {
        abilities,
        isLoading,
        error,
        refreshAbilities,
        handleAddAbility,
        handleNodeDragStop,
        handleConnect,
    } = useAbilityTreeData(tree);

    // Form state for the sidebar is managed here, in the parent component.
    const [newAbilityName, setNewAbilityName] = useState('');
    const [newAbilityDesc, setNewAbilityDesc] = useState('');
    const [newAbilityTier, setNewAbilityTier] = useState(1);
    const [newAbilityIconUrl, setNewAbilityIconUrl] = useState('');

    // When the component mounts, trigger an initial fetch of the abilities.
    useEffect(() => {
        refreshAbilities();
    }, [refreshAbilities]);

    const handleCreateAbility = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleAddAbility(newAbilityName, newAbilityDesc, newAbilityTier, newAbilityIconUrl);
        // Reset the form after submission
        setNewAbilityName('');
        setNewAbilityDesc('');
        setNewAbilityTier(1);
        setNewAbilityIconUrl('');
    };

    return (
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
                            onConnect={handleConnect}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};
