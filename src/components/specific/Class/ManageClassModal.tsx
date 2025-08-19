// src/components/specific/Class/ManageClassModal.tsx
import { useState, useEffect, type FC } from 'react';
import { useWorld } from '../../../context/WorldContext';
import { getStatDefinitionsForWorld } from '../../../db/queries/rule.queries';
import { getAbilityTreesForWorld } from '../../../db/queries/ability.queries';
import type { CharacterClass, StatDefinition, AbilityTree } from '../../../db/types';

/**
 * The shape of the data that this modal will save.
 * It's a clean subset of the full CharacterClass type.
 */
export type ClassSaveData = {
    name: string;
    description: string;
    baseStats: { [statId: number]: number };
    abilityTreeIds: number[];
};

export interface ManageClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ClassSaveData) => Promise<void>;
    classToEdit: CharacterClass | null;
}

/**
 * A specialized modal for creating and editing Character Classes,
 * including their base stats and available ability trees.
 */
export const ManageClassModal: FC<ManageClassModalProps> = ({
    isOpen,
    onClose,
    onSave,
    classToEdit,
}) => {
    const { selectedWorld } = useWorld();
    const isEditMode = !!classToEdit;

    // --- Form State ---
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [baseStats, setBaseStats] = useState<{ [statId: number]: number }>({});
    const [abilityTreeIds, setAbilityTreeIds] = useState<number[]>([]);

    // --- Data Loading State ---
    const [statDefs, setStatDefs] = useState<StatDefinition[]>([]);
    const [abilityTrees, setAbilityTrees] = useState<AbilityTree[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Effect to fetch all necessary definition data (stats & trees) when the modal opens.
    useEffect(() => {
        if (isOpen && selectedWorld?.id) {
            setIsLoading(true);
            Promise.all([
                getStatDefinitionsForWorld(selectedWorld.id),
                getAbilityTreesForWorld(selectedWorld.id),
            ]).then(([statData, treeData]) => {
                setStatDefs(statData);
                setAbilityTrees(treeData);
                setIsLoading(false);
            });
        }
    }, [isOpen, selectedWorld]);

    // Effect to populate the form once data is loaded, either for editing or creation.
    useEffect(() => {
        if (isOpen && !isLoading) {
            if (isEditMode && classToEdit) {
                setName(classToEdit.name);
                setDescription(classToEdit.description);
                setBaseStats(classToEdit.baseStats || {});
                setAbilityTreeIds(classToEdit.abilityTreeIds || []);
            } else {
                // Reset for a new class
                setName('');
                setDescription('');
                setAbilityTreeIds([]);
                // Initialize stats with their default values
                const defaultStats: { [statId: number]: number } = {};
                for (const def of statDefs) {
                    defaultStats[def.id!] = def.defaultValue;
                }
                setBaseStats(defaultStats);
            }
        }
    }, [isOpen, isLoading, isEditMode, classToEdit, statDefs]);

    const handleStatChange = (statId: number, value: string) => {
        setBaseStats((prev) => ({ ...prev, [statId]: parseInt(value, 10) || 0 }));
    };

    const handleAbilityTreeToggle = (treeId: number) => {
        setAbilityTreeIds((prev) =>
            prev.includes(treeId) ? prev.filter((id) => id !== treeId) : [...prev, treeId],
        );
    };

    const handleSave = async () => {
        const saveData: ClassSaveData = { name, description, baseStats, abilityTreeIds };
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
                        {isEditMode ? `Edit ${classToEdit.name}` : 'Create New Class'}
                    </h2>
                    <button onClick={onClose} className="modal__close-button">
                        &times;
                    </button>
                </div>

                <div className="modal__content">
                    {isLoading ? (
                        <p>Loading definitions...</p>
                    ) : (
                        <form className="form grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* --- Left Column: Details & Stats --- */}
                            <div className="flex flex-col gap-4">
                                <div className="form__group">
                                    <label htmlFor="className" className="form__label">
                                        Class Name
                                    </label>
                                    <input
                                        id="className"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="form__input"
                                    />
                                </div>
                                <div className="form__group">
                                    <label htmlFor="classDesc" className="form__label">
                                        Description
                                    </label>
                                    <textarea
                                        id="classDesc"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="form__textarea"
                                        rows={3}
                                    />
                                </div>
                                {statDefs.length > 0 && (
                                    <div className="form__group">
                                        <label className="form__label">Base Statistics</label>
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
                                                        value={baseStats[def.id!] ?? ''}
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

                            {/* --- Right Column: Ability Trees --- */}
                            <div className="flex flex-col gap-4">
                                <div className="form__group">
                                    <label className="form__label">Available Ability Trees</label>
                                    <div className="ability-selection-container">
                                        {abilityTrees.length > 0 ? (
                                            abilityTrees.map((tree) => (
                                                <label
                                                    key={tree.id}
                                                    className="ability-checkbox-label"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={abilityTreeIds.includes(tree.id!)}
                                                        onChange={() =>
                                                            handleAbilityTreeToggle(tree.id!)
                                                        }
                                                    />
                                                    {tree.name}
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                No ability trees defined for this world. Create some
                                                in the 'Abilities' tab.
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
                        {isEditMode ? 'Save Changes' : 'Create Class'}
                    </button>
                </div>
            </div>
        </div>
    );
};
