// src/components/specific/AbilityTree/Tree/AbilityTreeSidebar.tsx
import { useState, useEffect, type FC } from 'react';
// NEW: Import the Ability type, as it's now used in the onUpdateAbility prop.
import type { Ability, AbilityTree } from '../../../../db/types';
import type { Node } from 'reactflow';
import { AbilityTreeTierControls } from './AbilityTreeTierControls';

/**
 * The fully functional panel for managing an attachment point.
 * This component remains unchanged.
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

/**
 * REWORKED: This panel is now a fully functional form for editing the
 * properties of a selected ability.
 */
const EditAbilityPanel: FC<{
    node: Node;
    tierCount: number;
    onUpdateAbility: (abilityId: number, updates: Partial<Ability>) => void;
    onDeleteAbility: (abilityId: number) => void;
}> = ({ node, tierCount, onUpdateAbility, onDeleteAbility }) => {
    const [name, setName] = useState(node.data.label || '');
    const [description, setDescription] = useState(node.data.description || '');
    const [iconUrl, setIconUrl] = useState(node.data.iconUrl || '');
    // BUGFIX: Ensure tier is correctly sourced from the ability data, not the node itself.
    const [tier, setTier] = useState(node.data.tier || 1);

    // Repopulate form when a different node is selected.
    useEffect(() => {
        setName(node.data.label || '');
        setDescription(node.data.description || '');
        setIconUrl(node.data.iconUrl || '');
        setTier(node.data.tier || 1);
    }, [node]);

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        const abilityId = parseInt(node.id, 10);
        const updates: Partial<Ability> = {
            name,
            description,
            iconUrl,
            tier,
        };
        onUpdateAbility(abilityId, updates);
    };

    const handleDelete = () => {
        onDeleteAbility(parseInt(node.id, 10));
    };

    return (
        <div>
            <h3 className="sidebar__title">Edit Ability</h3>
            <form onSubmit={handleSaveChanges} className="form">
                <div className="form__group">
                    <label htmlFor="abilityNameEdit" className="form__label">
                        Ability Name
                    </label>
                    <input
                        id="abilityNameEdit"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form__input"
                        required
                    />
                </div>
                <div className="form__group">
                    <label htmlFor="abilityDescEdit" className="form__label">
                        Description
                    </label>
                    <textarea
                        id="abilityDescEdit"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="form__textarea"
                        rows={3}
                    />
                </div>
                <div className="form__group">
                    <label htmlFor="abilityIconEdit" className="form__label">
                        Icon URL (Optional)
                    </label>
                    <input
                        id="abilityIconEdit"
                        value={iconUrl}
                        onChange={(e) => setIconUrl(e.target.value)}
                        className="form__input"
                    />
                </div>
                <div className="form__group">
                    <label htmlFor="abilityTierEdit" className="form__label">
                        Tier
                    </label>
                    <select
                        id="abilityTierEdit"
                        value={tier}
                        onChange={(e) => setTier(parseInt(e.target.value, 10))}
                        className="form__select"
                    >
                        {Array.from({ length: tierCount }, (_, i) => i + 1).map((tierNum) => (
                            <option key={tierNum} value={tierNum}>
                                Tier {tierNum}
                            </option>
                        ))}
                    </select>
                </div>
                {/* NOTE: The ability to change an ability TO a socket is removed from the edit panel
                    for simplicity. This should be a creation-time decision. Sockets can be edited
                    in their own dedicated 'ManageAttachmentPanel'. */}
                <div className="form__footer">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="button button--danger mr-auto"
                    >
                        Delete
                    </button>
                    <button type="submit" className="button button--primary">
                        Save Changes
                    </button>
                </div>
            </form>
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
    onUpdateAbility: (abilityId: number, updates: Partial<Ability>) => void;
    onDeleteAbility: (abilityId: number) => void;
}

/**
 * REWORKED: The sidebar now passes the necessary props for updating and deleting
 * abilities down to the newly implemented EditAbilityPanel.
 */
export const AbilityTreeSidebar: FC<AbilityTreeSidebarProps> = (props) => {
    const { selectedNode, availableTrees, onAttachTree, onDetachTree } = props;

    const renderPanel = () => {
        if (!selectedNode) {
            return <CreateAbilityPanel {...props} />;
        }
        // NOTE: The order here is important. Attachment nodes are a special type of ability node.
        // We check for the more specific 'attachmentNode' type first.
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
            return (
                <EditAbilityPanel
                    node={selectedNode}
                    tierCount={props.tierCount}
                    onUpdateAbility={props.onUpdateAbility}
                    onDeleteAbility={props.onDeleteAbility}
                />
            );
        }
        return null; // Should not happen if nodes have types
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
