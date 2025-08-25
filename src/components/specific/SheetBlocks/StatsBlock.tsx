// src/components/specific/SheetBlocks/StatsBlock.tsx

/**
 * COMMIT: fix(character-sheet): correct StatsBlock rendering logic
 *
 * Rationale:
 * The StatsBlock was previously iterating over the character's `stats` object.
 * This meant if a new stat was defined for the world *after* a character was
 * created, it would never appear on their sheet. The panel also appeared
 * empty if the character had no stats defined at all.
 *
 * Implementation Details:
 * - The component's rendering logic has been inverted. It now iterates over the
 * world's `statDefs` array, which is the single source of truth for what
 * stats exist.
 * - For each stat definition, it looks up the corresponding value in the
 * `baseStats` prop. If a value exists, it's displayed; otherwise, it
 * gracefully shows a dash ('-').
 * - This makes the component far more robust and ensures the UI always
 * accurately reflects the world's current ruleset.
 */
import { useState, useEffect, type FC } from 'react';
import { useWorld } from '../../../context/WorldContext';
import { getStatDefinitionsForWorld } from '../../../db/queries/stat.queries';
import type { StatDefinition } from '../../../db/types';

export interface StatsBlockProps {
    baseStats: { [statId: number]: number };
}

/**
 * A sheet block component for displaying a character's statistics.
 */
export const StatsBlock: FC<StatsBlockProps> = ({ baseStats }) => {
    const { selectedWorld } = useWorld();
    const [statDefs, setStatDefs] = useState<StatDefinition[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (selectedWorld?.id) {
            getStatDefinitionsForWorld(selectedWorld.id).then((defs) => {
                setStatDefs(defs);
                setIsLoading(false);
            });
        }
    }, [selectedWorld]);

    if (isLoading) {
        return <div className="stats-block stats-block--loading">Loading Stats...</div>;
    }

    if (statDefs.length === 0) {
        return <p className="panel__empty-message">No stats defined for this world.</p>;
    }

    return (
        <div className="stats-block">
            {/* REWORK: Iterate over the definitions, not the character's stats. */}
            {statDefs.map((def) => {
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
