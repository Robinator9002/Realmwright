// src/components/specific/Class/editor/property-editors/AbilityTreePropsEditor.tsx

/**
 * COMMIT: refactor(class-sheet): remove local fetching from AbilityTreePropsEditor
 *
 * Rationale:
 * To align with the new centralized data fetching strategy, this component has
 * been refactored to remove its local state and data fetching `useEffect`. It
 * now relies entirely on the pre-fetched data available in the Zustand store.
 *
 * Implementation Details:
 * - Removed the `useState` and `useEffect` hooks for managing `allTrees`.
 * - Removed the `useWorld` context hook and the direct database query.
 * - The `useClassSheetStore` hook now selects the `abilityTrees` array from
 * the central state.
 * - This change simplifies the component's logic, improves performance by
 * eliminating a redundant database call, and reinforces the store as the
 * single source of truth for editor data.
 */
import type { FC } from 'react';
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';

// This component is now fully controlled by the Zustand store.
export const AbilityTreePropsEditor: FC = () => {
    // --- ZUSTAND STORE ---
    // REWORK: Selects all necessary data, including the pre-fetched ability trees,
    // directly from the central store.
    const { selectedBlock, updateBlockContent, abilityTrees } = useClassSheetStore((state) => ({
        selectedBlock: state.selectedBlock,
        updateBlockContent: state.updateBlockContent,
        abilityTrees: state.abilityTrees, // Get pre-fetched data.
    }));

    // --- RENDER LOGIC ---
    // If no block is selected, render nothing. This is a safeguard.
    if (!selectedBlock) {
        return null;
    }

    // Render the dropdown select for choosing an ability tree.
    return (
        <div className="form__group">
            <label className="form__label">Ability Tree</label>
            <select
                className="form__select"
                value={selectedBlock.content ?? ''}
                onChange={(e) =>
                    // On change, update the block's content with the selected tree's ID.
                    updateBlockContent(
                        selectedBlock.id,
                        e.target.value ? parseInt(e.target.value, 10) : undefined,
                    )
                }
            >
                <option value="">-- Select a Tree --</option>
                {abilityTrees.map((tree) => (
                    <option key={tree.id} value={tree.id}>
                        {tree.name}
                    </option>
                ))}
            </select>
        </div>
    );
};
