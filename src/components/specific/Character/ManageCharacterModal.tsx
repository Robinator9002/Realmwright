// src/components/specific/Character/ManageCharacterModal.tsx
import { useState, useEffect, type FC } from 'react';
import { useWorld } from '../../../context/WorldContext';
import { getStatDefinitionsForWorld } from '../../../db/queries/rule.queries';
// FIX: Import the missing 'getAbilitiesForTree' function.
import { getAbilityTreesForWorld, getAbilitiesForTree } from '../../../db/queries/ability.queries';
// NEW: Import queries and types for Character Classes.
import { getClassesForWorld } from '../../../db/queries/class.queries';
import type {
    Character,
    StatDefinition,
    AbilityTree,
    Ability,
    CharacterClass,
} from '../../../db/types';

// The save data now includes the optional classId.
export type CharacterSaveData = {
    name: string;
    description: string;
    type: 'PC' | 'NPC' | 'Enemy';
    stats: { [statId: number]: number };
    learnedAbilities: number[];
    classId?: number;
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
    const [classId, setClassId] = useState<number | undefined>(undefined); // NEW

    // --- Data Loading State ---
    const [statDefs, setStatDefs] = useState<StatDefinition[]>([]);
    const [abilityTrees, setAbilityTrees] = useState<AbilityTree[]>([]);
    const [characterClasses, setCharacterClasses] = useState<CharacterClass[]>([]); // NEW
    const [abilitiesByTree, setAbilitiesByTree] = useState<Record<number, Ability[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    // Effect to fetch all necessary data (stats, trees, classes, and all abilities) when the modal opens.
    useEffect(() => {
        if (isOpen && selectedWorld?.id) {
            setIsLoading(true);
            Promise.all([
                getStatDefinitionsForWorld(selectedWorld.id),
                getAbilityTreesForWorld(selectedWorld.id),
                getClassesForWorld(selectedWorld.id), // NEW: Fetch classes
            ]).then(async ([statData, treeData, classData]) => {
                setStatDefs(statData);
                setAbilityTrees(treeData);
                setCharacterClasses(classData); // NEW: Store classes

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
                setClassId(characterToEdit.classId); // NEW
            } else {
                setName('');
                setDescription('');
                setType('NPC');
                setLearnedAbilities([]);
                setClassId(undefined); // NEW
                const defaultStats: { [statId: number]: number } = {};
                for (const def of statDefs) {
                    defaultStats[def.id!] = def.defaultValue;
                }
                setStats(defaultStats);
            }
        }
    }, [isOpen, isLoading, isEditMode, characterToEdit, statDefs]);

    // NEW: Effect to apply class template when classId changes.
    useEffect(() => {
        if (!isLoading) {
            const selectedClass = characterClasses.find((c) => c.id === classId);
            if (selectedClass) {
                setStats(selectedClass.baseStats);
            } else {
                // If "None" is selected or class not found, reset to defaults.
                const defaultStats: { [statId: number]: number } = {};
                for (const def of statDefs) {
                    defaultStats[def.id!] = def.defaultValue;
                }
                setStats(defaultStats);
            }
        }
    }, [classId, characterClasses, statDefs, isLoading]);

    const handleStatChange = (statId: number, value: string) => {
        setStats((prev) => ({ ...prev, [statId]: parseInt(value, 10) || 0 }));
    };

    const handleAbilityToggle = (abilityId: number) => {
        setLearnedAbilities((prev) =>
            prev.includes(abilityId) ? prev.filter((id) => id !== abilityId) : [...prev, abilityId],
        );
    };

    const handleSave = async () => {
        const saveData: CharacterSaveData = {
            name,
            description,
            type,
            stats,
            learnedAbilities,
            classId,
        };
        await onSave(saveData);
        onClose();
    };

    // NEW: Determine which ability trees to show based on the selected class.
    const visibleAbilityTrees =
        characterClasses.find((c) => c.id === classId)?.abilityTreeIds ?? null;

    const filteredAbilityTrees = visibleAbilityTrees
        ? abilityTrees.filter((tree) => visibleAbilityTrees.includes(tree.id!))
        : abilityTrees;

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
                                {/* NEW: Class Selection Dropdown */}
                                <div className="form__group">
                                    <label htmlFor="charClass" className="form__label">
                                        Class
                                    </label>
                                    <select
                                        id="charClass"
                                        value={classId ?? ''}
                                        onChange={(e) =>
                                            setClassId(
                                                e.target.value
                                                    ? parseInt(e.target.value, 10)
                                                    : undefined,
                                            )
                                        }
                                        className="form__select"
                                    >
                                        <option value="">None</option>
                                        {characterClasses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
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
                                                        value={stats[def.id!] ?? ''}
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
                                        {filteredAbilityTrees.length > 0 ? (
                                            filteredAbilityTrees.map((tree) => (
                                                <details
                                                    key={tree.id}
                                                    className="ability-tree-group"
                                                    open
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
                                                No ability trees are available for this class.
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
