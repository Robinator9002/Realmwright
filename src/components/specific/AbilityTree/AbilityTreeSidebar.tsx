// src/components/specific/AbilityTree/AbilityTreeSidebar.tsx
import type { FC } from 'react';
import type { AbilityTree } from '../../../db/types';
// NEW: Import the tier controls component
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
    // NEW: Add props for managing the tier count
    tierCount: number;
    onAddTier: () => void;
    onRemoveTier: () => void;
}

/**
 * REWORKED: The sidebar now includes controls for managing the tree's tiers.
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
    // NEW: Destructure the new props
    tierCount,
    onAddTier,
    onRemoveTier,
}) => {
    return (
        <aside className="ability-editor-page__sidebar">
            <div>
                <h3 className="sidebar__title">Create New Ability</h3>
                <form onSubmit={onSubmit} className="form">
                    <div className="form__group">
                        <label htmlFor="abilityName" className="form__label">
                            Ability Name
                        </label>
                        <input
                            id="abilityName"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                            placeholder="e.g., Fireball"
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
                            placeholder="A short description of the ability."
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
                            {/* The dropdown now uses the dynamic tierCount prop */}
                            {Array.from({ length: tierCount }, (_, i) => i + 1).map((tierNum) => (
                                <option key={tierNum} value={tierNum}>
                                    Tier {tierNum}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="button button--primary button--full-width">
                        Create Ability
                    </button>
                </form>
            </div>

            {/* NEW: Render the tier controls at the bottom of the sidebar */}
            <AbilityTreeTierControls
                tierCount={tierCount}
                onAddTier={onAddTier}
                onRemoveTier={onRemoveTier}
            />
        </aside>
    );
};
