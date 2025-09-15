// src/components/specific/Class/editor/PageCanvas.tsx

/**
 * COMMIT: fix(class-sheet): implement robust click detection using onDragStop
 *
 * Rationale:
 * Previous attempts to differentiate clicks from drags using timers or global
 * mouseup listeners were unreliable. They competed with the internal event
 * handling of `react-grid-layout`, where even a 1-pixel mouse movement can
 * initiate a drag, preventing a "click" from being registered. This commit
 * implements a more robust solution that works *with* the library's event cycle.
 *
 * Implementation Details:
 * - The old `useEffect`-based global mouseup listener and associated refs have been removed.
 * - The component now uses the `onDragStart` and `onDragStop` props from `GridLayout`.
 * - On `onDragStart`, we record the original layout of the block being interacted with
 * in a `useRef` hook. This serves as our "before" snapshot.
 * - On `onDragStop`, which fires reliably after any interaction, we compare the final
 * layout properties (`x`, `y`) of the moved item with the initial layout stored
 * in our ref.
 * - If the `x` and `y` coordinates have not changed, we can definitively conclude
 * that the interaction was a click, not a drag. Only then do we call
 * `setSelectedBlockId` to select the block and open the sidebar.
 * - This approach is superior because it leverages the library's own events and
 * uses positional data rather than timing, making it immune to issues caused by
 * minor mouse jitter.
 */
import { useMemo, type FC, useRef } from 'react';
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

                    return (
                        <div key={block.id} className={wrapperClass}>
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
