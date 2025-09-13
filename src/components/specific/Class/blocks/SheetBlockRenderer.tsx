// src/components/specific/Class/blocks/SheetBlockRenderer.tsx

/**
 * COMMIT: feat(class-sheet): integrate NotesBlock into renderer
 *
 * Rationale:
 * To make the newly created `NotesBlock` usable, the central
 * `SheetBlockRenderer` must be updated to recognize and render it.
 *
 * Implementation Details:
 * - Imported the new `NotesBlock` component.
 * - Added a `case 'notes'` to the main `switch` statement.
 * - This case returns the `<NotesBlock />`, passing it the necessary
 * `content` and `onContentChange` props. This fully wires up the new block
 * type within the editor's rendering logic.
 */
import type { FC } from 'react';
import type { Character, CharacterClass, SheetBlock } from '../../../../db/types';

// Import all the specific block components
import { DetailsBlock } from '../../SheetBlocks/character/DetailsBlock';
import { StatsBlock } from '../../SheetBlocks/character/StatsBlock';
import { AbilityTreeBlock } from '../../SheetBlocks/content/AbilityTreeBlock';
import { RichTextBlock } from '../../SheetBlocks/content/RichTextBlock';
import { InventoryBlock } from '../../SheetBlocks/character/InventoryBlock';
// NEW: Import the NotesBlock component.
import { NotesBlock } from '../../SheetBlocks/content/NotesBlock';

interface SheetBlockRendererProps {
    block: SheetBlock;
    characterClass: CharacterClass;
    character?: Character;
    onContentChange: (blockId: string, newContent: any) => void;
}

export const SheetBlockRenderer: FC<SheetBlockRendererProps> = ({
    block,
    characterClass,
    character,
    onContentChange = () => {},
}) => {
    switch (block.type) {
        case 'details':
            return <DetailsBlock characterClass={characterClass} />;
        case 'stats':
            const statsToShow = character ? character.stats : characterClass.baseStats;
            return <StatsBlock baseStats={statsToShow} />;
        case 'ability_tree':
            return (
                <AbilityTreeBlock
                    content={block.content}
                    onContentChange={(newContent) => onContentChange(block.id, newContent)}
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
        // NEW: Add a case to handle the 'notes' block type.
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
