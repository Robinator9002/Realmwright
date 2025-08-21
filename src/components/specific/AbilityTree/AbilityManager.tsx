// src/components/specific/AbilityTree/AbilityManager.tsx
import { useState, useEffect, useCallback, type FC } from 'react';
import { Settings } from 'lucide-react';
import { useWorld } from '../../../context/WorldContext';
import { useModal } from '../../../context/ModalContext';
// NEW: Import the useView hook to control the main application view
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
 * A specialized modal for managing the core details of an Ability Tree,
 * such as its name, description, and the number of tiers it has.
 * This component remains unchanged.
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

    useEffect(() => {
        if (item) {
            setName(item.name);
            setDescription(item.description);
            setTierCount(item.tierCount);
        }
    }, [item]);

    if (!isOpen || !item) return null;

    const handleSave = async () => {
        const updates: Partial<UpdateAbilityTreePayload> = { name, description, tierCount };
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
                    {/* Form content remains the same... */}
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
 * REFACTORED: This component is now only responsible for listing and creating
 * ability trees. It delegates the responsibility of showing the editor to the
 * main App component via the ViewContext.
 */
export const AbilityManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();
    // NEW: Get the view setters from the context.
    const { setCurrentView, setEditingAbilityTreeId } = useView();

    const [abilityTrees, setAbilityTrees] = useState<AbilityTree[]>([]);
    const [newTreeName, setNewTreeName] = useState('');
    const [newTreeDesc, setNewTreeDesc] = useState('');
    const [managingTree, setManagingTree] = useState<AbilityTree | null>(null);
    const [isLoadingTrees, setIsLoadingTrees] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // REMOVED: The `editingTree` state is no longer needed here.

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

    /**
     * NEW: This handler is called when the user clicks "Open Editor".
     * It updates the global context to trigger a view change in the main App.
     */
    const handleOpenEditor = (tree: AbilityTree) => {
        setEditingAbilityTreeId(tree.id!);
        setCurrentView('ability_tree_editor');
    };

    // REMOVED: The conditional rendering logic for the editor page is gone.
    // This component now *only* renders the panel.

    return (
        <>
            <div className="panel">
                <h2 className="panel__title">Ability Trees</h2>
                <div className="panel__form-section">
                    <h3 className="panel__form-title">Create New Tree</h3>
                    <form onSubmit={handleAddTree} className="form">
                        {/* ... */}
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
                                            onClick={() => handleOpenEditor(tree)} // REWORK
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
