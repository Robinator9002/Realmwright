// src/components/specific/Class/editor/property-editors/AbilityTreePropsEditor.tsx

/**
 * COMMIT: refactor(class-sheet): connect AbilityTreePropsEditor to Zustand store
 *
 * Rationale:
 * Following the pattern of Phase 3.2, this commit refactors the
 * AbilityTreePropsEditor to connect directly to the `useClassSheetStore`.
 *
 * Implementation Details:
 * - The component's props interface has been removed.
 * - It now uses the `useClassSheetStore` hook to select the `selectedBlock`
 * (leveraging the derived state from the store) and the
 * `updateBlockContent` action.
 * - This resolves the final TypeScript error in the parent component and
 * completes the decoupling of the property editors.
 */
import { useState, useEffect, type FC } from 'react';
import { useWorld } from '../../../../../context/feature/WorldContext';
import { getAbilityTreesForWorld } from '../../../../../db/queries/character/ability.queries';
import type { AbilityTree } from '../../../../../db/types';
// NEW: Import the Zustand store.
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';

// This component no longer needs props.
export const AbilityTreePropsEditor: FC = () => {
    // --- ZUSTAND STORE ---
    const { selectedBlock, updateBlockContent } = useClassSheetStore((state) => ({
        // Use the derived selectedBlock from the store.
        selectedBlock: state.selectedBlock,
        updateBlockContent: state.updateBlockContent,
    }));

    // --- LOCAL STATE & DATA FETCHING ---
    const { selectedWorld } = useWorld();
    const [allTrees, setAllTrees] = useState<AbilityTree[]>([]);

    useEffect(() => {
        if (selectedWorld?.id) {
            getAbilityTreesForWorld(selectedWorld.id).then(setAllTrees);
        }
    }, [selectedWorld]);

    // --- RENDER LOGIC ---
    if (!selectedBlock) {
        return null;
    }

    return (
        <div className="form__group">
            <label className="form__label">Ability Tree</label>
            <select
                className="form__select"
                value={selectedBlock.content ?? ''}
                onChange={(e) =>
                    updateBlockContent(
                        selectedBlock.id,
                        e.target.value ? parseInt(e.target.value, 10) : undefined,
                    )
                }
            >
                <option value="">-- Select a Tree --</option>
                {allTrees.map((tree) => (
                    <option key={tree.id} value={tree.id}>
                        {tree.name}
                    </option>
                ))}
            </select>
        </div>
    );
};
