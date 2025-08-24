// src/components/specific/AbilityTree/Canvas/TierBar.tsx

/**
 * COMMIT: chore(ability-tree): relocate TierBar to canvas directory
 *
 * This commit moves the `TierBar` component to its new, more logical home
 * within the `/Canvas` subdirectory as part of the final cleanup phase.
 *
 * Rationale:
 * The `TierBar` is a visual component directly related to the canvas layout
 * and viewport. Placing it alongside the `AbilityTreeCanvas` and `DragPreview`
 * components improves the organizational clarity of the module.
 *
 * No functional changes were required. The component's props-based interface
 * for receiving viewport data remains the most efficient implementation for
 * this presentational component.
 */
import type { FC } from 'react';
import { TIER_HEIGHT } from '../../../../constants/abilityTree.constants';

interface TierBarProps {
    tierCount: number;
    viewportYOffset: number;
    viewportZoom: number;
}

export const TierBar: FC<TierBarProps> = ({ tierCount, viewportYOffset, viewportZoom }) => {
    return (
        <div className="tier-bar">
            {/* The transform style allows this component to pan and zoom
                in perfect sync with the main React Flow canvas. */}
            <div
                className="tier-bar__content"
                style={{
                    transform: `translateY(${viewportYOffset}px) scale(${viewportZoom})`,
                    transformOrigin: 'top',
                }}
            >
                {Array.from({ length: tierCount }, (_, i) => i + 1).map((tierNum) => (
                    <div
                        key={`tier-label-${tierNum}`}
                        className="tier-bar__label"
                        style={{ height: `${TIER_HEIGHT}px` }}
                    >
                        Tier {tierNum}
                    </div>
                ))}
            </div>
        </div>
    );
};
