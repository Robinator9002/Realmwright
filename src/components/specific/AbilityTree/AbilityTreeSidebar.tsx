// src/components/specific/AbilityTree/AbilityTreeSidebar.tsx
import { useState, useEffect, type FC } from 'react';
import type { AbilityTree } from '../../../db/types';
import type { Node } from 'reactflow';
import { AbilityTreeTierControls } from './AbilityTreeTierControls';

/**
 * The fully functional panel for managing an attachment point.
 */
const ManageAttachmentPanel: FC<{
    node: Node;
    availableTrees: AbilityTree[];
    onAttachTree: (abilityId: number, treeToAttachId: number) => void;
    onDetachTree: (abilityId: number) => void;
}> = ({ node, availableTrees, onAttachTree, onDetachTree }) => {
    const [selectedTreeId, setSelectedTreeId] = useState<string>('');
    const attachedTreeId = node.data.attachmentPoint?.attachedTreeId;
    const attachedTree = attachedTreeId
        ? availableTrees.find((t) => t.id === attachedTreeId)
        : null;

    useEffect(() => {
        // Reset dropdown when a new node is selected
        setSelectedTreeId('');
    }, [node.id]);

    const handleAttach = () => {
        if (selectedTreeId) {
            onAttachTree(parseInt(node.id, 10), parseInt(selectedTreeId, 10));
        }
    };

    const handleDetach = () => {
        onDetachTree(parseInt(node.id, 10));
    };

    return (
        <div>
            <h3 className="sidebar__title">Manage Socket</h3>
            <div className="panel__item-details">
                <h4 className="panel__item-title">{node.data.label}</h4>
                <p className="panel__item-description">
                    Attach an existing Ability Tree to this socket.
                </p>
            </div>

            {attachedTree ? (
                <div className="form__group">
                    <p className="form__label">Currently Attached:</p>
                    <div className="attachment-display">
                        <span className="attachment-display__name">{attachedTree.name}</span>
                        <button onClick={handleDetach} className="button button--danger button--sm">
                            Detach
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="form__group">
                        <label htmlFor="attach-tree-select" className="form__label">
                            Available Trees
                        </label>
                        <select
                            id="attach-tree-select"
                            value={selectedTreeId}
                            onChange={(e) => setSelectedTreeId(e.target.value)}
                            className="form__select"
                        >
                            <option value="" disabled>
                                Select a tree to attach...
                            </option>
                            {availableTrees.map((tree) => (
                                <option key={tree.id} value={tree.id}>
                                    {tree.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleAttach}
                        disabled={!selectedTreeId}
                        className="button button--primary button--full-width"
                    >
                        Attach Selected Tree
                    </button>
                </>
            )}
        </div>
    );
};

const EditAbilityPanel: FC<{ node: Node }> = ({ node }) => {
    return (
        <div>
            <h3 className="sidebar__title">Edit Ability</h3>
            <div className="panel__item-details">
                <h4 className="panel__item-title">{node.data.label}</h4>
            </div>
        </div>
    );
};

const CreateAbilityPanel: FC<any> = (props) => {
    return (
        <div>
            <h3 className="sidebar__title">Create New Ability</h3>
            <form onSubmit={props.onSubmit} className="form">
                <div className="form__group">
                    <label htmlFor="abilityName" className="form__label">
                        Ability Name
                    </label>
                    <input
                        id="abilityName"
                        value={props.name}
                        onChange={(e) => props.onNameChange(e.target.value)}
                        placeholder="e.g., Fireball or Weapon Socket"
                        className="form__input"
                        required
                    />
                </div>
                <div className="form__group">
                    <label htmlFor="abilityDesc" className="form__label">
                        Description
                    </label>
                    <textarea
                        id="abilityDesc"
                        value={props.description}
                        onChange={(e) => props.onDescriptionChange(e.target.value)}
                        placeholder="A short description of the ability or socket."
                        className="form__textarea"
                        rows={3}
                    />
                </div>
                <div className="form__group">
                    <label htmlFor="abilityIcon" className="form__label">
                        Icon URL (Optional)
                    </label>
                    <input
                        id="abilityIcon"
                        value={props.iconUrl}
                        onChange={(e) => props.onIconUrlChange(e.target.value)}
                        placeholder="https://example.com/icon.png"
                        className="form__input"
                    />
                </div>
                <div className="form__group">
                    <label htmlFor="abilityTier" className="form__label">
                        Tier
                    </label>
                    <select
                        id="abilityTier"
                        value={props.tier}
                        onChange={(e) => props.onTierChange(parseInt(e.target.value, 10))}
                        className="form__select"
                    >
                        {Array.from({ length: props.tierCount }, (_, i) => i + 1).map((tierNum) => (
                            <option key={tierNum} value={tierNum}>
                                Tier {tierNum}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form__group form__group--checkbox">
                    <input
                        id="isAttachmentPoint"
                        type="checkbox"
                        checked={props.isAttachmentPoint}
                        onChange={(e) => props.onIsAttachmentPointChange(e.target.checked)}
                        className="form__checkbox"
                    />
                    <label htmlFor="isAttachmentPoint" className="form__label--checkbox">
                        Is Attachment Point (Socket)
                    </label>
                </div>
                <button type="submit" className="button button--primary button--full-width">
                    Create
                </button>
            </form>
        </div>
    );
};

interface AbilityTreeSidebarProps {
    tree: AbilityTree;
    name: string;
    onNameChange: (value: string) => void;
    description: string;
    onDescriptionChange: (value: string) => void;
    tier: number;
    onTierChange: (value: number) => void;
    iconUrl: string;
    onIconUrlChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    tierCount: number;
    onAddTier: () => void;
    onRemoveTier: () => void;
    isAttachmentPoint: boolean;
    onIsAttachmentPointChange: (value: boolean) => void;
    selectedNode: Node | null;
    availableTrees: AbilityTree[];
    onAttachTree: (abilityId: number, treeToAttachId: number) => void;
    onDetachTree: (abilityId: number) => void;
}

/**
 * REWORKED: The sidebar is now fully featured, with a functional
 * panel for managing attachments.
 */
export const AbilityTreeSidebar: FC<AbilityTreeSidebarProps> = (props) => {
    const { selectedNode, availableTrees, onAttachTree, onDetachTree } = props;

    const renderPanel = () => {
        if (!selectedNode) {
            return <CreateAbilityPanel {...props} />;
        }
        if (selectedNode.type === 'attachmentNode') {
            return (
                <ManageAttachmentPanel
                    node={selectedNode}
                    availableTrees={availableTrees}
                    onAttachTree={onAttachTree}
                    onDetachTree={onDetachTree}
                />
            );
        }
        if (selectedNode.type === 'abilityNode') {
            return <EditAbilityPanel node={selectedNode} />;
        }
        return null;
    };

    return (
        <aside className="ability-editor-page__sidebar">
            {renderPanel()}
            <AbilityTreeTierControls
                tierCount={props.tierCount}
                onAddTier={props.onAddTier}
                onRemoveTier={props.onRemoveTier}
            />
        </aside>
    );
};
