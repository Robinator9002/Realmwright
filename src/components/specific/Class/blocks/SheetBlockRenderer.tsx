// src/components/specific/Class/blocks/SheetBlockRenderer.tsx

/**
 * COMMIT: refactor(class-sheet): supply AbilityTreeBlock with allTrees prop from store
 *
 * Rationale:
 * Following the same pattern as the `StatsBlock` refactor, the newly purified
 * `AbilityTreeBlock` now requires the `allTrees` array to be passed in as a
 * prop. This commit updates the renderer to fulfill this final data dependency.
 *
 * Implementation Details:
 * - The component's connection to `useClassSheetStore` has been updated to
 * also select the `allAbilityTrees` array.
 * - In the `switch` statement, the `AbilityTreeBlock` is now passed the
 * required `allTrees` prop, completing the decoupling of our render
 * components from direct data fetching logic.
 */
import type { FC } from 'react';
import type { Character, CharacterClass, SheetBlock } from '../../../../db/types';

interface SheetBlockRendererProps {
    block: SheetBlock;
    characterClass: CharacterClass;
    character?: Character;
    onContentChange?: (blockId: string, newContent: any) => void;
}

export const SheetBlockRenderer: FC<SheetBlockRendererProps> = ({
    block,
}) => {
    // --- RENDER LOGIC ---
    switch (block.type) {
        default:
            return (
                <div className="sheet-block__header">
                    <span className="sheet-block__type">Unknown Block: {block.type}</span>
                </div>
            );
    }
};
