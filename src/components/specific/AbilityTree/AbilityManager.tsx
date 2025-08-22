// src/components/specific/AbilityTree/AbilityManager.tsx
import { useState, useEffect, useCallback, type FC } from 'react';
import { Settings } from 'lucide-react';
import { useWorld } from '../../../context/WorldContext';
import { useModal } from '../../../context/ModalContext';
import { useView } from '../../../context/ViewContext';
import {
    addAbilityTree,
    getAbilityTreesForWorld,
    updateAbilityTree,
    deleteAbilityTree,
    type UpdateAbilityTreePayload,
} from '../../../db/queries/ability.queries';
import type { AbilityTree } from '../../../db/types';

/**
 * REWORKED: The modal for managing an Ability Tree now includes a field
 * for setting the tree's `attachmentType`.
 */
const ManageAbilityTreeModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    item: AbilityTree | null;
    onSave: (updates: Partial<UpdateAbilityTreePayload>, treeId: number) => Promise<void>;
    onDelete: (itemId: number) => void;
}> = ({ isOpen, onClose, item, onSave, onDelete }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tierCount, setTierCount] = useState(5);
    // NEW: State for the new attachmentType field.
    const [attachmentType, setAttachmentType] = useState('');

    useEffect(() => {
        if (item) {
            setName(item.name);
            setDescription(item.description);
            setTierCount(item.tierCount);
            // NEW: Populate the attachmentType from the item, defaulting to an empty string.
            setAttachmentType(item.attachmentType || '');
        }
    }, [item]);

    if (!isOpen || !item) return null;

    const handleSave = async () => {
        // NEW: Include the attachmentType in the updates payload.
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
                        {/* NEW: Form group for the Attachment Type */}
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

/**
 * The main AbilityManager component. No changes are needed here as the
 * logic is entirely contained within the modal it uses.
 */
export const AbilityManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();
    const { setCurrentView, setEditingAbilityTreeId } = useView();

    const [abilityTrees, setAbilityTrees] = useState<AbilityTree[]>([]);
    const [newTreeName, setNewTreeName] = useState('');
    const [newTreeDesc, setNewTreeDesc] = useState('');
    const [managingTree, setManagingTree] = useState<AbilityTree | null>(null);
    const [isLoadingTrees, setIsLoadingTrees] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTrees = useCallback(async () => {
        if (!selectedWorld?.id) return;
        try {
            setError(null);
            setIsLoadingTrees(true);
            const trees = await getAbilityTreesForWorld(selectedWorld.id);
            setAbilityTrees(trees);
        } catch (err) {
            setError('Failed to load ability trees.');
        } finally {
            setIsLoadingTrees(false);
        }
    }, [selectedWorld]);

    useEffect(() => {
        fetchTrees();
    }, [fetchTrees]);

    const handleAddTree = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTreeName.trim() || !selectedWorld?.id) return;
        await addAbilityTree({
            name: newTreeName,
            description: newTreeDesc,
            worldId: selectedWorld.id,
        });
        setNewTreeName('');
        setNewTreeDesc('');
        await fetchTrees();
    };

    const handleSaveTree = async (updates: Partial<UpdateAbilityTreePayload>, treeId: number) => {
        await updateAbilityTree(treeId, updates);
        await fetchTrees();
    };

    const handleDeleteTree = (treeId: number) => {
        setManagingTree(null);
        showModal('confirmation', {
            title: 'Delete Ability Tree?',
            message: 'This will delete the tree and ALL abilities within it. This is permanent.',
            onConfirm: async () => {
                await deleteAbilityTree(treeId);
                await fetchTrees();
            },
        });
    };

    const handleOpenEditor = (tree: AbilityTree) => {
        setEditingAbilityTreeId(tree.id!);
        setCurrentView('ability_tree_editor');
    };

    return (
        <>
            <div className="panel">
                <h2 className="panel__title">Ability Trees</h2>
                <div className="panel__form-section">
                    <h3 className="panel__form-title">Create New Tree</h3>
                    <form onSubmit={handleAddTree} className="form">
                        <div className="form__group">
                            <label htmlFor="newTreeName" className="form__label">
                                New Tree Name
                            </label>
                            <input
                                id="newTreeName"
                                type="text"
                                value={newTreeName}
                                onChange={(e) => setNewTreeName(e.target.value)}
                                className="form__input"
                                placeholder="e.g., Warrior Skills"
                                required
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="newTreeDesc" className="form__label">
                                Description
                            </label>
                            <textarea
                                id="newTreeDesc"
                                value={newTreeDesc}
                                onChange={(e) => setNewTreeDesc(e.target.value)}
                                className="form__textarea"
                                placeholder="A brief overview of this skill tree."
                                rows={2}
                            />
                        </div>
                        <button type="submit" className="button button--primary">
                            Create Tree
                        </button>
                    </form>
                </div>
                <div className="panel__list-section">
                    <h3 className="panel__list-title">Existing Trees</h3>
                    {isLoadingTrees ? (
                        <p>Loading...</p>
                    ) : (
                        <ul className="panel__list">
                            {abilityTrees.map((tree) => (
                                <li key={tree.id} className="panel__list-item">
                                    <div className="panel__item-details">
                                        <h4 className="panel__item-title">{tree.name}</h4>
                                        <p className="panel__item-description">
                                            {tree.description}
                                        </p>
                                    </div>
                                    <div className="panel__item-actions">
                                        <button
                                            onClick={() => setManagingTree(tree)}
                                            className="button"
                                        >
                                            <Settings size={16} /> Manage
                                        </button>
                                        <button
                                            onClick={() => handleOpenEditor(tree)}
                                            className="button button--primary"
                                        >
                                            Open Editor &rarr;
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <ManageAbilityTreeModal
                isOpen={!!managingTree}
                onClose={() => setManagingTree(null)}
                item={managingTree}
                onSave={handleSaveTree}
                onDelete={handleDeleteTree}
            />
        </>
    );
};
