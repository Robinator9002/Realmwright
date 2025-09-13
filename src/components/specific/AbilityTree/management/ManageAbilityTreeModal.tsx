// src/components/specific/AbilityTree/management/ManageAbilityTreeModal.tsx

/**
 * COMMIT: feat(abilities): extract ManageAbilityTreeModal component
 *
 * Rationale:
 * To continue the refactoring of the AbilityManager, the complex modal for
 * editing an ability tree's details has been extracted into this dedicated
 * component.
 *
 * Implementation Details:
 * - This component encapsulates all the state and logic for the "Manage Tree"
 * form, including fields for name, description, tier count, and the optional
 * attachment type.
 * - It receives the tree to edit and the necessary save/delete handlers
 * as props, keeping it decoupled from the main manager's state.
 */
import { useState, useEffect, type FC } from 'react';
import type { AbilityTree } from '../../../../db/types';
import type { UpdateAbilityTreePayload } from '../../../../db/queries/character/ability.queries';

interface ManageAbilityTreeModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: AbilityTree | null;
    onSave: (updates: Partial<UpdateAbilityTreePayload>, treeId: number) => Promise<void>;
    onDelete: (itemId: number) => void;
}

export const ManageAbilityTreeModal: FC<ManageAbilityTreeModalProps> = ({
    isOpen,
    onClose,
    item,
    onSave,
    onDelete,
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tierCount, setTierCount] = useState(5);
    const [attachmentType, setAttachmentType] = useState('');

    useEffect(() => {
        if (item) {
            setName(item.name);
            setDescription(item.description);
            setTierCount(item.tierCount);
            setAttachmentType(item.attachmentType || '');
        }
    }, [item]);

    if (!isOpen || !item) return null;

    const handleSave = async () => {
        const updates: Partial<UpdateAbilityTreePayload> = {
            name,
            description,
            tierCount,
            attachmentType,
        };
        await onSave(updates, item.id!);
        onClose();
    };

    const handleDelete = () => {
        onDelete(item.id!);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">Manage {item.name}</h2>
                    <button onClick={onClose} className="modal__close-button">
                        &times;
                    </button>
                </div>
                <div className="modal__content">
                    <form className="form">
                        <div className="form__group">
                            <label htmlFor="treeName" className="form__label">
                                Tree Name
                            </label>
                            <input
                                id="treeName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="form__input"
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="treeDesc" className="form__label">
                                Description
                            </label>
                            <textarea
                                id="treeDesc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="form__textarea"
                                rows={3}
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="treeTiers" className="form__label">
                                Number of Tiers
                            </label>
                            <input
                                id="treeTiers"
                                type="number"
                                value={tierCount}
                                onChange={(e) => setTierCount(parseInt(e.target.value, 10) || 1)}
                                className="form__input"
                                min="1"
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="treeAttachmentType" className="form__label">
                                Attachment Type (Optional)
                            </label>
                            <input
                                id="treeAttachmentType"
                                type="text"
                                value={attachmentType}
                                onChange={(e) => setAttachmentType(e.target.value)}
                                className="form__input"
                                placeholder="e.g., Weapon Mod, Class Feat"
                            />
                            <small className="form__help-text">
                                A category for this tree, used to restrict where it can be socketed.
                            </small>
                        </div>
                    </form>
                </div>
                <div className="modal__footer">
                    <button onClick={handleDelete} className="button button--danger mr-auto">
                        Delete Tree
                    </button>
                    <button onClick={onClose} className="button">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="button button--primary">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
