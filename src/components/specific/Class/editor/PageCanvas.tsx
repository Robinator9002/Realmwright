// src/components/specific/Class/editor/PageCanvas.tsx

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
// These are defined here as they are fundamental to the grid's calculations.
const PAGE_COLUMNS = 48;
const PAGE_ROW_HEIGHT = 10;

/**
 * An internal component that has access to the zoom/pan context.
 * It's responsible for rendering the GridLayout and passing the current
 * scale to it, which is crucial for correct drag-and-drop behavior.
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
    // This hook gets the current state from the parent TransformWrapper.
    const {
        transformState: { scale },
    } = useTransformContext();

    // Memoize the layout to prevent unnecessary re-renders.
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

    // Render nothing if there's no class data to avoid errors.
    if (!characterClass) return null;

    return (
        <div className="page-canvas__page" style={{ width: pageWidth, height: pageHeight }}>
            <GridLayout
                layout={gridLayout}
                cols={PAGE_COLUMNS}
                rowHeight={PAGE_ROW_HEIGHT}
                width={pageWidth}
                onLayoutChange={handleLayoutChange}
                preventCollision={true}
                isDraggable={true}
                isResizable={true}
                draggableCancel=".sheet-block__content, input, textarea, button"
                // This is the critical fix: It tells react-grid-layout how to adjust
                // its internal drag calculations to account for the CSS transform scale
                // applied by the zoom-and-pan wrapper.
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
    const hasPages = useClassSheetStore(
        (state) => (state.editableClass?.characterSheet.length ?? 0) > 0,
    );

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
                    // Exclude various UI elements to prevent panning from interfering
                    // with standard interactions like text selection or button clicks.
                    excluded: [
                        'input',
                        'button',
                        'textarea',
                        'select',
                        'react-resizable-handle',
                        'sheet-block-wrapper', // Add block itself to prevent pan/drag conflicts
                    ],
                }}
                wheel={{ step: 0.1 }}
                doubleClick={{ disabled: true }}
            >
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
