// src/components/specific/Class/editor/PageCanvas.tsx

/**
 * COMMIT: fix(class-sheet): implement draggable handle to resolve event conflicts
 *
 * Rationale:
 * A fundamental event conflict between 'click-to-select' and 'drag-to-move'
 * was causing multiple UI bugs, including the inability to drag blocks and
 * the failure of the properties sidebar to render its content correctly.
 * The `react-grid-layout` library was capturing all mouse events on the block,
 * preventing clicks from registering properly.
 *
 * Implementation Details:
 * - A dedicated drag handle has been implemented. The `draggableHandle` prop
 * on the `<GridLayout>` component is now set to `.sheet-block__drag-handle`.
 * - A `div` with this class has been added to the block's JSX, serving as the
 * exclusive grab point for dragging. It uses existing CSS to be visible.
 * - The `draggableCancel` prop has been simplified, as we no longer need to
 * blacklist the entire block wrapper.
 * - This change provides a clean, unambiguous separation between clicking on a
 * block to select it and grabbing a specific handle to move it, resolving
 * all associated bugs.
 */
import { useMemo, type FC } from 'react';
import GridLayout from 'react-grid-layout';
import {
    TransformWrapper,
    TransformComponent,
    useControls,
    useTransformContext,
} from 'react-zoom-pan-pinch';
import { GripVertical, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store.ts';
import { SheetBlockRenderer } from '../blocks/SheetBlockRenderer.tsx';

// --- CONSTANTS ---
const PAGE_COLUMNS = 48;
const PAGE_ROW_HEIGHT = 10;

/**
 * An internal component that has access to the zoom/pan context.
 */
const ScaledGridLayout: FC = () => {
    // --- ZUSTAND STORE ---
    const {
        blocks,
        characterClass,
        selectedBlockId,
        handleLayoutChange,
        setSelectedBlockId,
        pageWidth,
        pageHeight,
        canvasScale,
    } = useClassSheetStore((state) => ({
        blocks: state.editableClass?.characterSheet[state.activePageIndex]?.blocks ?? [],
        characterClass: state.editableClass,
        selectedBlockId: state.selectedBlockId,
        handleLayoutChange: state.handleLayoutChange,
        setSelectedBlockId: state.setSelectedBlockId,
        pageWidth: state.pageWidth,
        pageHeight: state.pageHeight,
        canvasScale: state.canvasScale,
    }));

    // --- TRANSFORM CONTEXT ---
    const {
        transformState: { scale },
    } = useTransformContext();

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

    if (!characterClass) return null;

    return (
        <div className="page-canvas__page" style={{ width: pageWidth, height: pageHeight }}>
            <GridLayout
                key={canvasScale}
                layout={gridLayout}
                cols={PAGE_COLUMNS}
                rowHeight={PAGE_ROW_HEIGHT}
                width={pageWidth}
                onLayoutChange={handleLayoutChange}
                preventCollision={true}
                compactType={null}
                isDraggable={true}
                isResizable={true}
                // FIX: Define a specific drag handle to separate click/drag events.
                draggableHandle=".sheet-block__drag-handle"
                // Let the handle control dragging; cancel on interactive elements.
                draggableCancel=".sheet-block__content, input, textarea, button"
                transformScale={scale}
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
                                if (selectedBlockId !== block.id) {
                                    setSelectedBlockId(block.id);
                                }
                            }}
                        >
                            {/* NEW: This is the dedicated handle for dragging */}
                            <div className="sheet-block__drag-handle">
                                <GripVertical size={18} />
                            </div>

                            <SheetBlockRenderer block={block} characterClass={characterClass} />
                        </div>
                    );
                })}
            </GridLayout>
        </div>
    );
};

/**
 * The controls for the zoom/pan functionality.
 */
const PageCanvasControls: FC = () => {
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

/**
 * The main PageCanvas component that wraps the zoomable/pannable grid.
 */
export const PageCanvas: FC = () => {
    const { hasPages, setCanvasScale } = useClassSheetStore((state) => ({
        hasPages: (state.editableClass?.characterSheet.length ?? 0) > 0,
        setCanvasScale: state.setCanvasScale,
    }));

    if (!hasPages) {
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
                    excluded: ['input', 'button', 'textarea', 'select', 'react-resizable-handle'],
                }}
                wheel={{ step: 0.1 }}
                doubleClick={{ disabled: true }}
                onZoom={(ref) => setCanvasScale(ref.state.scale)}
            >
                <PageCanvasControls />
                <TransformComponent wrapperClass="page-canvas__transform-wrapper">
                    <ScaledGridLayout />
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
};
