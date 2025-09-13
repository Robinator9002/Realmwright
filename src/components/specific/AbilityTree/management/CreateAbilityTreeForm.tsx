// src/components/specific/AbilityTree/management/CreateAbilityTreeForm.tsx

/**
 * COMMIT: feat(abilities): extract CreateAbilityTreeForm component
 *
 * Rationale:
 * As part of the AbilityManager refactor, the form for creating new ability
 * trees has been extracted into this dedicated component. This follows the
 * single-responsibility principle, separating the concerns of tree creation
 * from tree listing and management.
 *
 * Implementation Details:
 * - All state related to the form fields (e.g., `newTreeName`) has been
 * moved into this component.
 * - The `handleSubmit` logic is now self-contained here.
 * - The component accepts an `onTreeCreated` callback prop, which it
 * invokes upon successful creation to notify the parent `AbilityManager`
 * to refresh its data.
 */
import { useState, type FC } from 'react';
import { useWorld } from '../../../../context/feature/WorldContext';
import { addAbilityTree } from '../../../../db/queries/character/ability.queries';

interface CreateAbilityTreeFormProps {
    onTreeCreated: () => void;
}

export const CreateAbilityTreeForm: FC<CreateAbilityTreeFormProps> = ({ onTreeCreated }) => {
    const { selectedWorld } = useWorld();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !selectedWorld?.id) return;

        try {
            await addAbilityTree({
                name,
                description,
                worldId: selectedWorld.id,
            });
            setName('');
            setDescription('');
            onTreeCreated();
        } catch (error) {
            console.error('Failed to add ability tree:', error);
        }
    };

    return (
        <div className="panel__form-section">
            <h3 className="panel__form-title">Create New Tree</h3>
            <form onSubmit={handleSubmit} className="form">
                <div className="form__group">
                    <label htmlFor="newTreeName" className="form__label">
                        New Tree Name
                    </label>
                    <input
                        id="newTreeName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
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
    );
};
