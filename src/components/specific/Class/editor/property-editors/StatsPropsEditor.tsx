// src/components/specific/Class/editor/property-editors/StatsPropsEditor.tsx

/**
 * COMMIT: refactor(class-sheet): remove local fetching from StatsPropsEditor
 *
 * Rationale:
 * Following the centralization of data fetching within the Zustand store, this
 * component no longer needs to manage its own data loading. This change
 * removes all local state and effects related to fetching stat definitions.
 *
 * Implementation Details:
 * - Removed the `useState` and `useEffect` hooks for managing `statDefs` and
 * loading state.
 * - Removed the `useWorld` context hook and the direct call to the database.
 * - The component's `useClassSheetStore` hook has been updated to select the
 * `statDefinitions` array directly from the central store.
 * - This simplifies the component significantly, making it a "dumb" component
 * that purely renders data provided by the store.
 */
import type { FC } from 'react';
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';

// This component is now fully controlled by the Zustand store and has no internal logic.
export const StatsPropsEditor: FC = () => {
    // --- ZUSTAND STORE ---
    // REWORK: Now selects all necessary data directly from the central store.
    const { characterClass, updateBaseStat, statDefinitions } = useClassSheetStore((state) => ({
        characterClass: state.editableClass,
        updateBaseStat: state.updateBaseStat,
        statDefinitions: state.statDefinitions, // Get pre-fetched data.
    }));

    // --- RENDER LOGIC ---
    // If the class data hasn't been loaded into the store yet, render nothing.
    if (!characterClass) {
        return null;
    }

    // If there are no stat definitions for this world, display a message.
    if (statDefinitions.length === 0) {
        return <p className="panel__empty-message--small">No stats defined in this world.</p>;
    }

    // Render the grid of stat inputs.
    return (
        <div className="properties-sidebar__grid">
            {statDefinitions.map((def) => (
                <div key={def.id} className="form__group">
                    <label className="form__label">{def.name}</label>
                    <input
                        type="number"
                        className="form__input"
                        // The value is either the class's base stat or the definition's default.
                        value={characterClass.baseStats[def.id!] ?? def.defaultValue}
                        onChange={(e) => updateBaseStat(def.id!, parseInt(e.target.value, 10) || 0)}
                    />
                </div>
            ))}
        </div>
    );
};
