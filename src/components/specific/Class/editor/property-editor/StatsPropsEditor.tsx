// src/components/specific/Class/editor/property-editors/StatsPropsEditor.tsx

/**
 * COMMIT: feat(class-sheet): extract StatsPropsEditor component
 *
 * Rationale:
 * As part of the PropertiesSidebar refactor, this commit extracts the specific
 * UI for editing the properties of a StatsBlock into its own dedicated
 * component.
 *
 * Implementation Details:
 * - This component is responsible for fetching the world's stat definitions
 * and rendering a grid of number inputs.
 * - Each input allows the user to modify the `baseStats` value for the
 * corresponding stat on the CharacterClass blueprint.
 * - This isolates the data-fetching and rendering logic for this specific
 * block type, making the overall sidebar system more modular and easier
 * to maintain.
 */
import { useState, useEffect, type FC } from 'react';
import { useWorld } from '../../../../../context/feature/WorldContext';
import { getStatDefinitionsForWorld } from '../../../../../db/queries/character/stat.queries';
import type { CharacterClass, StatDefinition } from '../../../../../db/types';

interface StatsPropsEditorProps {
    characterClass: CharacterClass;
    onUpdateBaseStat: (statId: number, value: number) => void;
}

export const StatsPropsEditor: FC<StatsPropsEditorProps> = ({
    characterClass,
    onUpdateBaseStat,
}) => {
    const { selectedWorld } = useWorld();
    const [statDefs, setStatDefs] = useState<StatDefinition[]>([]);

    useEffect(() => {
        if (selectedWorld?.id) {
            getStatDefinitionsForWorld(selectedWorld.id).then(setStatDefs);
        }
    }, [selectedWorld]);

    if (statDefs.length === 0) {
        return <p className="panel__empty-message--small">No stats defined in this world.</p>;
    }

    return (
        <div className="properties-sidebar__grid">
            {statDefs.map((def) => (
                <div key={def.id} className="form__group">
                    <label className="form__label">{def.name}</label>
                    <input
                        type="number"
                        className="form__input"
                        value={characterClass.baseStats[def.id!] ?? def.defaultValue}
                        onChange={(e) =>
                            onUpdateBaseStat(def.id!, parseInt(e.target.value, 10) || 0)
                        }
                    />
                </div>
            ))}
        </div>
    );
};
