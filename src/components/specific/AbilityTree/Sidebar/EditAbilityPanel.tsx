// src/components/specific/AbilityTree/Sidebar/EditAbilityPanel.tsx

/**
 * COMMIT: fix(ability-tree): use correct 'currentTree' property in EditAbilityPanel
 *
 * This commit resolves a runtime crash when selecting a node to edit.
 *
 * Rationale:
 * The context refactor renamed the `tree` property in the editor context to
 * `currentTree` for better clarity. This component was not updated to reflect
 * that change, causing a crash when it
 * tried to access `tree.tierCount` to render the tier dropdown.
 *
 * Implementation Details:
 * - The destructuring from the `useAbilityTreeEditor` hook has been updated to
 * use `currentTree` instead of the non-existent `tree` variable.
 * - This resolves the crash and allows the edit panel to function correctly.
 */
import { useState, useEffect, type FC } from 'react';
import { useAbilityTreeEditor } from '../../../../context/feature/AbilityTreeEditorContext';
import { useModal } from '../../../../context/global/ModalContext';
import type { Ability } from '../../../../db/types';

export const EditAbilityPanel: FC = () => {
    // FIX: Destructure 'currentTree' instead of the old 'tree' variable.
    const { selectedNode, currentTree, handleUpdateAbility, handleDeleteAbility, setSelectedNode } =
        useAbilityTreeEditor();
    const { showModal } = useModal();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [iconUrl, setIconUrl] = useState('');
    const [tier, setTier] = useState(1);
    const [allowedAttachmentType, setAllowedAttachmentType] = useState('');

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

    if (!selectedNode || !currentTree) {
        return null;
    }

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        const abilityId = parseInt(selectedNode.id, 10);
        const updates: Partial<Ability> = { name, description, iconUrl, tier };

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
                {/* ... other form groups ... */}
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
                        {/* FIX: Read tierCount from the correctly named 'currentTree' object. */}
                        {Array.from({ length: currentTree.tierCount }, (_, i) => i + 1).map(
                            (tierNum) => (
                                <option key={tierNum} value={tierNum}>
                                    Tier {tierNum}
                                </option>
                            ),
                        )}
                    </select>
                </div>

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
