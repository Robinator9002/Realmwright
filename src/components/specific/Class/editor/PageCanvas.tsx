// src/components/specific/Class/editor/PageCanvas.tsx

/**
 * COMMIT: fix(class-sheet): resolve stale zoom level on block drag
 *
 * Rationale:
 * A bug was identified where, after zooming, the first drag operation on a
 * block would use the previous zoom level for its calculations, causing a
 * visual disconnect. The `react-grid-layout` component was not re-evaluating
 * its internal drag logic when its `transformScale` prop changed.
 *
 * Implementation Details:
 * - The `GridLayout` component within `ScaledGridLayout` is now assigned a
 * `key` prop that is tied directly to the `scale` value from the zoom context.
 * - When the scale changes, the key changes, forcing React to unmount the old
 * grid and mount a new instance.
 * - This ensures that the grid's internal drag handlers are always
 * initialized with the very latest `transformScale`, completely resolving
 * the state synchronization issue and providing a smooth drag experience at
 * any zoom level.
 */
import { useMemo, type FC } from 'react';
import GridLayout from 'react-grid-layout';
import {
    TransformWrapper,
    TransformComponent,
    useControls,
    useTransformContext,
} from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';
import { SheetBlockRenderer } from '../blocks/SheetBlockRenderer';

// --- CONSTANTS ---
const PAGE_COLUMNS = 48;
const PAGE_ROW_HEIGHT = 10;

/**
 * An internal component that has access to the zoom/pan context.
 * This is separated to allow `useTransformContext` to be called.
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
    } = useClassSheetStore((state) => ({
        blocks: state.editableClass?.characterSheet[state.activePageIndex]?.blocks ?? [],
        characterClass: state.editableClass,
        selectedBlockId: state.selectedBlockId,
        handleLayoutChange: state.handleLayoutChange,
        setSelectedBlockId: state.setSelectedBlockId,
        pageWidth: state.pageWidth,
        pageHeight: state.pageHeight,
    }));

    // --- TRANSFORM CONTEXT ---
    // This hook provides the current scale from the TransformWrapper parent.
    const {
        transformState: { scale },
    } = useTransformContext();

    // Memoize the layout array to prevent unnecessary recalculations.
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
                // FIX: Use the zoom scale as the key. This forces the component to
                // re-mount when the scale changes, ensuring it always uses the
                // latest `transformScale` for its internal drag calculations.
                key={scale}
                layout={gridLayout}
                cols={PAGE_COLUMNS}
                rowHeight={PAGE_ROW_HEIGHT}
                width={pageWidth}
                onLayoutChange={handleLayoutChange}
                preventCollision={true}
                isDraggable={true}
                isResizable={true}
                draggableCancel=".sheet-block__content, input, textarea, button"
                transformScale={scale}
                compactType={null} // Allows free-form placement.
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
 * This is a separate component to use the `useControls` hook.
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
 * It sets up the context provider for zooming and panning.
 */
export const PageCanvas: FC = () => {
    // Check if there are any pages to render.
    const hasPages = useClassSheetStore(
        (state) => (state.editableClass?.characterSheet.length ?? 0) > 0,
    );

    // If there are no pages, show a prompt to the user.
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
                    // Allow panning by holding Meta (Cmd) or Shift key.
                    activationKeys: ['Meta', 'Shift'],
                    // Disable panning when interacting with these specific elements.
                    excluded: [
                        'input',
                        'button',
                        'textarea',
                        'select',
                        'react-resizable-handle',
                        'sheet-block-wrapper',
                    ],
                }}
                wheel={{ step: 0.1 }}
                doubleClick={{ disabled: true }}
            >
                {/* These children can now use the zoom/pan context hooks. */}
                <PageCanvasControls />
                <TransformComponent
                    wrapperClass="page-canvas__transform-wrapper"
                    contentClass="page-canvas__transform-content"
                >
                    <ScaledGridLayout />
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
};
