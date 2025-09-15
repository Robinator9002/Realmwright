// src/components/specific/Class/editor/property-editors/AbilityTreePropsEditor.tsx

/**
 * COMMIT: fix(class-sheet): correct state property access in AbilityTreePropsEditor
 *
 * Rationale:
 * A typo was causing two TypeScript errors in this component:
 * 1. It was attempting to access `state.abilityTrees` from the Zustand store,
 * but the correct property name is `allAbilityTrees`.
 * 2. The `.map` function was implicitly assigning an 'any' type to the `tree`
 * parameter because the initial state for `allAbilityTrees` could be an
 * empty array.
 *
 * Implementation Details:
 * - Changed `state.abilityTrees` to `state.allAbilityTrees` in the
 * `useClassSheetStore` selector to match the store's state definition.
 * - Explicitly typed the `tree` parameter in the `.map` function as `AbilityTree`
 * to resolve the implicit 'any' error.
 * - Imported the `AbilityTree` type to support this change.
 */
import type { FC } from 'react';
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';
import type { AbilityTree } from '../../../../../db/types';

// This component is now fully controlled by the Zustand store.
export const AbilityTreePropsEditor: FC = () => {
    // --- ZUSTAND STORE ---
    const { selectedBlock, updateBlockContent, abilityTrees } = useClassSheetStore((state) => ({
        selectedBlock: state.selectedBlock,
        updateBlockContent: state.updateBlockContent,
        // FIX: Corrected property name from abilityTrees to allAbilityTrees.
        abilityTrees: state.allAbilityTrees,
    }));

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
                {/* FIX: Explicitly type the 'tree' parameter. */}
                {abilityTrees.map((tree: AbilityTree) => (
                    <option key={tree.id} value={tree.id}>
                        {tree.name}
                    </option>
                ))}
            </select>
        </div>
    );
};
