// src/components/specific/SheetBlocks/character/InventoryBlock.tsx

import { useState, type FC } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';
import type { SheetBlock, InventoryItem } from '../../../../db/types';

export interface InventoryBlockProps {
    block: SheetBlock;
}

/**
 * A sheet block for managing a list of inventory items.
 */
export const InventoryBlock: FC<InventoryBlockProps> = ({ block }) => {
    const updateBlockContent = useClassSheetStore((state) => state.updateBlockContent);
    const items = (block.content as InventoryItem[]) || [];
    const [newItemName, setNewItemName] = useState('');

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
        field: keyof InventoryItem,
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
            <h4 className="inventory-block__title">{block.config?.title || 'Inventory'}</h4>
            {/* REWORK: Add a conditional empty state message */}
            {items.length === 0 ? (
                <p className="panel__empty-message--small">No items in inventory. Add one below.</p>
            ) : (
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
                                                handleItemChange(
                                                    item.id,
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="inventory-item__remove-button"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
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
