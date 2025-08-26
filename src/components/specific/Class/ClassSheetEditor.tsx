// src/components/specific/Class/ClassSheetEditor.tsx

/**
 * COMMIT: feat(class-sheet): integrate PageControls for multi-page functionality
 *
 * Rationale:
 * To complete the multi-page feature, the new PageControls component must be
 * integrated into the main editor. This commit wires up the UI to the editor's
 * state, allowing users to add, delete, and navigate between pages.
 *
 * Implementation Details:
 * - The `<PageControls />` component is now rendered at the bottom of the editor.
 * - Implemented the `handleSelectPage`, `handleAddPage`, and `handleDeletePage`
 * functions to manipulate the `sheet` state array.
 * - The `handleAddPage` function now automatically switches the view to the
 * newly created page for a seamless user experience.
 * - The editor's grid layout has been updated to accommodate the new controls bar.
 */
import { useState, useMemo, type FC } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import type { Layout } from 'react-grid-layout';

import type { CharacterClass, SheetPage, SheetBlock } from '../../../db/types';
import { updateClass } from '../../../db/queries/class.queries';
import { blockTypes } from '../../../constants/sheetEditor.constants';
import { PageCanvas } from './PageCanvas';
import { PropertiesSidebar } from './PropertiesSidebar';
import { PageControls } from './PageControls'; // NEW: Import page controls

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
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    // --- DERIVED STATE ---
    const selectedBlock = useMemo(
        () => sheet[activePageIndex]?.blocks.find((block) => block.id === selectedBlockId) || null,
        [sheet, activePageIndex, selectedBlockId],
    );

    // --- EVENT HANDLERS ---

    const handleAddBlock = (blockType: SheetBlock['type']) => {
        const newBlock: SheetBlock = {
            id: crypto.randomUUID(),
            type: blockType,
            layout: { x: 0, y: 0, w: 24, h: 8, zIndex: 1 },
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

    const handleLayoutChange = (newLayout: Layout[]) => {
        setSheet((currentSheet) => {
            const newSheet = JSON.parse(JSON.stringify(currentSheet));
            const currentPage = newSheet[activePageIndex];
            currentPage.blocks.forEach((block: SheetBlock) => {
                const layoutItem = newLayout.find((item) => item.i === block.id);
                if (layoutItem) {
                    block.layout = { ...block.layout, ...layoutItem };
                }
            });
            return newSheet;
        });
    };

    const handleUpdateBlockLayout = (blockId: string, newLayout: Partial<SheetBlock['layout']>) => {
        setSheet((currentSheet) => {
            const newSheet = JSON.parse(JSON.stringify(currentSheet));
            const block = newSheet[activePageIndex].blocks.find(
                (b: SheetBlock) => b.id === blockId,
            );
            if (block) {
                block.layout = { ...block.layout, ...newLayout };
            }
            return newSheet;
        });
    };

    // NEW: Adds a new blank page to the end of the sheet.
    const handleAddPage = () => {
        const newPage: SheetPage = {
            id: crypto.randomUUID(),
            name: `Page ${sheet.length + 1}`,
            blocks: [],
        };
        const newSheet = [...sheet, newPage];
        setSheet(newSheet);
        // Automatically switch to the new page.
        setActivePageIndex(newSheet.length - 1);
    };

    // NEW: Deletes a page at a specific index.
    const handleDeletePage = (indexToDelete: number) => {
        const newSheet = sheet.filter((_, index) => index !== indexToDelete);
        setSheet(newSheet);
        // If the deleted page was the active one, move to the previous page.
        if (activePageIndex >= indexToDelete) {
            setActivePageIndex(Math.max(0, activePageIndex - 1));
        }
    };

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
    const editorLayoutClass = selectedBlock
        ? 'sheet-editor__content--with-properties'
        : 'sheet-editor__content';

    return (
        <div className="panel sheet-editor">
            <div className="panel__header-actions">
                <button onClick={onBack} className="button">
                    <ArrowLeft size={16} /> Back
                </button>
                <h2 className="panel__title" style={{ border: 'none', padding: 0 }}>
                    Designing: {characterClass.name}
                </h2>
                <button
                    onClick={handleSaveSheet}
                    className="button button--primary"
                    disabled={isSaving}
                >
                    <Save size={16} /> {isSaving ? 'Saving...' : 'Save Sheet'}
                </button>
            </div>

            <div className={editorLayoutClass}>
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

                {currentPage ? (
                    <PageCanvas
                        page={currentPage}
                        characterClass={characterClass}
                        onLayoutChange={handleLayoutChange}
                        selectedBlockId={selectedBlockId}
                        onSelectBlock={setSelectedBlockId}
                    />
                ) : (
                    <div className="page-canvas__container">
                        <p className="panel__empty-message">This sheet has no pages.</p>
                    </div>
                )}

                <PropertiesSidebar
                    selectedBlock={selectedBlock}
                    onUpdateBlock={handleUpdateBlockLayout}
                    onDeselect={() => setSelectedBlockId(null)}
                />
            </div>

            {/* NEW: Render the page controls at the bottom. */}
            <PageControls
                pages={sheet}
                activePageIndex={activePageIndex}
                onSelectPage={setActivePageIndex}
                onAddPage={handleAddPage}
                onDeletePage={handleDeletePage}
            />
        </div>
    );
};
