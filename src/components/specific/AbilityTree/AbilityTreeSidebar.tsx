// src/components/specific/AbilityTree/AbilityTreeSidebar.tsx
import type { FC } from 'react';
import type { AbilityTree } from '../../../db/types';
import { AbilityTreeTierControls } from './AbilityTreeTierControls';

interface AbilityTreeSidebarProps {
    tree: AbilityTree;
    name: string;
    onNameChange: (value: string) => void;
    description: string;
    onDescriptionChange: (value: string) => void;
    tier: number;
    onTierChange: (value: number) => void;
    iconUrl: string;
    onIconUrlChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    tierCount: number;
    onAddTier: () => void;
    onRemoveTier: () => void;
    // NEW: Add props for the attachment point toggle
    isAttachmentPoint: boolean;
    onIsAttachmentPointChange: (value: boolean) => void;
}

/**
 * REWORKED: The sidebar now includes a checkbox to create an ability
 * as an Attachment Point.
 */
export const AbilityTreeSidebar: FC<AbilityTreeSidebarProps> = ({
    tree,
    name,
    onNameChange,
    description,
    onDescriptionChange,
    tier,
    onTierChange,
    iconUrl,
    onIconUrlChange,
    onSubmit,
    tierCount,
    onAddTier,
    onRemoveTier,
    // NEW: Destructure the new props
    isAttachmentPoint,
    onIsAttachmentPointChange,
}) => {
    return (
        <aside className="ability-editor-page__sidebar">
            <div>
                <h3 className="sidebar__title">Create New Ability</h3>
                <form onSubmit={onSubmit} className="form">
                    {/* Form groups for name, description, icon, tier... */}
                    <div className="form__group">
                        <label htmlFor="abilityName" className="form__label">
                            Ability Name
                        </label>
                        <input
                            id="abilityName"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
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
                            onChange={(e) => onDescriptionChange(e.target.value)}
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
                            onChange={(e) => onIconUrlChange(e.target.value)}
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
                            onChange={(e) => onTierChange(parseInt(e.target.value, 10))}
                            className="form__select"
                        >
                            {Array.from({ length: tierCount }, (_, i) => i + 1).map((tierNum) => (
                                <option key={tierNum} value={tierNum}>
                                    Tier {tierNum}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* NEW: Checkbox to designate as an attachment point */}
                    <div className="form__group form__group--checkbox">
                        <input
                            id="isAttachmentPoint"
                            type="checkbox"
                            checked={isAttachmentPoint}
                            onChange={(e) => onIsAttachmentPointChange(e.target.checked)}
                            className="form__checkbox"
                        />
                        <label htmlFor="isAttachmentPoint" className="form__label--checkbox">
                            Is Attachment Point (Socket)
                        </label>
                    </div>

                    <button type="submit" className="button button--primary button--full-width">
                        Create
                    </button>
                </form>
            </div>

            <AbilityTreeTierControls
                tierCount={tierCount}
                onAddTier={onAddTier}
                onRemoveTier={onRemoveTier}
            />
        </aside>
    );
};
