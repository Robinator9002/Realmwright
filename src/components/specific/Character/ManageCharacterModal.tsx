// src/components/specific/ManageCharacterModal/ManageCharacterModal.tsx
import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useWorld } from '../../../context/WorldContext';
import { getStatDefinitionsForWorld } from '../../../db/queries/rule.queries';
// NEW: Import queries for fetching abilities.
import { getAbilityTreesForWorld, getAbilitiesForTree } from '../../../db/queries/ability.queries';
import type { Character, StatDefinition, AbilityTree, Ability } from '../../../db/types';

// The save data now includes the list of learned abilities.
export type CharacterSaveData = {
    name: string;
    description: string;
    type: 'PC' | 'NPC' | 'Enemy';
    stats: { [statId: number]: number };
    learnedAbilities: number[];
};

export interface ManageCharacterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CharacterSaveData) => Promise<void>;
    characterToEdit: Character | null;
}

/**
 * A specialized modal for creating and editing characters, including their stats and abilities.
 */
export const ManageCharacterModal: FC<ManageCharacterModalProps> = ({
    isOpen,
    onClose,
    onSave,
    characterToEdit,
}) => {
    const { selectedWorld } = useWorld();
    const isEditMode = !!characterToEdit;

    // --- Form State ---
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'PC' | 'NPC' | 'Enemy'>('NPC');
    const [stats, setStats] = useState<{ [statId: number]: number }>({});
    const [learnedAbilities, setLearnedAbilities] = useState<number[]>([]);

    // --- Data Loading State ---
    const [statDefs, setStatDefs] = useState<StatDefinition[]>([]);
    const [abilityTrees, setAbilityTrees] = useState<AbilityTree[]>([]);
    const [abilitiesByTree, setAbilitiesByTree] = useState<Record<number, Ability[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    // Effect to fetch all necessary data (stats, ability trees, and all abilities) when the modal opens.
    useEffect(() => {
        if (isOpen && selectedWorld?.id) {
            setIsLoading(true);
            Promise.all([
                getStatDefinitionsForWorld(selectedWorld.id),
                getAbilityTreesForWorld(selectedWorld.id),
            ]).then(async ([statData, treeData]) => {
                setStatDefs(statData);
                setAbilityTrees(treeData);

                // Fetch abilities for each tree
                const abilitiesMap: Record<number, Ability[]> = {};
                for (const tree of treeData) {
                    const abilities = await getAbilitiesForTree(tree.id!);
                    abilitiesMap[tree.id!] = abilities;
                }
                setAbilitiesByTree(abilitiesMap);

                setIsLoading(false);
            });
        }
    }, [isOpen, selectedWorld]);

    // Effect to populate the form once data is loaded.
    useEffect(() => {
        if (isOpen && !isLoading) {
            if (isEditMode && characterToEdit) {
                setName(characterToEdit.name);
                setDescription(characterToEdit.description);
                setType(characterToEdit.type);
                setStats(characterToEdit.stats || {});
                setLearnedAbilities(characterToEdit.learnedAbilities || []);
            } else {
                setName('');
                setDescription('');
                setType('NPC');
                setLearnedAbilities([]);
                const defaultStats: { [statId: number]: number } = {};
                for (const def of statDefs) {
                    defaultStats[def.id!] = def.defaultValue;
                }
                setStats(defaultStats);
            }
        }
    }, [isOpen, isLoading, isEditMode, characterToEdit, statDefs]);

    const handleStatChange = (statId: number, value: string) => {
        setStats((prev) => ({ ...prev, [statId]: parseInt(value, 10) || 0 }));
    };

    // NEW: Handler for toggling an ability's learned status.
    const handleAbilityToggle = (abilityId: number) => {
        setLearnedAbilities((prev) =>
            prev.includes(abilityId) ? prev.filter((id) => id !== abilityId) : [...prev, abilityId],
        );
    };

    const handleSave = async () => {
        const saveData: CharacterSaveData = { name, description, type, stats, learnedAbilities };
        await onSave(saveData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                style={{ maxWidth: '800px' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal__header">
                    <h2 className="modal__title">
                        {isEditMode ? `Edit ${characterToEdit.name}` : 'Create New Character'}
                    </h2>
                    <button onClick={onClose} className="modal__close-button">
                        &times;
                    </button>
                </div>

                <div className="modal__content">
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <form className="form grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* --- Left Column: Details & Stats --- */}
                            <div className="flex flex-col gap-4">
                                <div className="form__group">
                                    <label htmlFor="charName" className="form__label">
                                        Name
                                    </label>
                                    <input
                                        id="charName"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="form__input"
                                    />
                                </div>
                                <div className="form__group">
                                    <label htmlFor="charDesc" className="form__label">
                                        Description
                                    </label>
                                    <textarea
                                        id="charDesc"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="form__textarea"
                                        rows={3}
                                    />
                                </div>
                                <div className="form__group">
                                    <label htmlFor="charType" className="form__label">
                                        Type
                                    </label>
                                    <select
                                        id="charType"
                                        value={type}
                                        onChange={(e) =>
                                            setType(e.target.value as 'PC' | 'NPC' | 'Enemy')
                                        }
                                        className="form__select"
                                    >
                                        <option value="NPC">NPC</option>
                                        <option value="PC">Player Character</option>
                                        <option value="Enemy">Enemy</option>
                                    </select>
                                </div>
                                {statDefs.length > 0 && (
                                    <div className="form__group">
                                        <label className="form__label">Statistics</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {statDefs.map((def) => (
                                                <div key={def.id} className="form__group">
                                                    <label
                                                        htmlFor={`stat-${def.id}`}
                                                        className="form__label text-xs"
                                                    >
                                                        {def.name} ({def.abbreviation})
                                                    </label>
                                                    <input
                                                        id={`stat-${def.id}`}
                                                        type="number"
                                                        value={stats[def.id!] || ''}
                                                        onChange={(e) =>
                                                            handleStatChange(
                                                                def.id!,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="form__input"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* --- Right Column: Abilities --- */}
                            <div className="flex flex-col gap-4">
                                <div className="form__group">
                                    <label className="form__label">Abilities</label>
                                    <div className="ability-selection-container">
                                        {abilityTrees.length > 0 ? (
                                            abilityTrees.map((tree) => (
                                                <details
                                                    key={tree.id}
                                                    className="ability-tree-group"
                                                >
                                                    <summary className="ability-tree-summary">
                                                        {tree.name}
                                                    </summary>
                                                    <div className="ability-list">
                                                        {(abilitiesByTree[tree.id!] || []).map(
                                                            (ability) => (
                                                                <label
                                                                    key={ability.id}
                                                                    className="ability-checkbox-label"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={learnedAbilities.includes(
                                                                            ability.id!,
                                                                        )}
                                                                        onChange={() =>
                                                                            handleAbilityToggle(
                                                                                ability.id!,
                                                                            )
                                                                        }
                                                                    />
                                                                    {ability.name}
                                                                </label>
                                                            ),
                                                        )}
                                                    </div>
                                                </details>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                No ability trees defined for this world.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                <div className="modal__footer">
                    <button onClick={onClose} className="button">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="button button--primary">
                        {isEditMode ? 'Save Changes' : 'Create Character'}
                    </button>
                </div>
            </div>
        </div>
    );
};
