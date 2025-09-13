// src/components/specific/Class/editor/PageCanvas.tsx

/**
 * COMMIT: refactor(class-sheet): connect PageCanvas to Zustand store
 *
 * Rationale:
 * Continuing with Phase 1.3, this commit refactors the PageCanvas to be a
 * self-sufficient component that connects directly to the Zustand store,
 * removing its dependency on props from its parent.
 *
 * Implementation Details:
 * - The component's props interface has been removed.
 * - It now imports and uses `useClassSheetStore` to get the current page,
 * the editable class, the selected block ID, and the necessary actions
 * (`handleLayoutChange`, `setSelectedBlockId`).
 * - A `useMemo` hook is used to derive the `gridLayout` for the `react-grid-layout`
 * component, ensuring it only recalculates when the page's blocks change.
 * - This change further decouples the editor's components and simplifies
 * the data flow within the application.
 */
import { useMemo, type FC } from 'react';
import GridLayout from 'react-grid-layout';
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';
import { SheetBlockRenderer } from '../SheetBlockRenderer'; // Adjusted path

// --- CONSTANTS ---
const PAGE_COLUMNS = 48;
const PAGE_ROW_HEIGHT = 10;
const PAGE_WIDTH = 1000;

// This component no longer needs to receive any props.
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
        // This case should be handled by the parent, but it's a good safeguard.
        return null;
    }

    return (
        <div className="page-canvas__container">
            <div className="page-canvas__page">
                <GridLayout
                    layout={gridLayout}
                    cols={PAGE_COLUMNS}
                    rowHeight={PAGE_ROW_HEIGHT}
                    width={PAGE_WIDTH}
                    onLayoutChange={handleLayoutChange}
                    preventCollision={true}
                    allowOverlap={true}
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
                                <SheetBlockRenderer block={block} characterClass={characterClass} />
                            </div>
                        );
                    })}
                </GridLayout>
            </div>
        </div>
    );
};
