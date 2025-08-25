// src/components/specific/AbilityTree/Sidebar/CreateAbilityPanel.tsx

/**
 * COMMIT: fix(ability-tree): use correct 'currentTree' property from context
 *
 * This commit resolves a runtime crash in the `CreateAbilityPanel`.
 *
 * Rationale:
 * A previous refactor renamed the `tree` property in the editor context to
 * `currentTree` for better clarity. This component was not updated to reflect
 * that change, causing it to attempt to destructure a non-existent `tree`
 * property, which resulted in an `undefined` variable and a subsequent crash
 * when accessing `.tierCount`.
 *
 * Implementation Details:
 * - The destructuring from the `useAbilityTreeEditor` hook has been updated to
 * use `currentTree` instead of `tree`.
 * - The component now correctly reads the `tierCount` from the reactive
 * `currentTree` object, resolving the error.
 */
import { useState, type FC } from 'react';
import { useAbilityTreeEditor } from '../../../../context/AbilityTreeEditorContext';

export const CreateAbilityPanel: FC = () => {
    // FIX: Destructure 'currentTree' instead of the old 'tree' variable.
    const { currentTree, handleAddAbility } = useAbilityTreeEditor();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tier, setTier] = useState(1);
    const [iconUrl, setIconUrl] = useState('');
    const [isAttachmentPoint, setIsAttachmentPoint] = useState(false);
    const [allowedAttachmentType, setAllowedAttachmentType] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleAddAbility(
            name,
            description,
            tier,
            iconUrl,
            isAttachmentPoint,
            allowedAttachmentType,
        );
        setName('');
        setDescription('');
        setTier(1);
        setIconUrl('');
        setIsAttachmentPoint(false);
        setAllowedAttachmentType('');
    };

    // Safeguard to prevent rendering if the context is not fully ready.
    if (!currentTree) {
        return null;
    }

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
                        {/* FIX: Read tierCount from the correctly named 'currentTree' object. */}
                        {Array.from({ length: currentTree.tierCount }, (_, i) => i + 1).map(
                            (tierNum) => (
                                <option key={tierNum} value={tierNum}>
                                    Tier {tierNum}
                                </option>
                            ),
                        )}
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
