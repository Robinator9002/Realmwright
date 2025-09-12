// src/components/specific/Class/ClassSheetEditor.tsx

/**
 * COMMIT: fix(class-sheet): correct layout class application to show sidebar
 *
 * Rationale:
 * A logical error in how the layout's CSS class was being applied prevented
 * the properties sidebar from ever appearing. The modifier class was
 * replacing the base class instead of augmenting it, causing the component
 * to lose its `display: grid` property on block selection.
 *
 * Implementation Details:
 * - The `editorLayoutClass` variable has been removed.
 * - The `className` on the main content `div` has been changed to a template
 * literal that conditionally includes the `--with-properties` modifier class
 * alongside the base `sheet-editor__content` class.
 * - This ensures the grid layout properties are always present and correctly
 * modified, fixing the bug and allowing the properties sidebar to render.
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
    const [sheet, setSheet] = useState<SheetPage[]>(characterClass.characterSheet || []);
    const [isSaving, setIsSaving] = useState(false);
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    const selectedBlock = useMemo(
        () => sheet[activePageIndex]?.blocks.find((block) => block.id === selectedBlockId) || null,
        [sheet, activePageIndex, selectedBlockId],
    );

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

    const handleAddPage = () => {
        const newPage: SheetPage = {
            id: crypto.randomUUID(),
            name: `Page ${sheet.length + 1}`,
            blocks: [],
        };
        const newSheet = [...sheet, newPage];
        setSheet(newSheet);
        setActivePageIndex(newSheet.length - 1);
    };

    const handleDeletePage = (indexToDelete: number) => {
        const newSheet = sheet.filter((_, index) => index !== indexToDelete);
        setSheet(newSheet);
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

    const currentPage = sheet[activePageIndex];

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

            {/* FIX: Use a template literal to conditionally apply the modifier class. */}
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
