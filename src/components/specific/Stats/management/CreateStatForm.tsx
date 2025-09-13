// src/components/specific/Stats/management/CreateStatForm.tsx

/**
 * COMMIT: feat(stats): extract CreateStatForm component
 *
 * Rationale:
 * As part of the StatManager refactor, the form for creating new stat
 * definitions has been extracted into this dedicated component. This follows
 * the single-responsibility principle, separating the concerns of stat
 * creation from stat listing and management.
 *
 * Implementation Details:
 * - All state related to the form fields (e.g., `newStatName`) has been moved
 * into this component.
 * - The `handleSubmit` logic is now self-contained here.
 * - The component accepts an `onStatCreated` callback prop, which it invokes
 * upon successful creation to notify the parent `StatManager` to refresh its
 * data. This maintains a clean, unidirectional data flow.
 */
import { useState, type FC } from 'react';
import { useWorld } from '../../../../context/feature/WorldContext';
import { useModal } from '../../../../context/global/ModalContext';
import { addStatDefinition } from '../../../../db/queries/character/stat.queries';

interface CreateStatFormProps {
    onStatCreated: () => void;
}

export const CreateStatForm: FC<CreateStatFormProps> = ({ onStatCreated }) => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [abbreviation, setAbbreviation] = useState('');
    const [defaultValue, setDefaultValue] = useState(10);
    const [type, setType] = useState<'primary' | 'derived' | 'resource'>('primary');

    const resetForm = () => {
        setName('');
        setDescription('');
        setAbbreviation('');
        setDefaultValue(10);
        setType('primary');
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!name.trim() || !abbreviation.trim() || !selectedWorld?.id) {
            showModal('alert', {
                title: 'Invalid Input',
                message: 'Stat Name and Abbreviation cannot be empty.',
            });
            return;
        }

        try {
            await addStatDefinition({
                name,
                description,
                abbreviation,
                defaultValue,
                type,
                worldId: selectedWorld.id,
            });
            resetForm();
            onStatCreated(); // Notify parent to refetch
        } catch (err) {
            console.error('Failed to save the new stat definition:', err);
            showModal('alert', {
                title: 'Save Error',
                message: 'Failed to save the new stat definition.',
            });
        }
    };

    return (
        <div className="panel__form-section">
            <h3 className="panel__form-title">Create New Stat</h3>
            <form onSubmit={handleSubmit} className="form">
                <div className="grid grid-cols-2 gap-4">
                    <div className="form__group">
                        <label htmlFor="statName" className="form__label">
                            Stat Name
                        </label>
                        <input
                            id="statName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form__input"
                            placeholder="e.g., Strength"
                        />
                    </div>
                    <div className="form__group">
                        <label htmlFor="statAbbr" className="form__label">
                            Abbreviation
                        </label>
                        <input
                            id="statAbbr"
                            type="text"
                            value={abbreviation}
                            onChange={(e) => setAbbreviation(e.target.value)}
                            className="form__input"
                            placeholder="e.g., STR"
                        />
                    </div>
                    <div className="form__group">
                        <label htmlFor="statType" className="form__label">
                            Type
                        </label>
                        <select
                            id="statType"
                            value={type}
                            onChange={(e) => setType(e.target.value as typeof type)}
                            className="form__select"
                        >
                            <option value="primary">Primary</option>
                            <option value="derived">Derived</option>
                            <option value="resource">Resource</option>
                        </select>
                    </div>
                    <div className="form__group">
                        <label htmlFor="statDefault" className="form__label">
                            Default Value
                        </label>
                        <input
                            id="statDefault"
                            type="number"
                            value={defaultValue}
                            onChange={(e) => setDefaultValue(parseInt(e.target.value, 10) || 0)}
                            className="form__input"
                        />
                    </div>
                </div>
                <div className="form__group">
                    <label htmlFor="statDesc" className="form__label">
                        Description
                    </label>
                    <input
                        id="statDesc"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="form__input"
                        placeholder="A brief summary of what this stat represents."
                    />
                </div>
                <button type="submit" className="button button--primary">
                    Create Stat
                </button>
            </form>
        </div>
    );
};
