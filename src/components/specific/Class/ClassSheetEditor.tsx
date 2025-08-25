// src/components/specific/Class/ClassSheetEditor.tsx

/**
 * COMMIT: refactor(class-sheet): overhaul ClassSheetEditor with grid layout
 *
 * Rationale:
 * This commit completely rebuilds the ClassSheetEditor to fulfill the vision
 * of a modular, drag-and-drop, grid-based canvas for designing character
 * sheets. The previous implementation was a simple vertical list placeholder.
 *
 * Implementation Details:
 * - **Component Composition:** The editor is now composed of smaller, dedicated
 * components (`SortableSheetBlock`, `SheetBlockRenderer`), making the main
 * component responsible only for state and layout orchestration.
 * - **Grid-Based Canvas:** The main canvas area is now a CSS grid, capable of
 * displaying blocks in a two-column layout based on their `width` property.
 * - **State Management:** All logic for managing the sheet's state (adding,
 * removing, reordering, and updating blocks) is handled here.
 * - **Drag & Drop:** Implemented `DndContext` from dnd-kit to manage the
 * drag-and-drop functionality, including the logic for reordering blocks
 * in the `handleDragEnd` function.
 * - **Sidebar:** The sidebar now correctly adds new blocks with a default
 * `width` of 'half', ready to be placed on the grid.
 */
import { useState, type FC } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { CharacterClass, SheetPage, SheetBlock } from '../../../db/types';
import { updateClass } from '../../../db/queries/class.queries';
import { blockTypes } from '../../../constants/sheetEditor.constants';

import { SortableSheetBlock } from './SortableSheetBlock';
import { SheetBlockRenderer } from './SheetBlockRenderer';

// --- COMPONENT PROPS ---
export interface ClassSheetEditorProps {
    characterClass: CharacterClass;
    onBack: () => void; // Function to return to the ClassManager list
}

// --- COMPONENT DEFINITION ---
export const ClassSheetEditor: FC<ClassSheetEditorProps> = ({ characterClass, onBack }) => {
    // --- STATE ---
    // The main state for the sheet layout, initialized from the prop.
    const [sheet, setSheet] = useState<SheetPage[]>(characterClass.characterSheet || []);
    const [isSaving, setIsSaving] = useState(false);

    // --- DND-KIT SETUP ---
    // Sets up sensors for pointer (mouse/touch) and keyboard interactions.
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // --- EVENT HANDLERS ---

    // Adds a new block of a given type to the first page of the sheet.
    const handleAddBlock = (blockType: SheetBlock['type']) => {
        const newBlock: SheetBlock = {
            id: crypto.randomUUID(),
            type: blockType,
            width: 'half', // Default to half-width for new blocks.
            content: blockType === 'rich_text' ? '' : blockType === 'inventory' ? [] : undefined,
        };

        setSheet((currentSheet) => {
            const newSheet = JSON.parse(JSON.stringify(currentSheet));
            // If there are no pages, create one first.
            if (newSheet.length === 0) {
                newSheet.push({ id: crypto.randomUUID(), name: 'Main Page', blocks: [] });
            }
            newSheet[0].blocks.push(newBlock);
            return newSheet;
        });
    };

    // Removes a block from the sheet by its ID.
    const handleRemoveBlock = (blockId: string) => {
        setSheet((currentSheet) => {
            const newSheet = JSON.parse(JSON.stringify(currentSheet));
            if (newSheet.length > 0) {
                newSheet[0].blocks = newSheet[0].blocks.filter(
                    (block: SheetBlock) => block.id !== blockId,
                );
            }
            return newSheet;
        });
    };

    // Updates the content of a specific block (e.g., text in a RichTextBlock).
    const handleBlockContentChange = (blockId: string, newContent: any) => {
        setSheet((currentSheet) => {
            const newSheet = JSON.parse(JSON.stringify(currentSheet));
            if (newSheet.length > 0) {
                const blockToUpdate = newSheet[0].blocks.find(
                    (block: SheetBlock) => block.id === blockId,
                );
                if (blockToUpdate) {
                    blockToUpdate.content = newContent;
                }
            }
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
            // In a real app, show a user-facing error notification here.
        } finally {
            setIsSaving(false);
        }
    };

    // Handles the end of a drag-and-drop operation to reorder blocks.
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSheet((currentSheet) => {
                const newSheet = JSON.parse(JSON.stringify(currentSheet));
                const blocks = newSheet[0].blocks;
                const oldIndex = blocks.findIndex((b: SheetBlock) => b.id === active.id);
                const newIndex = blocks.findIndex((b: SheetBlock) => b.id === over.id);

                // Use the arrayMove utility from dnd-kit to reorder the blocks.
                newSheet[0].blocks = arrayMove(blocks, oldIndex, newIndex);
                return newSheet;
            });
        }
    }

    // --- RENDER LOGIC ---
    // A safeguard to get the current page, handling cases where the sheet might be empty.
    const currentPage = sheet && sheet.length > 0 ? sheet[0] : null;

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
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="sheet-editor__canvas">
                        {currentPage ? (
                            <SortableContext
                                items={currentPage.blocks.map((b) => b.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {currentPage.blocks.map((block) => (
                                    <SortableSheetBlock
                                        key={block.id}
                                        block={block}
                                        onRemove={handleRemoveBlock}
                                    >
                                        <SheetBlockRenderer
                                            block={block}
                                            characterClass={characterClass}
                                            onContentChange={handleBlockContentChange}
                                        />
                                    </SortableSheetBlock>
                                ))}
                            </SortableContext>
                        ) : (
                            <p className="panel__empty-message">
                                This sheet is empty. Add a block to get started.
                            </p>
                        )}
                    </div>
                </DndContext>
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
