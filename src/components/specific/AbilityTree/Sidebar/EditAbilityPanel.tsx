// src/components/specific/AbilityTree/Sidebar/EditAbilityPanel.tsx

/**
 * COMMIT: feat(ability-tree): create isolated EditAbilityPanel component
 *
 * This commit adds the `EditAbilityPanel`, the component responsible for
 * modifying a selected ability node.
 *
 * Rationale:
 * Following the modular design pattern, this component extracts all logic
 * related to editing from the old sidebar. It is now a self-contained unit
 * that activates when a node is selected on the canvas.
 *
 * Implementation Details:
 * - It consumes `useAbilityTreeEditor` to get the `selectedNode` and the
 * `handleUpdateAbility` and `handleDeleteAbility` functions.
 * - A `useEffect` hook is used to synchronize the component's local form state
 * with the data from the `selectedNode` whenever the selection changes. This
 * ensures the form is always displaying the correct information.
 * - It uses the `useModal` context to show a confirmation dialog before
 * deleting an ability, a critical UX feature for destructive actions.
 * - Like the Create panel, it is now completely decoupled and relies on the
 * context for its operations, requiring no props.
 */
import { useState, useEffect, type FC } from 'react';
import { useAbilityTreeEditor } from '../../../../context/AbilityTreeEditorContext';
import { useModal } from '../../../../context/ModalContext';
import type { Ability } from '../../../../db/types';

export const EditAbilityPanel: FC = () => {
    // Consume both our custom editor context and the app-wide modal context.
    const { selectedNode, tree, handleUpdateAbility, handleDeleteAbility, setSelectedNode } =
        useAbilityTreeEditor();
    const { showModal } = useModal();

    // Local state for the form fields.
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [iconUrl, setIconUrl] = useState('');
    const [tier, setTier] = useState(1);
    const [allowedAttachmentType, setAllowedAttachmentType] = useState('');

    // This effect synchronizes the form state with the selected node.
    // It runs whenever `selectedNode` changes.
    useEffect(() => {
        if (selectedNode?.data) {
            setName(selectedNode.data.label || '');
            setDescription(selectedNode.data.description || '');
            setIconUrl(selectedNode.data.iconUrl || '');
            setTier(selectedNode.data.tier || 1);
            setAllowedAttachmentType(
                selectedNode.data.attachmentPoint?.allowedAttachmentType || '',
            );
        }
    }, [selectedNode]);

    // If no node is selected, this panel should not be rendered.
    // This is a safeguard, as the parent sidebar should handle this logic.
    if (!selectedNode) {
        return null;
    }

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        const abilityId = parseInt(selectedNode.id, 10);
        const updates: Partial<Ability> = { name, description, iconUrl, tier };

        // If the node is an attachment point, include its specific data in the update.
        if (selectedNode.data.attachmentPoint) {
            updates.attachmentPoint = {
                ...selectedNode.data.attachmentPoint,
                allowedAttachmentType: allowedAttachmentType.trim() || undefined,
            };
        }

        handleUpdateAbility(abilityId, updates);
    };

    const handleDelete = () => {
        showModal('confirmation', {
            title: 'Delete Ability?',
            message: `This will permanently delete the "${selectedNode.data.label}" ability and all its connections. This action cannot be undone.`,
            onConfirm: async () => {
                await handleDeleteAbility(parseInt(selectedNode.id, 10));
                // After deletion, clear the selection.
                setSelectedNode(null);
            },
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
                        {Array.from({ length: tree.tierCount }, (_, i) => i + 1).map((tierNum) => (
                            <option key={tierNum} value={tierNum}>
                                Tier {tierNum}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Conditionally render this section only for attachment point nodes */}
                {selectedNode.data.attachmentPoint && (
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
