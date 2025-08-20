// src/components/specific/Class/ManageClassModal.tsx
import { useState, useEffect, type FC } from 'react';
import { useWorld } from '../../../context/WorldContext';
import { getStatDefinitionsForWorld } from '../../../db/queries/rule.queries';
import type { CharacterClass, StatDefinition } from '../../../db/types';

/**
 * The shape of the data that this modal will save.
 * It's a clean subset of the full CharacterClass type.
 * FIX: Removed abilityTreeIds as it no longer exists on CharacterClass.
 */
export type ClassSaveData = {
    name: string;
    description: string;
    baseStats: { [statId: number]: number };
};

export interface ManageClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ClassSaveData) => Promise<void>;
    classToEdit: CharacterClass | null;
}

/**
 * A specialized modal for creating and editing Character Classes,
 * including their base stats.
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
    // FIX: Removed abilityTreeIds state.

    // --- Data Loading State ---
    const [statDefs, setStatDefs] = useState<StatDefinition[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Effect to fetch all necessary definition data (stats) when the modal opens.
    useEffect(() => {
        if (isOpen && selectedWorld?.id) {
            setIsLoading(true);
            getStatDefinitionsForWorld(selectedWorld.id).then((statData) => {
                setStatDefs(statData);
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
                // FIX: Removed logic for setting abilityTreeIds.
            } else {
                // Reset for a new class
                setName('');
                setDescription('');
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

    // FIX: Removed handleAbilityTreeToggle function.

    const handleSave = async () => {
        // FIX: Removed abilityTreeIds from the save payload.
        const saveData: ClassSaveData = { name, description, baseStats };
        await onSave(saveData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                // FIX: Simplified to a single column layout.
                style={{ maxWidth: '500px' }}
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
                        <form className="form">
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
                                                        handleStatChange(def.id!, e.target.value)
                                                    }
                                                    className="form__input"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
