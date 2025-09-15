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
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';

// Import all the specific block components
import { DetailsBlock } from '../../SheetBlocks/character/DetailsBlock';
import { StatsBlock } from '../../SheetBlocks/character/StatsBlock';
import { AbilityTreeBlock } from '../../SheetBlocks/content/AbilityTreeBlock';
import { RichTextBlock } from '../../SheetBlocks/content/RichTextBlock';
import { InventoryBlock } from '../../SheetBlocks/character/InventoryBlock';
import { NotesBlock } from '../../SheetBlocks/content/NotesBlock';

interface SheetBlockRendererProps {
    block: SheetBlock;
    characterClass: CharacterClass;
    character?: Character;
    onContentChange?: (blockId: string, newContent: any) => void;
}

export const SheetBlockRenderer: FC<SheetBlockRendererProps> = ({
    block,
    characterClass,
    character,
    onContentChange: onContentChangeProp = () => {},
}) => {
    // --- ZUSTAND STORE ---
    // REWORK: Now selects all data needed by any potential child block.
    const { updateBlockContent, statDefinitions, allAbilityTrees } = useClassSheetStore(
        (state) => ({
            updateBlockContent: state.updateBlockContent,
            statDefinitions: state.statDefinitions,
            allAbilityTrees: state.allAbilityTrees,
        }),
    );
    const onContentChange = updateBlockContent || onContentChangeProp;

    // --- RENDER LOGIC ---
    switch (block.type) {
        case 'details':
            return <DetailsBlock characterClass={characterClass} />;
        case 'stats':
            const statsToShow = character ? character.stats : characterClass.baseStats;
            return <StatsBlock baseStats={statsToShow} statDefinitions={statDefinitions} />;
        case 'ability_tree':
            return (
                <AbilityTreeBlock
                    content={block.content}
                    onContentChange={(newContent) => onContentChange(block.id, newContent)}
                    // REWORK: Pass the required allTrees prop.
                    allTrees={allAbilityTrees}
                />
            );
        case 'rich_text':
            const richTextContent = character?.instanceData?.[block.id] ?? block.content ?? '';
            return (
                <RichTextBlock
                    content={richTextContent}
                    onContentChange={(newContent) => onContentChange(block.id, newContent)}
                />
            );
        case 'notes':
            const notesContent = character?.instanceData?.[block.id] ?? block.content ?? '';
            return (
                <NotesBlock
                    content={notesContent}
                    onContentChange={(newContent) => onContentChange(block.id, newContent)}
                />
            );
        case 'inventory':
            const inventoryContent = character?.instanceData?.[block.id] ?? [];
            return (
                <InventoryBlock
                    content={inventoryContent}
                    onContentChange={(newContent) => onContentChange(block.id, newContent)}
                />
            );
        default:
            return (
                <div className="sheet-block__header">
                    <span className="sheet-block__type">Unknown Block: {block.type}</span>
                </div>
            );
    }
};
