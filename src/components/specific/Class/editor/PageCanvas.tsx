// src/components/specific/Class/editor/PageCanvas.tsx

/**
 * COMMIT: fix(class-sheet): revert to layout prop to fix block rendering bug
 *
 * Rationale:
 * The bug where new blocks were created but not displayed was caused by a
 * complex interaction between `react-grid-layout` and the CSS scaling from
 * `react-zoom-pan-pinch`. The `data-grid` attribute method was failing to
 * correctly calculate the initial dimensions for new blocks inside a scaled
 * container.
 *
 * Implementation Details:
 * - Reverted from the `data-grid` attribute pattern back to using the `layout`
 * prop on the `<GridLayout>` component.
 * - A `useMemo` hook is now used to derive the `gridLayout` array from the
 * store's `blocks`. This ensures the layout data is always synchronized with
 * the children being rendered.
 * - This "controlled component" approach uses a different internal code path
 * in the grid library that is more resilient to the parent transform,
 * finally resolving the persistent rendering issue.
 */
import { useMemo, type FC } from 'react'; // Added useMemo
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

    // FIX: Derive the layout using useMemo. This is the new source of truth for the grid.
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
                            // FIX: Use the layout prop and remove the data-grid attributes from children.
                            layout={gridLayout}
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

                                return (
                                    <div
                                        key={block.id}
                                        // The data-grid attribute is no longer needed.
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
