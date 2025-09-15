// src/components/specific/Class/editor/PageCanvas.tsx

/**
 * COMMIT: refactor(class-sheet): Isolate block selection from drag events
 *
 * Rationale:
 * The previous click detection, which relied on a timer within a `mousedown`
 * event, was unreliable because it conflicted with the drag-and-drop event
 * handlers from the `react-grid-layout` library. A slight mouse movement could
 * be misinterpreted as a drag, preventing the `mouseup` event from firing as
 * expected and thus failing to select the block.
 *
 * Implementation Details:
 * - Removed the old timer-based `handleMouseDown` function.
 * - Introduced two `useRef` hooks: `interactionTargetId` to store the ID of a
 * block when an interaction begins, and `wasMoved` to act as a flag that is
 * set to `true` if a drag or resize event occurs.
 * - The block wrapper's `onMouseDown` now simply sets these two refs to their
 * initial state (`block.id` and `false`, respectively).
 * - The `GridLayout` component's `onDrag` and `onResize` props are now used to
 * set the `wasMoved` ref to `true` the moment any movement is detected.
 * - A component-level `useEffect` hook now manages a single global `mouseup`
 * listener. When the mouse is released, this listener checks if the
 * `wasMoved` flag is still `false`. If it is, the interaction is classified
 * as a "click," and the `setSelectedBlockId` action is dispatched.
 * - This new approach is more robust as it works *with* the lifecycle of the
 * grid library's events instead of competing with them.
 */
import { useMemo, type FC, useRef, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
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

    // --- REFS FOR CLICK VS. DRAG DETECTION ---
    const interactionTargetId = useRef<string | null>(null);
    const wasMoved = useRef(false);

    // --- EFFECT FOR GLOBAL MOUSEUP LISTENER ---
    useEffect(() => {
        const handleMouseUp = () => {
            // If the mouse is released after an interaction that didn't involve movement...
            if (!wasMoved.current && interactionTargetId.current) {
                // ...it's a click. Select the block if it's not already selected.
                if (selectedBlockId !== interactionTargetId.current) {
                    setSelectedBlockId(interactionTargetId.current);
                }
            }
            // Reset for the next interaction.
            interactionTargetId.current = null;
        };

        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [selectedBlockId, setSelectedBlockId]);

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
                onDrag={() => (wasMoved.current = true)}
                onResize={() => (wasMoved.current = true)}
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
                        <div
                            key={block.id}
                            className={wrapperClass}
                            onMouseDown={() => {
                                // On mouse down, note the target and reset the movement flag.
                                interactionTargetId.current = block.id;
                                wasMoved.current = false;
                            }}
                        >
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
                    // FIX: Removing the wrapper from the exclusion list is the key.
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
