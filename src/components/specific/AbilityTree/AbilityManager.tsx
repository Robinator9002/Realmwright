// src/components/specific/AbilityTree/AbilityManager.tsx
import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { Settings, ArrowLeft, X } from 'lucide-react';
import type { Node, Connection } from 'reactflow';
import { useWorld } from '../../../context/WorldContext';
import { useModal } from '../../../context/ModalContext';
import {
    addAbilityTree,
    getAbilityTreesForWorld,
    updateAbilityTree,
    deleteAbilityTree,
    addAbility,
    getAbilitiesForTree,
    updateAbility,
    type UpdateAbilityTreePayload,
} from '../../../db/queries/ability.queries';
import type { Ability, AbilityTree, PrerequisiteGroup } from '../../../db/types';
// REWORK: We need a specialized modal for this now.
// import { ManageModal } from '../../common/Modal/ManageModal';
import { AbilityTreeEditor } from '../AbilityTree/AbilityTreeEditor';

// A specialized modal for managing Ability Tree details.
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

// The overlay component remains largely the same, but now receives tierCount as a prop.
const AbilityTreeEditorOverlay: FC<{
    tree: AbilityTree;
    onClose: () => void;
}> = ({ tree, onClose }) => {
    const { selectedWorld } = useWorld();
    const [abilities, setAbilities] = useState<Ability[]>([]);
    const [isLoadingAbilities, setIsLoadingAbilities] = useState(true);
    const [newAbilityName, setNewAbilityName] = useState('');
    const [newAbilityDesc, setNewAbilityDesc] = useState('');
    const [newAbilityTier, setNewAbilityTier] = useState(1);

    const refreshAbilities = useCallback(async () => {
        setIsLoadingAbilities(true);
        const treeAbilities = await getAbilitiesForTree(tree.id!);
        setAbilities(treeAbilities);
        setIsLoadingAbilities(false);
    }, [tree.id]);

    useEffect(() => {
        refreshAbilities();
    }, [refreshAbilities]);

    const handleAddAbility = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAbilityName.trim() || !selectedWorld?.id) return;

        await addAbility({
            name: newAbilityName,
            description: newAbilityDesc,
            worldId: selectedWorld.id,
            abilityTreeId: tree.id!,
            tier: newAbilityTier,
        });
        setNewAbilityName('');
        setNewAbilityDesc('');
        setNewAbilityTier(1);
        await refreshAbilities();
    };

    const handleNodeDragStop = async (node: Node, closestTier: number) => {
        const abilityId = parseInt(node.id, 10);
        await updateAbility(abilityId, {
            x: node.position.x,
            y: node.position.y,
            tier: closestTier,
        });
        setAbilities((prev) =>
            prev.map((a) =>
                a.id === abilityId
                    ? { ...a, x: node.position.x, y: node.position.y, tier: closestTier }
                    : a,
            ),
        );
    };

    const handleConnect = async (connection: Connection) => {
        // This logic will be overhauled later for AND/OR
        const sourceId = parseInt(connection.source!, 10);
        const targetId = parseInt(connection.target!, 10);
        const targetAbility = abilities.find((a) => a.id === targetId);

        if (targetAbility) {
            const newPrereqGroup: PrerequisiteGroup = { type: 'AND', abilityIds: [sourceId] };
            const updatedPrerequisites = [...targetAbility.prerequisites, newPrereqGroup];
            await updateAbility(targetId, { prerequisites: updatedPrerequisites });
            await refreshAbilities();
        }
    };

    return (
        <div className="ability-editor-overlay">
            <div className="ability-editor-overlay__header">
                <div className="ability-editor-overlay__header-info">
                    <button onClick={onClose} className="button">
                        <ArrowLeft size={16} /> Back to List
                    </button>
                    <h2 className="ability-editor-overlay__title">Editing: {tree.name}</h2>
                </div>
                <button onClick={onClose} className="ability-editor-overlay__close-button">
                    <X size={24} />
                </button>
            </div>
            <div className="ability-editor-overlay__content">
                <div className="ability-editor-overlay__sidebar">
                    <h3 className="sidebar__title">Create New Ability</h3>
                    <form onSubmit={handleAddAbility} className="form">
                        <input
                            value={newAbilityName}
                            onChange={(e) => setNewAbilityName(e.target.value)}
                            placeholder="Ability Name"
                            className="form__input"
                        />
                        <input
                            value={newAbilityDesc}
                            onChange={(e) => setNewAbilityDesc(e.target.value)}
                            placeholder="Description"
                            className="form__input"
                        />
                        <div className="form__group">
                            <label htmlFor="abilityTier" className="form__label">
                                Tier
                            </label>
                            <select
                                id="abilityTier"
                                value={newAbilityTier}
                                onChange={(e) => setNewAbilityTier(parseInt(e.target.value, 10))}
                                className="form__select"
                            >
                                {Array.from({ length: tree.tierCount }, (_, i) => i + 1).map(
                                    (tierNum) => (
                                        <option key={tierNum} value={tierNum}>
                                            Tier {tierNum}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>
                        <button type="submit" className="button button--primary">
                            Create Ability
                        </button>
                    </form>
                </div>
                <div className="ability-editor-overlay__canvas">
                    {isLoadingAbilities ? (
                        <p>Loading...</p>
                    ) : (
                        <AbilityTreeEditor
                            abilities={abilities}
                            tierCount={tree.tierCount} // Pass the dynamic tier count
                            onNodeDragStop={handleNodeDragStop}
                            onConnect={handleConnect}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export const AbilityManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();

    const [abilityTrees, setAbilityTrees] = useState<AbilityTree[]>([]);
    const [selectedTree, setSelectedTree] = useState<AbilityTree | null>(null);
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

    return (
        <>
            <div className="panel">
                <h2 className="panel__title">Ability Trees</h2>
                <div className="panel__form-section">
                    <h3 className="panel__form-title">Create New Tree</h3>
                    <form onSubmit={handleAddTree} className="form">
                        <input
                            value={newTreeName}
                            onChange={(e) => setNewTreeName(e.target.value)}
                            placeholder="Tree Name (e.g., Sorcery)"
                            className="form__input"
                        />
                        <input
                            value={newTreeDesc}
                            onChange={(e) => setNewTreeDesc(e.target.value)}
                            placeholder="Description"
                            className="form__input"
                        />
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
                                            onClick={() => setSelectedTree(tree)}
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

            {selectedTree && (
                <AbilityTreeEditorOverlay
                    tree={selectedTree}
                    onClose={() => setSelectedTree(null)}
                />
            )}
        </>
    );
};
