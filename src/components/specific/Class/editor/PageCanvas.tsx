// src/components/specific/Class/editor/PageCanvas.tsx

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
import { SheetBlockRenderer } from './SheetBlockRenderer';

// --- CONSTANTS ---
const PAGE_COLUMNS = 48;
const PAGE_ROW_HEIGHT = 10;

// --- COMPONENT PROPS ---
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
        selectedBlockId,
        handleLayoutChange,
        setSelectedBlockId,
        pageWidth,
        pageHeight,
        canvasScale,
    } = useClassSheetStore((state) => ({
        blocks: state.editableClass?.characterSheet[state.activePageIndex]?.blocks ?? [],
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

    // --- EVENT HANDLERS ---
    const handleDragStart = (_layout: Layout[], oldItem: Layout) => {
        dragStartLayout.current = oldItem;
        // NEW: Select the block the moment the drag begins.
        if (selectedBlockId !== oldItem.i) {
            setSelectedBlockId(oldItem.i);
        }
    };

    const handleDragStop = (_layout: Layout[], _oldItem: Layout, newItem: Layout) => {
        const start = dragStartLayout.current;
        // This logic handles pure clicks (no movement).
        if (start && start.x === newItem.x && start.y === newItem.y) {
            if (selectedBlockId !== newItem.i) {
                setSelectedBlockId(newItem.i);
            }
        }
        dragStartLayout.current = null;
    };

    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Deselect if the click is on the background canvas itself.
        if (e.target === e.currentTarget) {
            setSelectedBlockId(null);
        }
    };

    return (
        <div
            className="page-canvas__page"
            style={{ width: pageWidth, height: pageHeight }}
            onClick={handleCanvasClick}
        >
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
                // REWORK: Define the block header as the only valid drag handle.
                draggableHandle=".sheet-block__header"
                transformScale={scale}
            >
                {blocks.map((block) => {
                    const isSelected = block.id === selectedBlockId;
                    // REWORK: The wrapper is now just the grid item. `SheetBlockWrapper` is inside.
                    const gridItemClass = `sheet-block-wrapper ${
                        isSelected ? 'sheet-block-wrapper--selected' : ''
                    }`;
                    const blockStyle = {
                        visibility: isZooming ? 'hidden' : 'visible',
                    } as const;

                    return (
                        <div key={block.id} className={gridItemClass} style={blockStyle}>
                            <SheetBlockRenderer block={block} />
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
