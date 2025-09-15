// src/components/specific/Class/blocks/SheetBlockRenderer.tsx

/**
 * COMMIT: refactor(class-sheet): connect SheetBlockRenderer to store for prop drilling
 *
 * Rationale:
 * Now that the `StatsBlock` component has been refactored into a pure
 * presentational component, it requires the `statDefinitions` to be passed
 * in as a prop. The `SheetBlockRenderer`, as the central dispatcher for all
 * blocks, is the correct place to source this data.
 *
 * Implementation Details:
 * - The component now connects to the `useClassSheetStore` to select the
 * `statDefinitions` array.
 * - In the `switch` statement, the `StatsBlock` is now passed the required
 * `statDefinitions` prop from the store, resolving the dependency and
 * completing the refactor for this block type.
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
    // REWORK: Now selects both actions and the data needed by child components.
    const { updateBlockContent, statDefinitions } = useClassSheetStore((state) => ({
        updateBlockContent: state.updateBlockContent,
        statDefinitions: state.statDefinitions,
    }));
    const onContentChange = updateBlockContent || onContentChangeProp;

    // --- RENDER LOGIC ---
    switch (block.type) {
        case 'details':
            return <DetailsBlock characterClass={characterClass} />;
        case 'stats':
            // Determine which stats to show (live character or class blueprint).
            const statsToShow = character ? character.stats : characterClass.baseStats;
            return (
                // REWORK: Pass the required statDefinitions prop.
                <StatsBlock baseStats={statsToShow} statDefinitions={statDefinitions} />
            );
        case 'ability_tree':
            return (
                <AbilityTreeBlock
                    content={block.content}
                    onContentChange={(newContent) => onContentChange(block.id, newContent)}
                />
            );
        case 'rich_text':
            // For live characters, use instanceData; otherwise, use the class's default content.
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
            // Fallback for any unknown block types.
            return (
                <div className="sheet-block__header">
                    <span className="sheet-block__type">Unknown Block: {block.type}</span>
                </div>
            );
    }
};
