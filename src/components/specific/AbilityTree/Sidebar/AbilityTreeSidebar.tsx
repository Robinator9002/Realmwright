// src/components/specific/AbilityTree/Tree/AbilityTreeSidebar.tsx
import { useState, useEffect, type FC, useMemo } from 'react';
import type { Ability, AbilityTree } from '../../../../db/types';
import type { Node } from 'reactflow';
import { Trash2 } from 'lucide-react'; // Import an icon for the delete button
import { AbilityTreeTierControls } from '../Tree/AbilityTreeTierControls';
import { useModal } from '../../../../context/ModalContext'; // NEW: Import useModal hook
import { TIER_HEIGHT, NODE_HEIGHT } from '../../../../constants/abilityTree.constants'; // Import constants for tier calculation

/**
 * REWORKED: The panel has been completely redesigned for clarity and
 * now includes a "Danger Zone" with a button to delete the socket.
 * REFINED: Includes confirmation modals for detach and delete actions.
 * AESTHETIC REWORK: Improved visual consistency with other sidebar panels.
 */
const ManageAttachmentPanel: FC<{
    node: Node;
    availableTrees: AbilityTree[];
    onAttachTree: (abilityId: number, treeToAttachId: number) => void;
    onDetachTree: (abilityId: number) => void;
    onDeleteAbility: (abilityId: number) => void;
}> = ({ node, availableTrees, onAttachTree, onDetachTree, onDeleteAbility }) => {
    const { showModal } = useModal(); // NEW: Use the modal context
    const [selectedTreeId, setSelectedTreeId] = useState<string>('');
    const attachedTreeId = node.data.attachmentPoint?.attachedTreeId;
    const attachedTree = attachedTreeId
        ? availableTrees.find((t) => t.id === attachedTreeId)
        : null;

    const compatibleTrees = useMemo(() => {
        const requiredType = node.data.attachmentPoint?.allowedAttachmentType;
        if (!requiredType) {
            return availableTrees;
        }
        return availableTrees.filter((tree) => tree.attachmentType === requiredType);
    }, [availableTrees, node.data.attachmentPoint]);

    useEffect(() => {
        setSelectedTreeId('');
    }, [node.id]);

    const handleAttach = () => {
        if (selectedTreeId) {
            onAttachTree(parseInt(node.id, 10), parseInt(selectedTreeId, 10));
        }
    };

    const handleDetach = () => {
        showModal('confirmation', {
            title: 'Detach Tree?',
            message: `Are you sure you want to detach "${
                attachedTree?.name || 'this tree'
            }" from this socket?`,
            onConfirm: () => onDetachTree(parseInt(node.id, 10)),
        });
    };

    const handleDelete = () => {
        showModal('confirmation', {
            title: 'Delete Attachment Socket?',
            message: `This will permanently delete the "${node.data.label}" socket. This action cannot be undone.`,
            onConfirm: () => onDeleteAbility(parseInt(node.id, 10)),
        });
    };

    return (
        <div className="sidebar-panel">
            <h3 className="sidebar__title">Manage Socket</h3>

            <div className="sidebar-panel__section">
                <div className="form__group">
                    {' '}
                    {/* Consistent form group for title/meta */}
                    <h4 className="panel__item-title">{node.data.label}</h4>
                    {node.data.description && ( // Show description if available
                        <p className="panel__item-description">{node.data.description}</p>
                    )}
                    {node.data.attachmentPoint?.allowedAttachmentType && (
                        <p className="panel__item-meta">
                            Requires Type:{' '}
                            <strong>{node.data.attachmentPoint.allowedAttachmentType}</strong>
                        </p>
                    )}
                </div>
            </div>

            <div className="sidebar-panel__section">
                {attachedTree ? (
                    <div className="form__group">
                        <label className="form__label">Currently Attached</label>{' '}
                        {/* Use form__label for consistency */}
                        <div className="attachment-display">
                            <span className="attachment-display__name">{attachedTree.name}</span>
                            <button
                                onClick={handleDetach}
                                className="button button--danger button--sm"
                            >
                                Detach
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="form__group">
                            <label htmlFor="attach-tree-select" className="form__label">
                                Attach a Tree
                            </label>
                            <select
                                id="attach-tree-select"
                                value={selectedTreeId}
                                onChange={(e) => setSelectedTreeId(e.target.value)}
                                className="form__select"
                                disabled={compatibleTrees.length === 0}
                            >
                                <option value="" disabled>
                                    {compatibleTrees.length > 0
                                        ? 'Select a compatible tree...'
                                        : 'No compatible trees found.'}
                                </option>
                                {compatibleTrees.map((tree) => (
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

            {/* Danger Zone for deleting the socket itself */}
            <div className="sidebar-panel__section danger-zone">
                <h4 className="danger-zone__title">Danger Zone</h4>
                <button onClick={handleDelete} className="button button--danger button--full-width">
                    <Trash2 size={16} /> Delete Socket
                </button>
            </div>
        </div>
    );
};

// --- EditAbilityPanel ---
/**
 * REFINED: When the tier is changed, the y-position is now correctly calculated.
 * REFINED: Includes a confirmation modal for deleting an ability.
 */
const EditAbilityPanel: FC<{
    node: Node;
    tierCount: number;
    onUpdateAbility: (abilityId: number, updates: Partial<Ability>) => void;
    onDeleteAbility: (abilityId: number) => void;
}> = ({ node, tierCount, onUpdateAbility, onDeleteAbility }) => {
    const { showModal } = useModal(); // NEW: Use the modal context
    const [name, setName] = useState(node.data.label || '');
    const [description, setDescription] = useState(node.data.description || '');
    const [iconUrl, setIconUrl] = useState(node.data.iconUrl || '');
    const [tier, setTier] = useState(node.data.tier || 1);
    const [allowedAttachmentType, setAllowedAttachmentType] = useState(
        node.data.attachmentPoint?.allowedAttachmentType || '',
    );

    useEffect(() => {
        setName(node.data.label || '');
        setDescription(node.data.description || '');
        setIconUrl(node.data.iconUrl || '');
        setTier(node.data.tier || 1);
        setAllowedAttachmentType(node.data.attachmentPoint?.allowedAttachmentType || '');
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

        if (node.data.attachmentPoint) {
            updates.attachmentPoint = {
                ...node.data.attachmentPoint,
                allowedAttachmentType: allowedAttachmentType.trim() || undefined,
            };
        }
        // The y position calculation is now handled within useAbilityTreeData.ts
        // when `updates.tier` is present.

        onUpdateAbility(abilityId, updates);
    };

    const handleDelete = () => {
        showModal('confirmation', {
            title: 'Delete Ability?',
            message: `This will permanently delete the "${node.data.label}" ability and all its connections. This action cannot be undone.`,
            onConfirm: () => onDeleteAbility(parseInt(node.id, 10)),
        });
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

                {node.data.attachmentPoint && (
                    <div className="form__group">
                        <label htmlFor="allowedTypeEdit" className="form__label">
                            Allowed Attachment Type
                        </label>
                        <input
                            id="allowedTypeEdit"
                            value={allowedAttachmentType}
                            onChange={(e) => setAllowedAttachmentType(e.target.value)}
                            className="form__input"
                            placeholder="e.g., Weapon Mod (leave blank for any)"
                        />
                    </div>
                )}

                <div className="form__footer">
                    <button
                        type="button"
                        onClick={handleDelete} // Now triggers confirmation modal
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
    // Re-calculating yPos here for consistency, but its value is largely handled in handleAddAbility
    const currentYPos = TIER_HEIGHT * props.tier - TIER_HEIGHT / 2 - NODE_HEIGHT / 2;

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

                {props.isAttachmentPoint && (
                    <div className="form__group">
                        <label htmlFor="allowedType" className="form__label">
                            Allowed Attachment Type
                        </label>
                        <input
                            id="allowedType"
                            value={props.allowedAttachmentType}
                            onChange={(e) => props.onAllowedAttachmentTypeChange(e.target.value)}
                            className="form__input"
                            placeholder="e.g., Weapon Mod (leave blank for any)"
                        />
                    </div>
                )}

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
    allowedAttachmentType: string;
    onAllowedAttachmentTypeChange: (value: string) => void;
    selectedNode: Node | null;
    availableTrees: AbilityTree[];
    onAttachTree: (abilityId: number, treeToAttachId: number) => void;
    onDetachTree: (abilityId: number) => void;
    onUpdateAbility: (abilityId: number, updates: Partial<Ability>) => void;
    onDeleteAbility: (abilityId: number) => void;
}

export const AbilityTreeSidebar: FC<AbilityTreeSidebarProps> = (props) => {
    const { selectedNode, availableTrees, onAttachTree, onDetachTree, onDeleteAbility } = props;

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
                    onDeleteAbility={onDeleteAbility}
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
        return null;
    };

    return (
        <aside className="ability-editor-page__sidebar">
            <div className="sidebar__main-content">{renderPanel()}</div>
            <AbilityTreeTierControls
                tierCount={props.tierCount}
                onAddTier={props.onAddTier}
                onRemoveTier={props.onRemoveTier}
            />
        </aside>
    );
};
