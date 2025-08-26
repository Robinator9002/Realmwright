// src/components/specific/Class/ClassSheetEditor.tsx

/**
 * COMMIT: refactor(class-sheet): integrate PageCanvas into ClassSheetEditor
 *
 * Rationale:
 * This commit completes the pivot to the new WYSIWYG canvas editor by replacing
 * the old grid-based layout system in the ClassSheetEditor with the new
 * PageCanvas component.
 *
 * Implementation Details:
 * - Removed the previous `DndContext` and `SortableContext` implementation.
 * - The main content area now renders the `<PageCanvas />` component.
 * - A new `activePageIndex` state has been added to manage which page of the
 * character sheet is currently being edited.
 * - A `handleLayoutChange` handler has been implemented to receive layout
 * updates (position and size changes) from `react-grid-layout` within the
 * PageCanvas and update the main `sheet` state.
 * - The `handleAddBlock` function has been updated to create new blocks with a
 * default `layout` object, placing them at the top-left of the canvas.
 */
import { useState, type FC } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import type { Layout } from 'react-grid-layout';

import type { CharacterClass, SheetPage, SheetBlock } from '../../../db/types';
import { updateClass } from '../../../db/queries/class.queries';
import { blockTypes } from '../../../constants/sheetEditor.constants';
import { PageCanvas } from './PageCanvas'; // NEW: Import the canvas component

// --- COMPONENT PROPS ---
export interface ClassSheetEditorProps {
    characterClass: CharacterClass;
    onBack: () => void;
}

// --- COMPONENT DEFINITION ---
export const ClassSheetEditor: FC<ClassSheetEditorProps> = ({ characterClass, onBack }) => {
    // --- STATE ---
    const [sheet, setSheet] = useState<SheetPage[]>(characterClass.characterSheet || []);
    const [isSaving, setIsSaving] = useState(false);
    // NEW: State to track the currently visible page.
    const [activePageIndex, setActivePageIndex] = useState(0); // to be implemented

    // --- EVENT HANDLERS ---

    // Adds a new block to the currently active page.
    const handleAddBlock = (blockType: SheetBlock['type']) => {
        const newBlock: SheetBlock = {
            id: crypto.randomUUID(),
            type: blockType,
            // NEW: Provide a default layout for the new block.
            layout: { x: 0, y: 0, w: 12, h: 4, zIndex: 1 },
            content: blockType === 'rich_text' ? '' : blockType === 'inventory' ? [] : undefined,
        };

        setSheet((currentSheet) => {
            const newSheet = JSON.parse(JSON.stringify(currentSheet));
            if (newSheet.length === 0) {
                newSheet.push({ id: crypto.randomUUID(), name: 'Main Page', blocks: [] });
            }
            newSheet[activePageIndex].blocks.push(newBlock);
            return newSheet;
        });
    };

    // NEW: Handles layout changes from the PageCanvas (drag, resize).
    const handleLayoutChange = (newLayout: Layout[]) => {
        setSheet((currentSheet) => {
            const newSheet = JSON.parse(JSON.stringify(currentSheet));
            const currentPage = newSheet[activePageIndex];

            currentPage.blocks.forEach((block: SheetBlock) => {
                const layoutItem = newLayout.find((item) => item.i === block.id);
                if (layoutItem) {
                    block.layout.x = layoutItem.x;
                    block.layout.y = layoutItem.y;
                    block.layout.w = layoutItem.w;
                    block.layout.h = layoutItem.h;
                }
            });

            return newSheet;
        });
    };

    // Persists the current sheet layout to the database.
    const handleSaveSheet = async () => {
        setIsSaving(true);
        try {
            await updateClass(characterClass.id!, { characterSheet: sheet });
        } catch (error) {
            console.error('Failed to save sheet layout:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // --- RENDER LOGIC ---
    const currentPage = sheet[activePageIndex];

    // --- JSX ---
    return (
        <div className="panel sheet-editor">
            <div className="panel__header-actions">
                <button onClick={onBack} className="button">
                    <ArrowLeft size={16} /> Back to Class List
                </button>
                <h2 className="panel__title" style={{ border: 'none', padding: 0 }}>
                    Designing Sheet for: {characterClass.name}
                </h2>
                <button
                    onClick={handleSaveSheet}
                    className="button button--primary"
                    disabled={isSaving}
                >
                    <Save size={16} /> {isSaving ? 'Saving...' : 'Save Sheet Layout'}
                </button>
            </div>

            <div className="sheet-editor__content">
                {/* REWORK: The main content is now our PageCanvas */}
                {currentPage ? (
                    <PageCanvas
                        page={currentPage}
                        characterClass={characterClass}
                        onLayoutChange={handleLayoutChange}
                    />
                ) : (
                    <div className="page-canvas__container">
                        <p className="panel__empty-message">
                            This sheet has no pages. Add a page to begin.
                        </p>
                    </div>
                )}

                <div className="sheet-editor__sidebar">
                    <h3 className="sidebar__title">Add Blocks</h3>
                    {blockTypes.map(({ type, label, icon }) => (
                        <button
                            key={type}
                            onClick={() => handleAddBlock(type)}
                            className="button sidebar__block-button"
                        >
                            {icon} {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
