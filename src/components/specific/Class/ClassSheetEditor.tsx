// src/components/specific/Class/ClassSheetEditor.tsx
import { useState, type FC } from 'react';
import {
    ArrowLeft,
    X,
    Type,
    BarChart2,
    Swords,
    Backpack,
    FileText,
    GripVertical,
} from 'lucide-react';
// NEW: Import from Dnd Kit instead of react-beautiful-dnd
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
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { CharacterClass, SheetPage, SheetBlock } from '../../../db/types';
import { updateClass } from '../../../db/queries/class.queries';
import { StatsBlock } from '../SheetBlocks/StatsBlock';
import { DetailsBlock } from '../SheetBlocks/DetailsBlock';
import { AbilityTreeBlock } from '../SheetBlocks/AbilityTreeBlock';
import { RichTextBlock } from '../SheetBlocks/RichTextBlock';
import { InventoryBlock } from '../SheetBlocks/InventoryBlock';

// --- Reusable Sortable Item Wrapper ---
const SortableBlockItem: FC<{ block: SheetBlock; children: React.ReactNode }> = ({
    block,
    children,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: block.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="sheet-block">
            <div className="sheet-block__drag-handle" {...attributes} {...listeners}>
                <GripVertical size={16} />
            </div>
            {children}
        </div>
    );
};

export interface ClassSheetEditorProps {
    characterClass: CharacterClass;
    onBack: () => void; // Function to return to the ClassManager list
}

const blockTypes: { type: SheetBlock['type']; label: string; icon: React.ReactNode }[] = [
    { type: 'details', label: 'Details', icon: <Type size={16} /> },
    { type: 'stats', label: 'Stats Panel', icon: <BarChart2 size={16} /> },
    { type: 'ability_tree', label: 'Ability Tree', icon: <Swords size={16} /> },
    { type: 'inventory', label: 'Inventory', icon: <Backpack size={16} /> },
    { type: 'rich_text', label: 'Rich Text', icon: <FileText size={16} /> },
];

const BlockRenderer: FC<{
    block: SheetBlock;
    characterClass: CharacterClass;
    onContentChange: (blockId: string, newContent: any) => void;
}> = ({ block, characterClass, onContentChange }) => {
    // This component's logic remains the same
    switch (block.type) {
        case 'details':
            return <DetailsBlock characterClass={characterClass} />;
        case 'stats':
            return <StatsBlock baseStats={characterClass.baseStats} />;
        case 'ability_tree':
            return (
                <AbilityTreeBlock
                    content={block.content}
                    onContentChange={(newContent) => onContentChange(block.id, newContent)}
                />
            );
        case 'rich_text':
            return (
                <RichTextBlock
                    content={block.content}
                    onContentChange={(newContent) => onContentChange(block.id, newContent)}
                />
            );
        case 'inventory':
            return (
                <InventoryBlock
                    content={block.content}
                    onContentChange={(newContent) => onContentChange(block.id, newContent)}
                />
            );
        default:
            return (
                <div className="sheet-block__header">
                    <span className="sheet-block__type">{block.type.replace('_', ' ')}</span>
                </div>
            );
    }
};

export const ClassSheetEditor: FC<ClassSheetEditorProps> = ({ characterClass, onBack }) => {
    const [sheet, setSheet] = useState<SheetPage[]>(characterClass.characterSheet);
    const [isSaving, setIsSaving] = useState(false);

    // Dnd Kit sensors for pointer (mouse, touch) and keyboard interactions
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleAddBlock = (blockType: SheetBlock['type']) => {
        const newBlock: SheetBlock = {
            id: crypto.randomUUID(),
            type: blockType,
            content: blockType === 'rich_text' ? '' : blockType === 'inventory' ? [] : undefined,
        };
        const newSheet = JSON.parse(JSON.stringify(sheet));
        newSheet[0].blocks.push(newBlock);
        setSheet(newSheet);
    };

    const handleRemoveBlock = (blockId: string) => {
        const newSheet = JSON.parse(JSON.stringify(sheet));
        newSheet[0].blocks = newSheet[0].blocks.filter((block: SheetBlock) => block.id !== blockId);
        setSheet(newSheet);
    };

    const handleBlockContentChange = (blockId: string, newContent: any) => {
        const newSheet = JSON.parse(JSON.stringify(sheet));
        const blockToUpdate = newSheet[0].blocks.find((block: SheetBlock) => block.id === blockId);
        if (blockToUpdate) {
            blockToUpdate.content = newContent;
            setSheet(newSheet);
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

    // NEW: Dnd Kit's drag end handler
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSheet((currentSheet) => {
                const newSheet = JSON.parse(JSON.stringify(currentSheet));
                const blocks = newSheet[0].blocks;
                const oldIndex = blocks.findIndex((b: SheetBlock) => b.id === active.id);
                const newIndex = blocks.findIndex((b: SheetBlock) => b.id === over.id);

                newSheet[0].blocks = arrayMove(blocks, oldIndex, newIndex);
                return newSheet;
            });
        }
    }

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
                    {isSaving ? 'Saving...' : 'Save Sheet Layout'}
                </button>
            </div>

            <div className="sheet-editor__content">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sheet[0].blocks.map((b) => b.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="sheet-editor__canvas">
                            {sheet[0].blocks.map((block) => (
                                <SortableBlockItem key={block.id} block={block}>
                                    <div className="sheet-block__content">
                                        <BlockRenderer
                                            block={block}
                                            characterClass={characterClass}
                                            onContentChange={handleBlockContentChange}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleRemoveBlock(block.id)}
                                        className="sheet-block__remove-button"
                                        title="Remove Block"
                                    >
                                        <X size={16} />
                                    </button>
                                </SortableBlockItem>
                            ))}
                        </div>
                    </SortableContext>
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
