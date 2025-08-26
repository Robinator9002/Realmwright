// src/components/specific/Class/PageCanvas.tsx

/**
 * COMMIT: feat(class-sheet): create foundational PageCanvas component
 *
 * Rationale:
 * As the centerpiece of the new WYSIWYG editor, this commit introduces the
 * PageCanvas component. It integrates the `react-grid-layout` library to
 * provide the core functionality for a draggable, resizable, and free-form
 * layout experience for sheet blocks.
 *
 * Implementation Details:
 * - Added `react-grid-layout` as a dependency.
 * - Created the `PageCanvas` component, which wraps the `GridLayout` from the
 * new library.
 * - The component is styled to resemble an A4 page and is configured to be
 * a "free-form" canvas by setting a high column count and a small row height,
 * allowing for near-pixel-perfect positioning of blocks.
 * - It accepts the current page's blocks and layout change handlers as props,
 * serving as the interactive stage for the sheet editor.
 */
import type { FC } from 'react';
import GridLayout, { type Layout } from 'react-grid-layout';
import type { SheetPage, CharacterClass } from '../../../db/types';
import { SheetBlockRenderer } from './SheetBlockRenderer';

// --- CONSTANTS ---
// These define the "granularity" of our canvas.
// A high column count and small row height give the feeling of a free-form canvas.
const PAGE_COLUMNS = 48;
const PAGE_ROW_HEIGHT = 10; // in pixels
const PAGE_WIDTH = 1000; // in pixels

// --- COMPONENT PROPS ---
interface PageCanvasProps {
    page: SheetPage;
    characterClass: CharacterClass;
    onLayoutChange: (newLayout: Layout[]) => void;
}

// --- COMPONENT DEFINITION ---
export const PageCanvas: FC<PageCanvasProps> = ({ page, characterClass, onLayoutChange }) => {
    // Convert our SheetBlock layout into the format react-grid-layout expects.
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
                    // This prevents items from moving around when one is resized.
                    preventCollision={true}
                    // This allows items to overlap, controlled by our zIndex.
                    allowOverlap={true}
                >
                    {page.blocks.map((block) => (
                        <div key={block.id} className="sheet-block-wrapper">
                            <SheetBlockRenderer block={block} characterClass={characterClass} />
                        </div>
                    ))}
                </GridLayout>
            </div>
        </div>
    );
};
