// src/components/specific/SheetBlocks/character/StatsBlock.tsx

/**
 * COMMIT: refactor(character-sheet): make StatsBlock a pure presentational component
 *
 * Rationale:
 * To align with the new architecture of separating data logic from
 * presentation, this component has been refactored to be a "pure" or "dumb"
 * component. It no longer fetches its own data or manages its own state.
 *
 * Implementation Details:
 * - Removed all React hooks (`useState`, `useEffect`) and the `useWorld` context.
 * - The component's props interface has been updated to accept the
 * `statDefinitions` array directly.
 * - All data loading and context-aware logic has been eliminated. The
 * component now solely focuses on mapping over the props it receives to
 * render the UI, making it more reusable and predictable.
 */
import type { FC } from 'react';
import type { StatDefinition } from '../../../../db/types';

// REWORK: The props interface now includes all data needed for rendering.
export interface StatsBlockProps {
    baseStats: { [statId: number]: number };
    statDefinitions: StatDefinition[];
}

/**
 * A sheet block component for displaying a character's statistics. It is a
 * pure presentational component that receives all required data via props.
 */
export const StatsBlock: FC<StatsBlockProps> = ({ baseStats, statDefinitions }) => {
    // RENDER LOGIC:
    // If there are no stat definitions, display a clear message.
    if (statDefinitions.length === 0) {
        return <p className="panel__empty-message">No stats defined for this world.</p>;
    }

    // Map over the provided stat definitions to render each stat item.
    return (
        <div className="stats-block">
            {statDefinitions.map((def) => {
                // Look up the character's value for the current stat definition.
                const value = baseStats[def.id!] ?? '-';
                return (
                    <div key={def.id} className="stat-item">
                        <span className="stat-item__value">{value}</span>
                        <span className="stat-item__name">{def.name}</span>
                        <span className="stat-item__abbr">({def.abbreviation})</span>
                    </div>
                );
            })}
        </div>
    );
};
