// src/components/specific/Class/blocks/SheetBlockRenderer.tsx

/**
 * COMMIT: fix(class-sheet): correct import paths in SheetBlockRenderer
 *
 * Rationale:
 * A previous refactor that moved this component into a `/blocks` subdirectory
 * broke the relative import paths to the individual block components (e.g.,
 * DetailsBlock, StatsBlock) and the Zustand store, causing compilation errors.
 *
 * Implementation Details:
 * - All import paths have been updated to correctly
 * reference their locations from the new directory,
 * resolving all compilation errors.
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
    const updateBlockContent = useClassSheetStore((state) => state.updateBlockContent);
    const onContentChange = updateBlockContent || onContentChangeProp;

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
