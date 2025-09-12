// src/components/specific/Class/PageCanvas.tsx

/**
 * COMMIT: feat(class-sheet): enable block selection on PageCanvas
 *
 * Rationale:
 * To allow users to select a block on the canvas to edit its properties,
 * the PageCanvas component must be able to handle click events and visually
 * indicate the currently selected block.
 *
 * Implementation Details:
 * - The `PageCanvasProps` interface has been updated to accept the
 * `selectedBlockId` and an `onSelectBlock` callback function.
 * - An `onClick` handler has been added to the wrapper `div` for each block.
 * This handler calls `onSelectBlock` with the block's ID, communicating the
 * selection up to the parent ClassSheetEditor.
 * - A dynamic CSS class, `sheet-block-wrapper--selected`, is now applied to
 * the wrapper `div` of the selected block, allowing for visual highlighting.
 */
import type { FC } from 'react';
import GridLayout, { type Layout } from 'react-grid-layout';
import type { SheetPage, CharacterClass } from '../../../../db/types';
import { SheetBlockRenderer } from '../blocks/SheetBlockRenderer';

// --- CONSTANTS ---
const PAGE_COLUMNS = 48;
const PAGE_ROW_HEIGHT = 10;
const PAGE_WIDTH = 1000;

// --- COMPONENT PROPS ---
// REWORK: Added props for handling block selection.
interface PageCanvasProps {
    page: SheetPage;
    characterClass: CharacterClass;
    onLayoutChange: (newLayout: Layout[]) => void;
    selectedBlockId: string | null;
    onSelectBlock: (blockId: string) => void;
}

// --- COMPONENT DEFINITION ---
export const PageCanvas: FC<PageCanvasProps> = ({
    page,
    characterClass,
    onLayoutChange,
    selectedBlockId,
    onSelectBlock,
}) => {
    const gridLayout = page.blocks.map((block) => ({
        i: block.id,
        x: block.layout.x,
        y: block.layout.y,
        w: block.layout.w,
        h: block.layout.h,
    }));

    return (
        <div className="page-canvas__container">
            <div className="page-canvas__page">
                <GridLayout
                    layout={gridLayout}
                    cols={PAGE_COLUMNS}
                    rowHeight={PAGE_ROW_HEIGHT}
                    width={PAGE_WIDTH}
                    onLayoutChange={onLayoutChange}
                    preventCollision={true}
                    allowOverlap={true}
                >
                    {page.blocks.map((block) => {
                        // Determine if this block is the currently selected one.
                        const isSelected = block.id === selectedBlockId;
                        const wrapperClass = `sheet-block-wrapper ${
                            isSelected ? 'sheet-block-wrapper--selected' : ''
                        }`;

                        return (
                            <div
                                key={block.id}
                                className={wrapperClass}
                                // Add the onClick handler to select the block.
                                onClick={() => onSelectBlock(block.id)}
                            >
                                <SheetBlockRenderer block={block} characterClass={characterClass} />
                            </div>
                        );
                    })}
                </GridLayout>
            </div>
        </div>
    );
};
