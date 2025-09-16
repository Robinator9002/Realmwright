// src/components/specific/SheetBlocks/character/InventoryBlock.tsx

import { useState, type FC } from 'react';
import { Plus, Trash2 } from 'lucide-react';
// REWORK: Import the store and the full block type.
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';
import type { SheetBlock } from '../../../../db/types';

// Define the shape of a single inventory item
export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    description: string;
}

// REWORK: The component now accepts the entire block object.
export interface InventoryBlockProps {
    block: SheetBlock;
}

/**
 * A sheet block for managing a list of inventory items.
 */
export const InventoryBlock: FC<InventoryBlockProps> = ({ block }) => {
    // --- ZUSTAND STORE ---
    const updateBlockContent = useClassSheetStore((state) => state.updateBlockContent);

    // --- LOCAL UI STATE ---
    const [newItemName, setNewItemName] = useState('');

    // --- DERIVED STATE ---
    // The items are now read directly from the block's content.
    const items: InventoryItem[] = block.content || [];
    // The title is now configurable, with a fallback.
    const title = block.config?.title || 'Inventory';

    // --- EVENT HANDLERS ---
    // All handlers now update the central store directly.
    const handleAddItem = () => {
        if (!newItemName.trim()) return;
        const newItem: InventoryItem = {
            id: crypto.randomUUID(),
            name: newItemName,
            quantity: 1,
            description: '',
        };
        const newItems = [...items, newItem];
        updateBlockContent(block.id, newItems);
        setNewItemName('');
    };

    const handleRemoveItem = (itemId: string) => {
        const newItems = items.filter((item) => item.id !== itemId);
        updateBlockContent(block.id, newItems);
    };

    const handleItemChange = (
        itemId: string,
        field: keyof Omit<InventoryItem, 'id'>, // id is not editable
        value: string | number,
    ) => {
        const newItems = items.map((item) => {
            if (item.id === itemId) {
                return { ...item, [field]: value };
            }
            return item;
        });
        updateBlockContent(block.id, newItems);
    };

    return (
        <div className="inventory-block">
            <h4 className="inventory-block__title">{title}</h4>
            <div className="inventory-block__table-wrapper">
                <table className="inventory-block__table">
                    <thead>
                        <tr>
                            <th>Qty</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <input
                                        type="number"
                                        className="inventory-item__input inventory-item__input--qty"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            handleItemChange(
                                                item.id,
                                                'quantity',
                                                parseInt(e.target.value, 10) || 1,
                                            )
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="inventory-item__input"
                                        value={item.name}
                                        onChange={(e) =>
                                            handleItemChange(item.id, 'name', e.target.value)
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="inventory-item__input"
                                        value={item.description}
                                        onChange={(e) =>
                                            handleItemChange(item.id, 'description', e.target.value)
                                        }
                                    />
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="inventory-item__remove-button"
                                        title={`Remove ${item.name}`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="inventory-block__add-form">
                <input
                    type="text"
                    className="form__input"
                    placeholder="New item name..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                />
                <button onClick={handleAddItem} className="button button--primary">
                    <Plus size={16} /> Add Item
                </button>
            </div>
        </div>
    );
};
