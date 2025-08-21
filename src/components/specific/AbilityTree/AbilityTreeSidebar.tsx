// src/components/specific/AbilityTree/AbilityTreeSidebar.tsx
import type { FC } from 'react';
import type { AbilityTree } from '../../../db/types';
// NEW: Import the Node type from reactflow
import type { Node } from 'reactflow';
import { AbilityTreeTierControls } from './AbilityTreeTierControls';

// NEW: A placeholder component for the attachment management UI
const ManageAttachmentPanel: FC<{ node: Node }> = ({ node }) => {
    return (
        <div>
            <h3 className="sidebar__title">Manage Socket</h3>
            <div className="panel__item-details">
                <h4 className="panel__item-title">{node.data.label}</h4>
                <p className="panel__item-description">
                    Attach an existing Ability Tree to this socket.
                </p>
            </div>
            {/* We will build the dropdown and attach/detach buttons here next */}
        </div>
    );
};

// NEW: A placeholder for a future "Edit Ability" panel
const EditAbilityPanel: FC<{ node: Node }> = ({ node }) => {
    return (
        <div>
            <h3 className="sidebar__title">Edit Ability</h3>
            <div className="panel__item-details">
                <h4 className="panel__item-title">{node.data.label}</h4>
            </div>
            {/* Edit form would go here */}
        </div>
    );
};

const CreateAbilityPanel: FC<any> = ({
    name,
    onNameChange,
    description,
    onDescriptionChange,
    tier,
    onTierChange,
    iconUrl,
    onIconUrlChange,
    isAttachmentPoint,
    onIsAttachmentPointChange,
    onSubmit,
    tierCount,
}) => {
    return (
        <div>
            <h3 className="sidebar__title">Create New Ability</h3>
            <form onSubmit={onSubmit} className="form">
                <div className="form__group">
                    <label htmlFor="abilityName" className="form__label">
                        Ability Name
                    </label>
                    <input
                        id="abilityName"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
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
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
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
                        value={iconUrl}
                        onChange={(e) => onIconUrlChange(e.target.value)}
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
                        value={tier}
                        onChange={(e) => onTierChange(parseInt(e.target.value, 10))}
                        className="form__select"
                    >
                        {Array.from({ length: tierCount }, (_, i) => i + 1).map((tierNum) => (
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
                        checked={isAttachmentPoint}
                        onChange={(e) => onIsAttachmentPointChange(e.target.checked)}
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
    // NEW: Add selectedNode to the props interface
    selectedNode: Node | null;
}

/**
 * REWORKED: The sidebar is now context-aware. It displays different panels
 * based on whether a node is selected, and what type of node it is.
 */
export const AbilityTreeSidebar: FC<AbilityTreeSidebarProps> = (props) => {
    const { selectedNode } = props;

    const renderPanel = () => {
        if (!selectedNode) {
            return <CreateAbilityPanel {...props} />;
        }
        if (selectedNode.type === 'attachmentNode') {
            return <ManageAttachmentPanel node={selectedNode} />;
        }
        if (selectedNode.type === 'abilityNode') {
            return <EditAbilityPanel node={selectedNode} />;
        }
        return null; // Should not happen
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
