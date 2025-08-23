// src/components/specific/AbilityTree/Sidebar/TierBar.tsx
import type { FC } from 'react';
// Import centralized constants
import { TIER_HEIGHT } from '../../../../constants/abilityTree.constants';

// REWORKED: The interface now accepts a viewportZoom prop.
interface TierBarProps {
    tierCount: number;
    viewportYOffset: number;
    viewportZoom: number;
}

/**
 * A dedicated component that displays the tier labels for the ability tree editor.
 * It now scales and pans in sync with the main canvas.
 */
export const TierBar: FC<TierBarProps> = ({ tierCount, viewportYOffset, viewportZoom }) => {
    return (
        <div className="tier-bar">
            {/* REWORKED: The transform now includes scale to match the canvas zoom.
          transform-origin: top is crucial to ensure it scales from the top edge,
          keeping it perfectly aligned with the canvas grid lines during zoom. */}
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
