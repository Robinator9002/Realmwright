// src/components/specific/Class/editor/property-editors/InventoryPropsEditor.tsx

/**
 * COMMIT: feat(class-sheet): extract InventoryPropsEditor component
 *
 * Rationale:
 * This commit provides the final piece of the PropertiesSidebar refactor,
 * extracting the UI for editing a class's starting inventory into this
 * dedicated component.
 *
 * Implementation Details:
 * - The component renders a list of inputs for managing the name and quantity
 * of starting items.
 * - It includes functionality to add and remove items from the list.
 * - All changes are propagated up to the main ClassSheetEditor via the
 * `onUpdateBlockContent` callback, which updates the block's `content`
 * property with the new array of `InventoryItem` objects.
 */
import type { FC } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { SheetBlock } from '../../../../../db/types';
import type { InventoryItem } from '../../../SheetBlocks/character/InventoryBlock';

interface InventoryPropsEditorProps {
    selectedBlock: SheetBlock;
    onUpdateBlockContent: (blockId: string, content: any) => void;
}

export const InventoryPropsEditor: FC<InventoryPropsEditorProps> = ({
    selectedBlock,
    onUpdateBlockContent,
}) => {
    const items = (selectedBlock.content as InventoryItem[]) || [];

    const handleItemChange = (
        index: number,
        field: keyof InventoryItem,
        value: string | number,
    ) => {
        const newItems = [...items];
        // A type assertion is acceptable here as we control the object shape.
        (newItems[index] as any)[field] = value;
        onUpdateBlockContent(selectedBlock.id, newItems);
    };

    const handleAddItem = () => {
        const newItem: InventoryItem = {
            id: crypto.randomUUID(),
            name: 'New Item',
            quantity: 1,
            description: '',
        };
        onUpdateBlockContent(selectedBlock.id, [...items, newItem]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdateBlockContent(selectedBlock.id, newItems);
    };

    return (
        <div className="inventory-editor">
            <label className="form__label">Starting Items</label>
            <div className="inventory-editor__list">
                {items.map((item, index) => (
                    <div key={item.id} className="inventory-editor__item">
                        <input
                            type="number"
                            placeholder="Qty"
                            className="form__input inventory-editor__qty"
                            value={item.quantity}
                            onChange={(e) =>
                                handleItemChange(
                                    index,
                                    'quantity',
                                    parseInt(e.target.value, 10) || 1,
                                )
                            }
                        />
                        <input
                            type="text"
                            placeholder="Item Name"
                            className="form__input"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        />
                        <button
                            onClick={() => handleRemoveItem(index)}
                            className="button button--danger button--icon"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={handleAddItem} className="button mt-2">
                <Plus size={16} /> Add Item
            </button>
        </div>
    );
};
