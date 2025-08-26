// src/components/specific/Class/ClassSheetEditor.tsx

/**
 * COMMIT: feat(class-sheet): integrate PropertiesSidebar into editor
 *
 * Rationale:
 * To make the block customization UI functional, this commit integrates the
 * new PropertiesSidebar into the main ClassSheetEditor. The editor now
- * manages the state for the selected block and orchestrates the data flow
 * between the canvas and the properties panel.
 *
 * Implementation Details:
 * - The editor's main layout is now a three-column grid to accommodate the
 * new sidebar, which is conditionally rendered.
 * - Added `selectedBlockId` state to track the active block. A derived
 * `selectedBlock` object is calculated from this ID.
 * - Implemented handlers (`handleSelectBlock`, `handleUpdateBlockLayout`,
 * `handleDeselect`) to manage the selection state and process updates
 * from the sidebar.
 * - The `PageCanvas` now receives the `selectedBlockId` and the
 * `onSelectBlock` handler to enable block selection from the canvas.
 */
import { useState, useMemo, type FC } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import type { Layout } from 'react-grid-layout';

import type { CharacterClass, SheetPage, SheetBlock } from '../../../db/types';
import { updateClass } from '../../../db/queries/class.queries';
import { blockTypes } from '../../../constants/sheetEditor.constants';
import { PageCanvas } from './PageCanvas';
import { PropertiesSidebar } from './PropertiesSidebar'; // NEW: Import the sidebar

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
    // NEW: State to track the ID of the currently selected block.
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    // --- DERIVED STATE ---
    // Find the full block object based on the selected ID.
    const selectedBlock = useMemo(
        () => sheet[activePageIndex]?.blocks.find((block) => block.id === selectedBlockId) || null,
        [sheet, activePageIndex, selectedBlockId],
    );

    // --- EVENT HANDLERS ---

    const handleAddBlock = (blockType: SheetBlock['type']) => {
        const newBlock: SheetBlock = {
            id: crypto.randomUUID(),
            type: blockType,
            layout: { x: 0, y: 0, w: 24, h: 8, zIndex: 1 }, // Default to half-width
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
                    block.layout.x = layoutItem.x;
                    block.layout.y = layoutItem.y;
                    block.layout.w = layoutItem.w;
                    block.layout.h = layoutItem.h;
                }
            });
            return newSheet;
        });
    };

    // NEW: Updates a block's layout from the PropertiesSidebar.
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

    // --- JSX ---
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

            {/* REWORK: The main content grid now adapts to show the properties sidebar. */}
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
                        <p className="panel__empty-message">Add a page to begin.</p>
                    </div>
                )}

                <PropertiesSidebar
                    selectedBlock={selectedBlock}
                    onUpdateBlock={handleUpdateBlockLayout}
                    onDeselect={() => setSelectedBlockId(null)}
                />
            </div>
        </div>
    );
};
