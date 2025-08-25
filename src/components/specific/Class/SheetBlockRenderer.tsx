// src/components/specific/Class/SheetBlockRenderer.tsx

/**
 * COMMIT: refactor(class-sheet): extract BlockRenderer into a dedicated component
 *
 * Rationale:
 * To create a cleaner and more maintainable ClassSheetEditor, the logic for
 * rendering different types of sheet blocks has been extracted from the main
 * component into this dedicated, reusable BlockRenderer.
 *
 * Implementation Details:
 * - This component acts as a simple switch, taking a `block` object and
 * returning the appropriate visual component from the /SheetBlocks directory.
 * - It is designed to be used by both the ClassSheetEditor (for templates)
 * and the CharacterSheetPage (for live character data), accepting all
 * necessary props for both contexts.
 */
import type { FC } from 'react';
import type { Character, CharacterClass, SheetBlock } from '../../../db/types';

// Import all the specific block components
import { DetailsBlock } from '../SheetBlocks/DetailsBlock';
import { StatsBlock } from '../SheetBlocks/StatsBlock';
import { AbilityTreeBlock } from '../SheetBlocks/AbilityTreeBlock';
import { RichTextBlock } from '../SheetBlocks/RichTextBlock';
import { InventoryBlock } from '../SheetBlocks/InventoryBlock';

// --- COMPONENT PROPS ---
// Consolidates all props needed to render any type of block,
// making the component versatile for both the editor and the live sheet.
interface SheetBlockRendererProps {
    block: SheetBlock;
    characterClass: CharacterClass;
    // The following props are for live character sheets, not the editor
    character?: Character;
    onContentChange?: (blockId: string, newContent: any) => void;
}

// --- COMPONENT DEFINITION ---
export const SheetBlockRenderer: FC<SheetBlockRendererProps> = ({
    block,
    characterClass,
    character,
    onContentChange = () => {}, // Provide a default empty function
}) => {
    // The switch statement determines which block component to render.
    switch (block.type) {
        case 'details':
            // The details block only needs the class blueprint data.
            return <DetailsBlock characterClass={characterClass} />;

        case 'stats':
            // When viewing a live character, show their stats. Otherwise, show class base stats.
            const statsToShow = character ? character.stats : characterClass.baseStats;
            return <StatsBlock baseStats={statsToShow} />;

        case 'ability_tree':
            // The ability tree block needs its content (the tree ID) and a change handler.
            return (
                <AbilityTreeBlock
                    content={block.content}
                    onContentChange={(newContent) => onContentChange(block.id, newContent)}
                />
            );

        case 'rich_text':
            // For live characters, pull from instanceData. Fall back to class blueprint content.
            const richTextContent = character?.instanceData?.[block.id] ?? block.content ?? '';
            return (
                <RichTextBlock
                    content={richTextContent}
                    onContentChange={(newContent) => onContentChange(block.id, newContent)}
                />
            );

        case 'inventory':
            // For live characters, pull from instanceData. Fall back to an empty array.
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
