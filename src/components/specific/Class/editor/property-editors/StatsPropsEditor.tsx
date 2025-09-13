// src/components/specific/Class/editor/property-editors/StatsPropsEditor.tsx

/**
 * COMMIT: refactor(class-sheet): connect StatsPropsEditor to Zustand store
 *
 * Rationale:
 * As part of Phase 3.2, this commit refactors the StatsPropsEditor to be
 * self-sufficient by connecting it directly to the `useClassSheetStore`.
 *
 * Implementation Details:
 * - The component's props interface has been removed.
 * - It now imports and uses the `useClassSheetStore` hook to select the
 * `characterClass` and the `updateBaseStat` action.
 * - This change eliminates the need to pass props down from the main
 * sidebar, decoupling the component and resolving the TypeScript errors
 * in `BlockSpecificPropertiesEditor`.
 */
import { useState, useEffect, type FC } from 'react';
import { useWorld } from '../../../../../context/feature/WorldContext';
import { getStatDefinitionsForWorld } from '../../../../../db/queries/character/stat.queries';
import type { StatDefinition } from '../../../../../db/types';
// NEW: Import the Zustand store.
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';

// This component no longer needs props.
export const StatsPropsEditor: FC = () => {
    // --- ZUSTAND STORE ---
    const { characterClass, updateBaseStat } = useClassSheetStore((state) => ({
        // Select the specific state and actions needed.
        characterClass: state.editableClass,
        updateBaseStat: state.updateBaseStat,
    }));

    // --- LOCAL STATE & DATA FETCHING ---
    const { selectedWorld } = useWorld();
    const [statDefs, setStatDefs] = useState<StatDefinition[]>([]);

    useEffect(() => {
        if (selectedWorld?.id) {
            getStatDefinitionsForWorld(selectedWorld.id).then(setStatDefs);
        }
    }, [selectedWorld]);

    // --- RENDER LOGIC ---
    if (!characterClass) {
        // This can happen briefly while the store is initializing.
        return null;
    }

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
                        onChange={(e) => updateBaseStat(def.id!, parseInt(e.target.value, 10) || 0)}
                    />
                </div>
            ))}
        </div>
    );
};
