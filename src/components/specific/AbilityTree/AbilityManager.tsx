// src/components/specific/AbilityManager/AbilityManager.tsx
import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { Settings } from 'lucide-react';
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
    deleteAbility,
} from '../../../db/queries/ability.queries';
import type { Ability, AbilityTree, Prerequisite } from '../../../db/types';
import { ManageModal } from '../../common/Modal/ManageModal';
import { AbilityTreeEditor } from '../AbilityTree/AbilityTreeEditor';

/**
 * A component for managing Ability Trees and the Abilities within them.
 */
export const AbilityManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();

    const [abilityTrees, setAbilityTrees] = useState<AbilityTree[]>([]);
    const [selectedTree, setSelectedTree] = useState<AbilityTree | null>(null);
    const [abilities, setAbilities] = useState<Ability[]>([]);

    const [newTreeName, setNewTreeName] = useState('');
    const [newTreeDesc, setNewTreeDesc] = useState('');
    const [newAbilityName, setNewAbilityName] = useState('');
    const [newAbilityDesc, setNewAbilityDesc] = useState('');
    const [newAbilityPrereqs, setNewAbilityPrereqs] = useState('');

    const [managingTree, setManagingTree] = useState<AbilityTree | null>(null);
    const [managingAbility, setManagingAbility] = useState<Ability | null>(null);

    const [isLoadingTrees, setIsLoadingTrees] = useState(true);
    const [isLoadingAbilities, setIsLoadingAbilities] = useState(false);
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

    // REFACTOR: This function is now a standalone callback for refreshing the ability list.
    const refreshAbilities = useCallback(async () => {
        if (!selectedTree?.id) return;
        try {
            setError(null);
            setIsLoadingAbilities(true);
            const treeAbilities = await getAbilitiesForTree(selectedTree.id);
            setAbilities(treeAbilities);
        } catch (err) {
            setError('Failed to load abilities for the selected tree.');
        } finally {
            setIsLoadingAbilities(false);
        }
    }, [selectedTree]);

    useEffect(() => {
        refreshAbilities();
    }, [refreshAbilities]);

    const handleSelectTree = (tree: AbilityTree) => {
        setSelectedTree(tree);
    };

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

    const handleSaveTree = async (updatedTree: AbilityTree) => {
        await updateAbilityTree(updatedTree.id!, {
            name: updatedTree.name,
            description: updatedTree.description,
        });
        await fetchTrees();
        if (selectedTree?.id === updatedTree.id) {
            setSelectedTree(updatedTree);
        }
    };

    const handleDeleteTree = (treeId: number) => {
        setManagingTree(null);
        showModal('confirmation', {
            title: 'Delete Ability Tree?',
            message: 'This will delete the tree and ALL abilities within it. This is permanent.',
            onConfirm: async () => {
                await deleteAbilityTree(treeId);
                await fetchTrees();
                if (selectedTree?.id === treeId) {
                    setSelectedTree(null);
                }
            },
        });
    };

    const handleAddAbility = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAbilityName.trim() || !selectedWorld?.id || !selectedTree?.id) return;

        const prereqIds = newAbilityPrereqs
            .split(',')
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id));
        const prerequisites: Prerequisite = { abilityIds: prereqIds };

        await addAbility({
            name: newAbilityName,
            description: newAbilityDesc,
            prerequisites,
            worldId: selectedWorld.id,
            abilityTreeId: selectedTree.id,
        });
        setNewAbilityName('');
        setNewAbilityDesc('');
        setNewAbilityPrereqs('');
        await refreshAbilities();
    };

    const handleSaveAbility = async (updatedAbility: Ability) => {
        await updateAbility(updatedAbility.id!, {
            name: updatedAbility.name,
            description: updatedAbility.description,
            prerequisites: updatedAbility.prerequisites,
        });
        await refreshAbilities();
    };

    const handleDeleteAbility = (abilityId: number) => {
        setManagingAbility(null);
        showModal('confirmation', {
            title: 'Delete Ability?',
            message: 'Are you sure you want to delete this ability?',
            onConfirm: async () => {
                await deleteAbility(abilityId);
                await refreshAbilities();
            },
        });
    };

    // --- NEW: Handlers for the Visual Editor ---

    const handleNodeDragStop = async (node: Node) => {
        const abilityId = parseInt(node.id, 10);
        const ability = abilities.find((a) => a.id === abilityId);
        if (ability) {
            // Update the ability with its new x/y position.
            await updateAbility(abilityId, {
                ...ability, // Pass existing data
                x: node.position.x,
                y: node.position.y,
            });
            // No need to full refresh, just update local state for snappiness
            setAbilities((prev) =>
                prev.map((a) =>
                    a.id === abilityId ? { ...a, x: node.position.x, y: node.position.y } : a,
                ),
            );
        }
    };

    const handleConnect = async (connection: Connection) => {
        const sourceId = parseInt(connection.source!, 10);
        const targetId = parseInt(connection.target!, 10);
        const targetAbility = abilities.find((a) => a.id === targetId);

        if (targetAbility) {
            // Add the new source ID to the target's prerequisites, avoiding duplicates.
            const newPrereqIds = new Set([...targetAbility.prerequisites.abilityIds, sourceId]);
            const updatedPrerequisites: Prerequisite = { abilityIds: Array.from(newPrereqIds) };

            await updateAbility(targetId, {
                ...targetAbility,
                prerequisites: updatedPrerequisites,
            });
            await refreshAbilities(); // Refresh to show the new connection data
        }
    };

    return (
        <>
            {error && <p className="error-message mb-4">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* --- Left Panel: Ability Trees --- */}
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
                                    <li
                                        key={tree.id}
                                        className={`panel__list-item ${
                                            selectedTree?.id === tree.id ? 'bg-gray-700' : ''
                                        }`}
                                    >
                                        <div
                                            className="panel__item-details cursor-pointer"
                                            onClick={() => handleSelectTree(tree)}
                                        >
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
                                                <Settings size={16} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* --- Right Panel: Abilities --- */}
                <div className="panel">
                    <h2 className="panel__title">
                        Abilities {selectedTree ? `in ${selectedTree.name}` : ''}
                    </h2>
                    {selectedTree ? (
                        <>
                            <div className="panel__form-section">
                                <h3 className="panel__form-title">Create New Ability</h3>
                                <form onSubmit={handleAddAbility} className="form">
                                    <input
                                        value={newAbilityName}
                                        onChange={(e) => setNewAbilityName(e.target.value)}
                                        placeholder="Ability Name (e.g., Fireball)"
                                        className="form__input"
                                    />
                                    <input
                                        value={newAbilityDesc}
                                        onChange={(e) => setNewAbilityDesc(e.target.value)}
                                        placeholder="Description"
                                        className="form__input"
                                    />
                                    <input
                                        value={newAbilityPrereqs}
                                        onChange={(e) => setNewAbilityPrereqs(e.target.value)}
                                        placeholder="Prerequisite IDs (e.g., 1, 5, 12)"
                                        className="form__input"
                                    />
                                    <button type="submit" className="button button--primary">
                                        Create Ability
                                    </button>
                                </form>
                            </div>
                            <div className="panel__list-section">
                                <h3 className="panel__list-title">Ability Tree Editor</h3>
                                {isLoadingAbilities ? (
                                    <p>Loading...</p>
                                ) : (
                                    <AbilityTreeEditor
                                        abilities={abilities}
                                        onNodeDragStop={handleNodeDragStop}
                                        onConnect={handleConnect}
                                    />
                                )}
                            </div>
                        </>
                    ) : (
                        <p className="panel__empty-message">
                            Select an ability tree on the left to view and manage its abilities.
                        </p>
                    )}
                </div>
            </div>

            {/* Modals */}
            <ManageModal<AbilityTree>
                isOpen={!!managingTree}
                onClose={() => setManagingTree(null)}
                item={managingTree}
                onSave={handleSaveTree}
                onDelete={handleDeleteTree}
                itemType="Ability Tree"
            />
            <ManageModal<Ability>
                isOpen={!!managingAbility}
                onClose={() => setManagingAbility(null)}
                item={managingAbility}
                onSave={handleSaveAbility}
                onDelete={handleDeleteAbility}
                itemType="Ability"
            />
        </>
    );
};
