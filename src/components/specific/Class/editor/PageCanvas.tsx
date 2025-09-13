// src/components/specific/Class/editor/PageCanvas.tsx

/**
 * COMMIT: feat(class-sheet): implement canvas zoom and pan
 *
 * Rationale:
 * To enhance the user experience and make the editor feel more like a
 * dynamic canvas, this commit introduces zoom and pan functionality as per
 * Phase 2.1 of the development plan.
 *
 * Implementation Details:
 * - Added the `react-zoom-pan-pinch` library as a dependency.
 * - Wrapped the entire page layout within the `TransformWrapper` and
 * `TransformComponent` components from the library.
 * - The wrapper is configured to allow panning with the middle mouse button
 * and zooming with the scroll wheel.
 * - A new `PageCanvasControls` component has been added to provide users
 * with explicit on-screen buttons for zooming in, zooming out, and
 * resetting the view to its default state.
 * - This makes navigating large or complex character sheets significantly
 * more intuitive and efficient.
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

/**
 * A dedicated component for the zoom controls UI.
 */
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
    const { page, characterClass, selectedBlockId, handleLayoutChange, setSelectedBlockId } =
        useClassSheetStore((state) => ({
            page: state.editableClass?.characterSheet[state.activePageIndex] ?? null,
            characterClass: state.editableClass,
            selectedBlockId: state.selectedBlockId,
            handleLayoutChange: state.handleLayoutChange,
            setSelectedBlockId: state.setSelectedBlockId,
        }));

    // --- DERIVED LAYOUT ---
    const gridLayout = useMemo(
        () =>
            page?.blocks.map((block) => ({
                i: block.id,
                x: block.layout.x,
                y: block.layout.y,
                w: block.layout.w,
                h: block.layout.h,
            })) || [],
        [page?.blocks],
    );

    // --- RENDER LOGIC ---
    if (!page || !characterClass) {
        return null;
    }

    return (
        <div className="page-canvas__container">
            <TransformWrapper
                minScale={0.2}
                limitToBounds={false}
                panning={{
                    activationKeys: ['Meta', 'Shift'],
                    excluded: ['input', 'button', 'textarea'],
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
                            isDraggable={false} /* Disable grid drag, pan handles it */
                            isResizable={false} /* Disable grid resize for now */
                        >
                            {page.blocks.map((block) => {
                                const isSelected = block.id === selectedBlockId;
                                const wrapperClass = `sheet-block-wrapper ${
                                    isSelected ? 'sheet-block-wrapper--selected' : ''
                                }`;

                                return (
                                    <div
                                        key={block.id}
                                        className={wrapperClass}
                                        onClick={() => setSelectedBlockId(block.id)}
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
