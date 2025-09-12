// src/components/specific/AbilityTree/Sidebar/AbilityTreeTierControls.tsx

/**
 * COMMIT: refactor(ability-tree): connect TierControls to reactive context
 *
 * This commit completes the state management refactor by connecting the
 * `AbilityTreeTierControls` component to the `AbilityTreeEditorContext`.
 *
 * Rationale:
 * This was the final component that relied on props for its state. By
 * updating it to consume the context, we have fully realized the goal of a
 * reactive, centralized state, fixing the stale tier counter bug at its source.
 *
 * Implementation Details:
 * - The component's props interface has been removed entirely.
 * - It now uses the `useAbilityTreeEditor` hook to source the reactive
 * `currentTree` object (for the tier count) and the `handleAddTier` and
 * `handleRemoveTier` functions.
 * - The component is now fully decoupled and self-sufficient.
 */
import type { FC } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useAbilityTreeEditor } from '../../../../context/feature/AbilityTreeEditorContext';

// The component no longer needs to accept any props.
export const AbilityTreeTierControls: FC = () => {
    // It sources everything it needs directly from the context.
    const { currentTree, handleAddTier, handleRemoveTier } = useAbilityTreeEditor();

    return (
        <div className="tier-controls">
            <h4 className="tier-controls__title">Tiers</h4>
            <div className="tier-controls__actions">
                <button
                    onClick={handleRemoveTier}
                    className="tier-controls__button"
                    disabled={currentTree.tierCount <= 1}
                    title="Remove Last Tier"
                >
                    <Minus size={16} />
                </button>
                {/* The tier count is now read from the reactive `currentTree` object */}
                <span className="tier-controls__display">{currentTree.tierCount}</span>
                <button
                    onClick={handleAddTier}
                    className="tier-controls__button"
                    title="Add New Tier"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
};
