// src/components/specific/Class/editor/ClassSheetEditor.tsx

/**
 * COMMIT: feat(class-sheet): implement page renaming logic
 *
 * Rationale:
 * To complete the page renaming feature, this commit introduces the
 * `handleRenamePage` function. This function connects the `onRenamePage`
 * callback from the `PageControls` component to the editor's main state.
 *
 * Implementation Details:
 * - A new `handleRenamePage` function has been created. It finds the correct
 * page by its index and updates its `name` property within the
 * `editableClass` state.
 * - This handler is now passed as the `onRenamePage` prop to the
 * `<PageControls />` component, making the feature fully functional.
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
    const [editableClass, setEditableClass] = useState<CharacterClass>(characterClass);
    const [isSaving, setIsSaving] = useState(false);
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    const sheet = editableClass.characterSheet || [];

    const selectedBlock = useMemo(
        () => sheet[activePageIndex]?.blocks.find((block) => block.id === selectedBlockId) || null,
        [sheet, activePageIndex, selectedBlockId],
    );

    const handleAddBlock = (blockType: SheetBlock['type']) => {
        setEditableClass((currentClass) => {
            const newClass = JSON.parse(JSON.stringify(currentClass));
            if (newClass.characterSheet.length === 0) {
                newClass.characterSheet.push({
                    id: crypto.randomUUID(),
                    name: 'Main Page',
                    blocks: [],
                });
            }
            const currentPageBlocks = newClass.characterSheet[activePageIndex].blocks;
            const nextY =
                currentPageBlocks.length > 0
                    ? Math.max(...currentPageBlocks.map((b: SheetBlock) => b.layout.y + b.layout.h))
                    : 0;
            const newBlock: SheetBlock = {
                id: crypto.randomUUID(),
                type: blockType,
                layout: { x: 0, y: nextY, w: 24, h: 8, zIndex: 1 },
                content:
                    blockType === 'rich_text' || blockType === 'notes'
                        ? ''
                        : blockType === 'inventory'
                        ? []
                        : undefined,
            };
            currentPageBlocks.push(newBlock);
            return newClass;
        });
    };

    const handleDeleteBlock = (blockId: string) => {
        setEditableClass((currentClass) => {
            const newClass = JSON.parse(JSON.stringify(currentClass));
            const currentPage = newClass.characterSheet[activePageIndex];
            currentPage.blocks = currentPage.blocks.filter((b: SheetBlock) => b.id !== blockId);
            return newClass;
        });
        setSelectedBlockId(null);
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

    const handleRenamePage = (pageIndex: number, newName: string) => {
        setEditableClass((currentClass) => {
            const newClass = JSON.parse(JSON.stringify(currentClass));
            const pageToRename = newClass.characterSheet[pageIndex];
            if (pageToRename) {
                pageToRename.name = newName;
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
                    onUpdateBlockContent={handleUpdateBlockContent}
                    onUpdateBaseStat={handleUpdateBaseStat}
                    characterClass={editableClass}
                    onDeselect={() => setSelectedBlockId(null)}
                    onDeleteBlock={handleDeleteBlock}
                />
            </div>

            <PageControls
                pages={sheet}
                activePageIndex={activePageIndex}
                onSelectPage={setActivePageIndex}
                onAddPage={handleAddPage}
                onDeletePage={handleDeletePage}
                onRenamePage={handleRenamePage}
            />
        </div>
    );
};
