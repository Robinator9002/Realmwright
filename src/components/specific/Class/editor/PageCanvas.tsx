// src/components/specific/Class/editor/PageCanvas.tsx

/**
 * COMMIT: fix(class-sheet): resolve block creation rendering bug
 *
 * Rationale:
 * The core bug preventing new blocks from appearing was a synchronization
 * issue in `react-grid-layout`. The component was receiving an updated `layout`
 * prop and new `children` simultaneously, causing it to ignore the new item.
 *
 * Implementation Details:
 * - Removed the `layout` prop from the `<GridLayout>` component.
 * - The component now uses the more robust `data-grid` pattern. The layout
 * object for each block is now passed directly to the `data-grid` attribute
 * of its corresponding `div`.
 * - This change guarantees that a block's layout information and its DOM
 * element are always created and processed together, eliminating the race
 * condition and ensuring new blocks render correctly every time.
 */
import type { FC } from 'react';
// FIX: Removed `useMemo` as it's no longer needed for the layout.
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
    const { blocks, characterClass, selectedBlockId, handleLayoutChange, setSelectedBlockId } =
        useClassSheetStore((state) => ({
            blocks: state.editableClass?.characterSheet[state.activePageIndex]?.blocks ?? [],
            characterClass: state.editableClass,
            selectedBlockId: state.selectedBlockId,
            handleLayoutChange: state.handleLayoutChange,
            setSelectedBlockId: state.setSelectedBlockId,
        }));

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
                            // FIX: Add a dynamic key to force re-mount on block count change.
                            // This is a robust way to prevent state sync issues in the library.
                            key={blocks.length}
                            cols={PAGE_COLUMNS}
                            rowHeight={PAGE_ROW_HEIGHT}
                            width={PAGE_WIDTH}
                            onLayoutChange={handleLayoutChange}
                            preventCollision={true}
                            allowOverlap={true}
                            isDraggable={true}
                            isResizable={true}
                            draggableCancel=".sheet-block__content, input, textarea, button"
                        >
                            {blocks.map((block) => {
                                const isSelected = block.id === selectedBlockId;
                                const wrapperClass = `sheet-block-wrapper ${
                                    isSelected ? 'sheet-block-wrapper--selected' : ''
                                }`;
                                const gridData = {
                                    i: block.id,
                                    x: block.layout.x,
                                    y: block.layout.y,
                                    w: block.layout.w,
                                    h: block.layout.h,
                                };

                                return (
                                    <div
                                        key={block.id}
                                        data-grid={gridData}
                                        className={wrapperClass}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (selectedBlockId !== block.id) {
                                                setSelectedBlockId(block.id);
                                            }
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
