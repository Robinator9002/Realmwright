// src/components/specific/AbilityTree/TierBar.tsx
import type { FC } from 'react';

const TIER_HEIGHT = 150; // This should match the constant in the canvas

interface TierBarProps {
    tierCount: number;
}

/**
 * A dedicated component that displays the tier labels for the ability tree editor.
 * It sits alongside the canvas as its own column.
 */
export const TierBar: FC<TierBarProps> = ({ tierCount }) => {
    return (
        <div className="tier-bar">
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
    );
};
