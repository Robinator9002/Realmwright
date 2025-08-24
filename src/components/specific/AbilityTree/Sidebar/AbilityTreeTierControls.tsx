// src/components/specific/AbilityTree/Sidebar/AbilityTreeTierControls.tsx

/**
 * COMMIT: chore(ability-tree): relocate TierControls to sidebar directory
 *
 * This commit moves the `AbilityTreeTierControls` component to its new,
 * logical home within the `/Sidebar` subdirectory.
 *
 * Rationale:
 * This component is an integral part of the sidebar's UI, providing the
 * primary controls for modifying the tree's tier structure. Placing it
 * alongside the other sidebar components enhances the organizational clarity
 * of the module.
 *
 * No functional changes were necessary for this component.
 */
import type { FC } from 'react';
import { Plus, Minus } from 'lucide-react';

interface AbilityTreeTierControlsProps {
    tierCount: number;
    onAddTier: () => void;
    onRemoveTier: () => void;
}

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
                    disabled={tierCount <= 1}
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
