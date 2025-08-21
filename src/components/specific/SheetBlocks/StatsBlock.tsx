// src/components/specific/SheetBlocks/StatsBlock.tsx
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

    // Create a map for quick lookups
    const statDefMap = new Map(statDefs.map((def) => [def.id, def]));

    return (
        <div className="stats-block">
            {Object.entries(baseStats).map(([statId, value]) => {
                const def = statDefMap.get(Number(statId));
                if (!def) return null;

                return (
                    <div key={statId} className="stat-item">
                        <span className="stat-item__value">{value}</span>
                        <span className="stat-item__name">{def.name}</span>
                        <span className="stat-item__abbr">({def.abbreviation})</span>
                    </div>
                );
            })}
        </div>
    );
};
