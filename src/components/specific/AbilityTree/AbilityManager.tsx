// src/components/specific/AbilityManager/AbilityManager.tsx
import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { Settings, ArrowLeft } from 'lucide-react';
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

    // NEW: State to manage the number of tiers in the editor.
    const [tierCount, setTierCount] = useState(5); // Default to 5 tiers for now.

    // Forms State
    const [newTreeName, setNewTreeName] = useState('');
    const [newTreeDesc, setNewTreeDesc] = useState('');
    const [newAbilityName, setNewAbilityName] = useState('');
    const [newAbilityDesc, setNewAbilityDesc] = useState('');
    const [newAbilityPrereqs, setNewAbilityPrereqs] = useState('');
    const [newAbilityTier, setNewAbilityTier] = useState(1); // Default to tier 1.

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

    const refreshAbilities = useCallback(async () => {
        if (!selectedTree?.id) {
            setAbilities([]);
            return;
        }
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
    }, [selectedTree]);

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
            tier: newAbilityTier, // Pass the selected tier.
        });
        setNewAbilityName('');
        setNewAbilityDesc('');
        setNewAbilityPrereqs('');
        setNewAbilityTier(1);
        await refreshAbilities();
    };

    const handleSaveAbility = async (updatedAbility: Ability) => {
        await updateAbility(updatedAbility.id!, {
            name: updatedAbility.name,
            description: updatedAbility.description,
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

    const handleNodeDragStop = async (node: Node) => {
        const abilityId = parseInt(node.id, 10);
        await updateAbility(abilityId, {
            x: node.position.x,
            y: node.position.y,
        });
        setAbilities((prev) =>
            prev.map((a) =>
                a.id === abilityId ? { ...a, x: node.position.x, y: node.position.y } : a,
            ),
        );
    };

    const handleConnect = async (connection: Connection) => {
        const sourceId = parseInt(connection.source!, 10);
        const targetId = parseInt(connection.target!, 10);
        const targetAbility = abilities.find((a) => a.id === targetId);

        if (targetAbility) {
            const newPrereqIds = new Set([...targetAbility.prerequisites.abilityIds, sourceId]);
            const updatedPrerequisites: Prerequisite = { abilityIds: Array.from(newPrereqIds) };
            await updateAbility(targetId, {
                prerequisites: updatedPrerequisites,
            });
            await refreshAbilities();
        }
    };

    // --- RENDER FUNCTIONS FOR DIFFERENT VIEWS ---

    const renderTreeView = () => (
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
                                    <p className="panel__item-description">{tree.description}</p>
                                </div>
                                <div className="panel__item-actions">
                                    <button
                                        onClick={() => setManagingTree(tree)}
                                        className="button"
                                    >
                                        <Settings size={16} /> Manage
                                    </button>
                                    <button
                                        onClick={() => handleSelectTree(tree)}
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
    );

    const renderEditorView = () => (
        <div className="panel ability-editor-panel">
            <div className="panel__header-actions">
                <button onClick={() => setSelectedTree(null)} className="button">
                    <ArrowLeft size={16} /> Back to Tree List
                </button>
                <h2 className="panel__title">Editing: {selectedTree?.name}</h2>
            </div>

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
                    {/* NEW: Dropdown for selecting the tier */}
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
                            {Array.from({ length: tierCount }, (_, i) => i + 1).map((tierNum) => (
                                <option key={tierNum} value={tierNum}>
                                    Tier {tierNum}
                                </option>
                            ))}
                        </select>
                    </div>
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

            <div className="panel__list-section flex-grow">
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
        </div>
    );

    return (
        <>
            {error && <p className="error-message mb-4">{error}</p>}

            {selectedTree ? renderEditorView() : renderTreeView()}

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
