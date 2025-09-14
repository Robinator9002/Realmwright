// src/components/specific/Class/editor/PageCanvas.tsx

import { useMemo, type FC } from 'react';
// FIX: Import external libraries from a CDN to resolve build errors.
import GridLayout from 'react-grid-layout';
import {
    TransformWrapper,
    TransformComponent,
    useControls,
} from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';
import { SheetBlockRenderer } from '../blocks/SheetBlockRenderer';

// --- CONSTANTS ---
const PAGE_COLUMNS = 48;
const PAGE_ROW_HEIGHT = 10;
// REMOVED: The page width is no longer a fixed constant.

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
    const {
        blocks,
        characterClass,
        selectedBlockId,
        handleLayoutChange,
        setSelectedBlockId,
        // NEW: Select page dimensions from the store.
        pageWidth,
        pageHeight,
    } = useClassSheetStore((state) => ({
        blocks: state.editableClass?.characterSheet[state.activePageIndex]?.blocks ?? [],
        characterClass: state.editableClass,
        selectedBlockId: state.selectedBlockId,
        handleLayoutChange: state.handleLayoutChange,
        setSelectedBlockId: state.setSelectedBlockId,
        // NEW: Add page dimension state.
        pageWidth: state.pageWidth,
        pageHeight: state.pageHeight,
    }));

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
                    excluded: [
                        'input',
                        'button',
                        'textarea',
                        'select',
                        'react-resizable-handle',
                        'inventory-item__input',
                        'rich-text-block__edit-button',
                        'notes-block__edit-button',
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
                    {/* REWORK: Apply dimensions dynamically using inline styles. */}
                    <div
                        className="page-canvas__page"
                        style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}
                    >
                        <GridLayout
                            layout={gridLayout}
                            cols={PAGE_COLUMNS}
                            rowHeight={PAGE_ROW_HEIGHT}
                            // REWORK: Use the dynamic width from the store.
                            width={pageWidth}
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
