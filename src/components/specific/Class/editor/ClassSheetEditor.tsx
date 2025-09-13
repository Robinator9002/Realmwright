// src/components/specific/Class/editor/ClassSheetEditor.tsx

/**
 * COMMIT: refactor(class-sheet): implement Immer for efficient state updates
 *
 * Rationale:
 * This commit addresses a major performance bottleneck identified in the
 * technical plan (Phase 1.1). Previously, every state update relied on a
 * deep clone using `JSON.parse(JSON.stringify())`, which is computationally
 * expensive and can lead to data loss.
 *
 * Implementation Details:
 * - The `immer` library has been introduced to handle immutable state updates.
 * - All state-mutating handler functions (e.g., `handleLayoutChange`,
 * `handleAddBlock`, `handleDeleteBlock`) have been refactored.
 * - Instead of manually cloning the state, these functions now use Immer's
 * `produce()` function, which allows for direct, "mutative" syntax while
 * ensuring efficient and correct immutable updates under the hood.
 * - This change significantly improves the editor's performance and makes the
 * state update logic cleaner and more maintainable.
 */
import { useState, useMemo, type FC } from 'react';
import { produce } from 'immer';
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
        setEditableClass(
            produce((draft) => {
                if (draft.characterSheet.length === 0) {
                    draft.characterSheet.push({
                        id: crypto.randomUUID(),
                        name: 'Main Page',
                        blocks: [],
                    });
                }
                const currentPageBlocks = draft.characterSheet[activePageIndex].blocks;
                const nextY =
                    currentPageBlocks.length > 0
                        ? Math.max(...currentPageBlocks.map((b) => b.layout.y + b.layout.h))
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
            }),
        );
    };

    const handleDeleteBlock = (blockId: string) => {
        setEditableClass(
            produce((draft) => {
                const currentPage = draft.characterSheet[activePageIndex];
                currentPage.blocks = currentPage.blocks.filter((b) => b.id !== blockId);
            }),
        );
        setSelectedBlockId(null);
    };

    const handleLayoutChange = (newLayout: Layout[]) => {
        setEditableClass(
            produce((draft) => {
                const currentPage = draft.characterSheet[activePageIndex];
                currentPage.blocks.forEach((block) => {
                    const layoutItem = newLayout.find((item) => item.i === block.id);
                    if (layoutItem) {
                        block.layout = { ...block.layout, ...layoutItem };
                    }
                });
            }),
        );
    };

    const handleUpdateBlockLayout = (blockId: string, newLayout: Partial<SheetBlock['layout']>) => {
        setEditableClass(
            produce((draft) => {
                const block = draft.characterSheet[activePageIndex].blocks.find(
                    (b) => b.id === blockId,
                );
                if (block) {
                    block.layout = { ...block.layout, ...newLayout };
                }
            }),
        );
    };

    const handleUpdateBlockContent = (blockId: string, newContent: any) => {
        setEditableClass(
            produce((draft) => {
                const block = draft.characterSheet[activePageIndex].blocks.find(
                    (b) => b.id === blockId,
                );
                if (block) {
                    block.content = newContent;
                }
            }),
        );
    };

    const handleUpdateBaseStat = (statId: number, value: number) => {
        setEditableClass(
            produce((draft) => {
                draft.baseStats[statId] = value;
            }),
        );
    };

    const handleAddPage = () => {
        const newPage: SheetPage = {
            id: crypto.randomUUID(),
            name: `Page ${sheet.length + 1}`,
            blocks: [],
        };
        setEditableClass(
            produce((draft) => {
                draft.characterSheet.push(newPage);
            }),
        );
        setActivePageIndex(sheet.length); // Set index to the new page
    };

    const handleDeletePage = (indexToDelete: number) => {
        setEditableClass(
            produce((draft) => {
                draft.characterSheet = draft.characterSheet.filter(
                    (_, index) => index !== indexToDelete,
                );
            }),
        );
        if (activePageIndex >= indexToDelete) {
            setActivePageIndex(Math.max(0, activePageIndex - 1));
        }
    };

    const handleRenamePage = (pageIndex: number, newName: string) => {
        setEditableClass(
            produce((draft) => {
                const pageToRename = draft.characterSheet[pageIndex];
                if (pageToRename) {
                    pageToRename.name = newName;
                }
            }),
        );
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
