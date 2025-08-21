// src/components/specific/AbilityTree/AbilityTreeTierControls.tsx
import type { FC } from 'react';
import { Plus, Minus } from 'lucide-react';

interface AbilityTreeTierControlsProps {
    tierCount: number;
    onAddTier: () => void;
    onRemoveTier: () => void;
}

/**
 * A UI component within the editor sidebar that allows the user to
 * add or remove tiers from the current ability tree.
 */
export const AbilityTreeTierControls: FC<AbilityTreeTierControlsProps> = ({
    tierCount,
    onAddTier,
    onRemoveTier,
}) => {
    return (
        <div className="tier-controls">
            <h4 className="tier-controls__title">Tiers</h4>
            <div className="tier-controls__actions">
                <button
                    onClick={onRemoveTier}
                    className="tier-controls__button"
                    disabled={tierCount <= 1} // Can't have less than 1 tier
                    title="Remove Last Tier"
                >
                    <Minus size={16} />
                </button>
                <span className="tier-controls__display">{tierCount}</span>
                <button onClick={onAddTier} className="tier-controls__button" title="Add New Tier">
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
};
