// src/components/specific/Class/editor/canvas/SheetBlockRenderer.tsx

import type { FC } from 'react';
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';
import type { SheetBlock } from '../../../../../db/types';

// The new universal wrapper
import { SheetBlockWrapper } from './SheetBlockWrapper';

// Import all the block display components we will be routing to
import { DetailsBlock } from '../../../SheetBlocks/character/DetailsBlock';
import { StatsBlock } from '../../../SheetBlocks/character/StatsBlock';
import { AbilityTreeBlock } from '../../../SheetBlocks/content/AbilityTreeBlock';
import { RichTextBlock } from '../../../SheetBlocks/content/RichTextBlock';
import { InventoryBlock } from '../../../SheetBlocks/character/InventoryBlock';
import { NotesBlock } from '../../../SheetBlocks/content/NotesBlock';

// --- COMPONENT PROPS ---

interface SheetBlockRendererProps {
    block: SheetBlock;
}

// --- COMPONENT DEFINITION ---

/**
 * A "router" component that determines which specific block component to render
 * based on the `block.type`. It fetches any necessary shared data from the
 * Zustand store and passes it down, then wraps the final rendered block
 * in the universal SheetBlockWrapper.
 */
export const SheetBlockRenderer: FC<SheetBlockRendererProps> = ({ block }) => {
    // --- ZUSTAND STORE ---
    // Fetch all data that *any* of the child blocks might need.
    const { characterClass, statDefinitions, updateBlockContent } = useClassSheetStore((state) => ({
        characterClass: state.editableClass,
        statDefinitions: state.statDefinitions,
        updateBlockContent: state.updateBlockContent, // <-- Add this action
    }));

    // This shouldn't happen if the renderer is used correctly, but it's a safe guard.
    if (!characterClass) return null;

    // --- RENDER LOGIC ---

    /**
     * This function contains the switch statement to decide which block to render.
     * It keeps the main return statement of the component clean.
     */
    const renderBlockContent = () => {
        switch (block.type) {
            case 'details':
                return <DetailsBlock characterClass={characterClass} />;
            case 'stats':
                return (
                    <StatsBlock
                        baseStats={characterClass.baseStats}
                        statDefinitions={statDefinitions}
                    />
                );
            case 'ability_tree':
                // FIXED: Removed the invalid `allTrees` prop.
                // The component fetches this data from the store itself.
                return <AbilityTreeBlock block={block} />;

            case 'rich_text':
                // FIXED: Added the required `onContentChange` prop.
                return (
                    <RichTextBlock
                        block={block}
                        onContentChange={(newContent) => updateBlockContent(block.id, newContent)}
                    />
                );

            case 'notes':
                // FIXED: Added the required `onContentChange` prop.
                return (
                    <NotesBlock
                        block={block}
                        onContentChange={(newContent) => updateBlockContent(block.id, newContent)}
                    />
                );

            case 'inventory':
                return <InventoryBlock block={block} />;

            default:
                return (
                    <div className="panel__empty-message--small">
                        Unknown block type: {block.type}
                    </div>
                );
        }
    };

    // The final output wraps the specific block content in our universal wrapper.
    return <SheetBlockWrapper block={block}>{renderBlockContent()}</SheetBlockWrapper>;
};
