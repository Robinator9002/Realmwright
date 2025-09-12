// src/components/specific/Class/editor/ClassSheetEditor.tsx

/**
 * COMMIT: refactor(class-sheet): centralize state management in ClassSheetEditor
 *
 * Rationale:
 * To support editing properties outside the character sheet itself (e.g.,
 * base stats), the editor's state management has been refactored. The
 * component now holds the entire CharacterClass object in its state, rather
 * than just the `characterSheet` array. This makes the editor the single
 * source of truth for all class-related data during an editing session.
 *
 * Implementation Details:
 * - A new state, `editableClass`, has been introduced to hold the class object.
 * - The previous `sheet` state has been removed. All functions that modified
 * the sheet now create a deep copy of `editableClass`, modify its
 * `characterSheet` property, and update the state via `setEditableClass`.
 * - New handler functions, `handleUpdateBlockContent` and `handleUpdateBaseStat`,
 * have been added to manage content and base stat changes respectively.
 * - These new handlers are passed down to the PropertiesSidebar, enabling the
 * next phase of development.
 * - The `handleSaveSheet` function was renamed to `handleSaveChanges` and now
 * saves both the `characterSheet` and `baseStats` to the database.
 */
import { useState, useMemo, type FC } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import type { Layout } from 'react-grid-layout';

import type { CharacterClass, SheetPage, SheetBlock } from '../../../../db/types';
import { updateClass } from '../../../../db/queries/character/class.queries';
import { blockTypes } from '../../../../constants/sheetEditor.constants';
import { PageCanvas } from './PageCanvas';
import { PropertiesSidebar } from './PropertiesSidebar';
import { PageControls } from './PageControls';

export interface ClassSheetEditorProps {
    characterClass: CharacterClass;
    onBack: () => void;
}

export const ClassSheetEditor: FC<ClassSheetEditorProps> = ({ characterClass, onBack }) => {
    // REFACTOR: The entire class object is now managed in state.
    const [editableClass, setEditableClass] = useState<CharacterClass>(characterClass);
    const [isSaving, setIsSaving] = useState(false);
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    // The character sheet is now derived directly from the stateful class object.
    const sheet = editableClass.characterSheet || [];

    const selectedBlock = useMemo(
        () => sheet[activePageIndex]?.blocks.find((block) => block.id === selectedBlockId) || null,
        [sheet, activePageIndex, selectedBlockId],
    );

    // All handlers now update the `editableClass` state object.
    const handleAddBlock = (blockType: SheetBlock['type']) => {
        const newBlock: SheetBlock = {
            id: crypto.randomUUID(),
            type: blockType,
            layout: { x: 0, y: 0, w: 24, h: 8, zIndex: 1 },
            content: blockType === 'rich_text' ? '' : blockType === 'inventory' ? [] : undefined,
        };

        setEditableClass((currentClass) => {
            const newClass = JSON.parse(JSON.stringify(currentClass));
            if (newClass.characterSheet.length === 0) {
                newClass.characterSheet.push({
                    id: crypto.randomUUID(),
                    name: 'Main Page',
                    blocks: [],
                });
            }
            newClass.characterSheet[activePageIndex].blocks.push(newBlock);
            return newClass;
        });
    };

    const handleLayoutChange = (newLayout: Layout[]) => {
        setEditableClass((currentClass) => {
            const newClass = JSON.parse(JSON.stringify(currentClass));
            const currentPage = newClass.characterSheet[activePageIndex];
            currentPage.blocks.forEach((block: SheetBlock) => {
                const layoutItem = newLayout.find((item) => item.i === block.id);
                if (layoutItem) {
                    block.layout = { ...block.layout, ...layoutItem };
                }
            });
            return newClass;
        });
    };

    const handleUpdateBlockLayout = (blockId: string, newLayout: Partial<SheetBlock['layout']>) => {
        setEditableClass((currentClass) => {
            const newClass = JSON.parse(JSON.stringify(currentClass));
            const block = newClass.characterSheet[activePageIndex].blocks.find(
                (b: SheetBlock) => b.id === blockId,
            );
            if (block) {
                block.layout = { ...block.layout, ...newLayout };
            }
            return newClass;
        });
    };

    // NEW: Handler for block-specific content changes.
    const handleUpdateBlockContent = (blockId: string, newContent: any) => {
        setEditableClass((currentClass) => {
            const newClass = JSON.parse(JSON.stringify(currentClass));
            const block = newClass.characterSheet[activePageIndex].blocks.find(
                (b: SheetBlock) => b.id === blockId,
            );
            if (block) {
                block.content = newContent;
            }
            return newClass;
        });
    };

    // NEW: Handler for updating the class's base stats.
    const handleUpdateBaseStat = (statId: number, value: number) => {
        setEditableClass((currentClass) => {
            const newClass = JSON.parse(JSON.stringify(currentClass));
            newClass.baseStats[statId] = value;
            return newClass;
        });
    };

    const handleAddPage = () => {
        const newPage: SheetPage = {
            id: crypto.randomUUID(),
            name: `Page ${sheet.length + 1}`,
            blocks: [],
        };
        setEditableClass((currentClass) => {
            const newClass = JSON.parse(JSON.stringify(currentClass));
            newClass.characterSheet.push(newPage);
            setActivePageIndex(newClass.characterSheet.length - 1);
            return newClass;
        });
    };

    const handleDeletePage = (indexToDelete: number) => {
        setEditableClass((currentClass) => {
            const newClass = JSON.parse(JSON.stringify(currentClass));
            newClass.characterSheet = newClass.characterSheet.filter(
                (_: any, index: number) => index !== indexToDelete,
            );
            if (activePageIndex >= indexToDelete) {
                setActivePageIndex(Math.max(0, activePageIndex - 1));
            }
            return newClass;
        });
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await updateClass(editableClass.id!, {
                characterSheet: editableClass.characterSheet,
                baseStats: editableClass.baseStats,
            });
        } catch (error) {
            console.error('Failed to save changes:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const currentPage = sheet[activePageIndex];

    return (
        <div className="panel sheet-editor">
            <div className="panel__header-actions">
                <button onClick={onBack} className="button">
                    <ArrowLeft size={16} /> Back
                </button>
                <h2 className="panel__title" style={{ border: 'none', padding: 0 }}>
                    Designing: {editableClass.name}
                </h2>
                <button
                    onClick={handleSaveChanges}
                    className="button button--primary"
                    disabled={isSaving}
                >
                    <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div
                className={`sheet-editor__content ${
                    selectedBlock ? 'sheet-editor__content--with-properties' : ''
                }`}
            >
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
                        characterClass={editableClass}
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
                    onUpdateBlockLayout={handleUpdateBlockLayout}
                    // NEW: Pass the new handlers to the sidebar.
                    onUpdateBlockContent={handleUpdateBlockContent}
                    onUpdateBaseStat={handleUpdateBaseStat}
                    characterClass={editableClass}
                    onDeselect={() => setSelectedBlockId(null)}
                />
            </div>

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
