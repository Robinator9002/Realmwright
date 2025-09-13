// src/components/specific/Class/editor/PageCanvas.tsx

/**
 * COMMIT: fix(class-sheet): ensure canvas re-renders when blocks are added
 *
 * Rationale:
 * A critical bug was preventing the canvas from updating when a new block
 * was added. This was caused by the Zustand selector watching a high-level
 * page object whose reference didn't change, causing Zustand's shallow
 * comparison to fail and skip the re-render.
 *
 * Implementation Details:
 * - The Zustand selector in `PageCanvas` has been refactored to be more
 * granular. Instead of selecting the entire `page` object, the component
 * now directly selects the `blocks` array for the active page.
 * - When the `addBlock` action creates a new block, Immer produces a new
 * array reference for `blocks`.
 * - This new reference is now correctly detected by Zustand, triggering a
 * re-render of the canvas and making the new block appear as expected.
 */
import { useMemo, type FC } from 'react';
import GridLayout from 'react-grid-layout';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';
import { SheetBlockRenderer } from '../blocks/SheetBlockRenderer';

// --- CONSTANTS ---
const PAGE_COLUMNS = 48;
const PAGE_ROW_HEIGHT = 10;
const PAGE_WIDTH = 1000;

const PageCanvasControls = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();
    return (
        <div className="page-canvas__controls">
            <button onClick={() => zoomIn()} className="button button--icon" title="Zoom In">
                <ZoomIn size={18} />
            </button>
            <button onClick={() => zoomOut()} className="button button--icon" title="Zoom Out">
                <ZoomOut size={18} />
            </button>
            <button
                onClick={() => resetTransform()}
                className="button button--icon"
                title="Reset View"
            >
                <Maximize size={18} />
            </button>
        </div>
    );
};

export const PageCanvas: FC = () => {
    // --- ZUSTAND STORE ---
    // FIX: Select the blocks array directly to ensure re-renders on change.
    const { blocks, characterClass, selectedBlockId, handleLayoutChange, setSelectedBlockId } =
        useClassSheetStore((state) => ({
            blocks: state.editableClass?.characterSheet[state.activePageIndex]?.blocks ?? [],
            characterClass: state.editableClass,
            selectedBlockId: state.selectedBlockId,
            handleLayoutChange: state.handleLayoutChange,
            setSelectedBlockId: state.setSelectedBlockId,
        }));

    // --- DERIVED LAYOUT ---
    const gridLayout = useMemo(
        () =>
            blocks.map((block) => ({
                i: block.id,
                x: block.layout.x,
                y: block.layout.y,
                w: block.layout.w,
                h: block.layout.h,
            })),
        [blocks],
    );

    // --- RENDER LOGIC ---
    if (!characterClass) {
        return (
            <div className="page-canvas__container">
                <p className="panel__empty-message">Add a page to begin.</p>
            </div>
        );
    }

    return (
        <div className="page-canvas__container">
            <TransformWrapper
                minScale={0.2}
                limitToBounds={false}
                panning={{
                    activationKeys: ['Meta', 'Shift'],
                    excluded: ['input', 'button', 'textarea', 'react-resizable-handle'],
                }}
                doubleClick={{ disabled: true }}
            >
                <PageCanvasControls />
                <TransformComponent
                    wrapperClass="page-canvas__transform-wrapper"
                    contentClass="page-canvas__transform-content"
                >
                    <div className="page-canvas__page">
                        <GridLayout
                            layout={gridLayout}
                            cols={PAGE_COLUMNS}
                            rowHeight={PAGE_ROW_HEIGHT}
                            width={PAGE_WIDTH}
                            onLayoutChange={handleLayoutChange}
                            preventCollision={true}
                            allowOverlap={true}
                            isDraggable={true}
                            isResizable={true}
                            draggableCancel=".sheet-block__content"
                        >
                            {blocks.map((block) => {
                                const isSelected = block.id === selectedBlockId;
                                const wrapperClass = `sheet-block-wrapper ${
                                    isSelected ? 'sheet-block-wrapper--selected' : ''
                                }`;

                                return (
                                    <div
                                        key={block.id}
                                        className={wrapperClass}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedBlockId(block.id);
                                        }}
                                    >
                                        <SheetBlockRenderer
                                            block={block}
                                            characterClass={characterClass}
                                        />
                                    </div>
                                );
                            })}
                        </GridLayout>
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
};
