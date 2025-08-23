// src/components/specific/AbilityTree/Sidebar/CreateAbilityPanel.tsx

/**
 * COMMIT: feat(ability-tree): create isolated CreateAbilityPanel component
 *
 * This commit introduces the `CreateAbilityPanel`, the first of the new,
 * decomposed sidebar components.
 *
 * Rationale:
 * As part of the plan to increase modularity, the logic for creating a new
 * ability has been extracted from the monolithic sidebar into this focused
 * component. It is responsible for rendering the creation form and handling
 * its own state.
 *
 * Implementation Details:
 * - The component manages all its form input values using local `useState` hooks.
 * - It consumes the `useAbilityTreeEditor` context hook to get access to the
 * current `tree` (for populating the tier dropdown) and the `handleAddAbility`
 * function.
 * - On form submission, it calls the context's `handleAddAbility` function with
 * its local state and then resets the form fields.
 * - This component has zero prop dependencies for its core logic, demonstrating
 * the power and cleanliness of the new context-based architecture.
 */
import { useState, type FC } from 'react';
import { useAbilityTreeEditor } from '../../../../context/AbilityTreeEditorContext';

export const CreateAbilityPanel: FC = () => {
    // This component now sources its required data and actions directly from the context.
    const { tree, handleAddAbility } = useAbilityTreeEditor();

    // All form state is managed locally within this component.
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tier, setTier] = useState(1);
    const [iconUrl, setIconUrl] = useState('');
    const [isAttachmentPoint, setIsAttachmentPoint] = useState(false);
    const [allowedAttachmentType, setAllowedAttachmentType] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Call the handler from the context to perform the database action.
        await handleAddAbility(
            name,
            description,
            tier,
            iconUrl,
            isAttachmentPoint,
            allowedAttachmentType,
        );
        // Reset the form to be ready for the next entry.
        setName('');
        setDescription('');
        setTier(1);
        setIconUrl('');
        setIsAttachmentPoint(false);
        setAllowedAttachmentType('');
    };

    return (
        <div>
            <h3 className="sidebar__title">Create New Ability</h3>
            <form onSubmit={handleSubmit} className="form">
                <div className="form__group">
                    <label htmlFor="abilityName" className="form__label">
                        Ability Name
                    </label>
                    <input
                        id="abilityName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Fireball or Weapon Socket"
                        className="form__input"
                        required
                    />
                </div>
                <div className="form__group">
                    <label htmlFor="abilityDesc" className="form__label">
                        Description
                    </label>
                    <textarea
                        id="abilityDesc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="A short description of the ability or socket."
                        className="form__textarea"
                        rows={3}
                    />
                </div>
                <div className="form__group">
                    <label htmlFor="abilityIcon" className="form__label">
                        Icon URL (Optional)
                    </label>
                    <input
                        id="abilityIcon"
                        value={iconUrl}
                        onChange={(e) => setIconUrl(e.target.value)}
                        placeholder="https://example.com/icon.png"
                        className="form__input"
                    />
                </div>
                <div className="form__group">
                    <label htmlFor="abilityTier" className="form__label">
                        Tier
                    </label>
                    <select
                        id="abilityTier"
                        value={tier}
                        onChange={(e) => setTier(parseInt(e.target.value, 10))}
                        className="form__select"
                    >
                        {/* The number of tiers is now read from the tree object in the context. */}
                        {Array.from({ length: tree.tierCount }, (_, i) => i + 1).map((tierNum) => (
                            <option key={tierNum} value={tierNum}>
                                Tier {tierNum}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form__group form__group--checkbox">
                    <input
                        id="isAttachmentPoint"
                        type="checkbox"
                        checked={isAttachmentPoint}
                        onChange={(e) => setIsAttachmentPoint(e.target.checked)}
                        className="form__checkbox"
                    />
                    <label htmlFor="isAttachmentPoint" className="form__label--checkbox">
                        Is Attachment Point (Socket)
                    </label>
                </div>

                {/* This input only appears if the ability is marked as a socket. */}
                {isAttachmentPoint && (
                    <div className="form__group">
                        <label htmlFor="allowedType" className="form__label">
                            Allowed Attachment Type
                        </label>
                        <input
                            id="allowedType"
                            value={allowedAttachmentType}
                            onChange={(e) => setAllowedAttachmentType(e.target.value)}
                            className="form__input"
                            placeholder="e.g., Weapon Mod (leave blank for any)"
                        />
                    </div>
                )}

                <button type="submit" className="button button--primary button--full-width">
                    Create
                </button>
            </form>
        </div>
    );
};
