// src/components/specific/Class/editor/PageCanvas.tsx

/**
 * COMMIT: fix(class-sheet): refine zoom effect to hide blocks instead of entire grid
 *
 * Rationale:
 * The previous fix for the zoom-flicker issue hid the entire GridLayout,
 * which was visually jarring as the whole page background would disappear and
 * reappear. This commit refines that behavior.
 *
 * Implementation Details:
 * - The `isZooming` state is now used within the `blocks.map()` function inside
 * the `ScaledGridLayout` component.
 * - A `style` object is applied to each individual block's wrapper div.
 * - This style sets `visibility: 'hidden'` on each block only when a zoom is
 * in progress (`isZooming` is true).
 * - The `visibility` style has been removed from the main grid container, so
 * the page background remains static during the zoom.
 * - This results in a much smoother user experience, where only the blocks
 * themselves pop in and out, rather than the entire canvas.
 */
import { useMemo, type FC, useRef, useState } from 'react';
import GridLayout, { type Layout } from 'react-grid-layout';
import {
    TransformWrapper,
    TransformComponent,
    useControls,
    useTransformContext,
} from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store.ts';
import { SheetBlockRenderer } from '../blocks/SheetBlockRenderer.tsx';

// --- CONSTANTS ---
const PAGE_COLUMNS = 48;
const PAGE_ROW_HEIGHT = 10;

interface ScaledGridLayoutProps {
    isZooming: boolean;
}

/**
 * An internal component that has access to the zoom/pan context.
 */
const ScaledGridLayout: FC<ScaledGridLayoutProps> = ({ isZooming }) => {
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

    // --- REF FOR CLICK VS. DRAG DETECTION ---
    const dragStartLayout = useRef<Layout | null>(null);

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

    // --- EVENT HANDLERS FOR CLICK DETECTION ---
    const handleDragStart = (_layout: Layout[], oldItem: Layout) => {
        // Store the initial state of the item being dragged.
        dragStartLayout.current = oldItem;
    };

    const handleDragStop = (_layout: Layout[], _oldItem: Layout, newItem: Layout) => {
        const start = dragStartLayout.current;
        if (start && start.x === newItem.x && start.y === newItem.y) {
            // If the item's x/y position hasn't changed, it was a click.
            if (selectedBlockId !== newItem.i) {
                setSelectedBlockId(newItem.i);
            }
        }
        // Clear the ref for the next interaction.
        dragStartLayout.current = null;
    };

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
                onDragStart={handleDragStart}
                onDragStop={handleDragStop}
                preventCollision={true}
                compactType={null}
                isDraggable={true}
                isResizable={true}
                draggableCancel=".sheet-block__content, input, textarea, button"
                transformScale={scale}
            >
                {blocks.map((block) => {
                    const isSelected = block.id === selectedBlockId;
                    const wrapperClass = `sheet-block-wrapper ${
                        isSelected ? 'sheet-block-wrapper--selected' : ''
                    }`;
                    // REWORK: Hide individual blocks during zoom instead of the whole grid.
                    const blockStyle = {
                        visibility: isZooming ? 'hidden' : 'visible',
                    } as const;

                    return (
                        <div key={block.id} className={wrapperClass} style={blockStyle}>
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
    const [isZooming, setIsZooming] = useState(false);
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
                    activationKeys: ['Control', 'Shift'],
                    excluded: ['input', 'button', 'textarea', 'select', 'react-resizable-handle'],
                }}
                wheel={{ step: 0.1 }}
                doubleClick={{ disabled: true }}
                onZoom={(ref) => setCanvasScale(ref.state.scale)}
                onZoomStart={() => setIsZooming(true)}
                onZoomStop={() => setIsZooming(false)}
            >
                <PageCanvasControls />
                <TransformComponent wrapperClass="page-canvas__transform-wrapper">
                    <ScaledGridLayout isZooming={isZooming} />
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
};
