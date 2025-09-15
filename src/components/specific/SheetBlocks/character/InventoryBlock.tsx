// src/components/specific/SheetBlocks/character/InventoryBlock.tsx

/**
 * COMMIT: refactor(character-sheet): convert InventoryBlock to a fully controlled component
 *
 * Rationale:
 * The component was previously holding a local copy of the inventory items in
 * its own state (`useState`). This is an anti-pattern for controlled
 * components, as it creates a duplicate source of truth and can lead to bugs
 * where the UI and the central store are out of sync.
 *
 * Implementation Details:
 * - The `const [items, setItems] = useState(...)` hook has been completely removed.
 * - The component now uses the `content` prop directly as the source of truth
 * for rendering the list of items.
 * - All event handlers (`handleAddItem`, `handleRemoveItem`, `handleItemChange`)
 * have been updated to construct a new array and immediately call the
 * `onContentChange` callback, delegating all state updates to the parent
 * (in this case, the Zustand store).
 * - This change makes the component stateless and fully controlled, ensuring
 * a single, reliable data flow.
 */
import { useState, type FC } from 'react';
import { Plus, Trash2 } from 'lucide-react';

// Define the shape of a single inventory item
export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    description: string;
}

export interface InventoryBlockProps {
    // The content for this block is an array of items.
    content: InventoryItem[] | undefined;
    onContentChange: (newContent: InventoryItem[]) => void;
}

/**
 * A sheet block for managing a list of inventory items.
 */
export const InventoryBlock: FC<InventoryBlockProps> = ({ content, onContentChange }) => {
    // The component no longer holds its own state for the items.
    // It directly uses the `content` prop, making it a "controlled component".
    const items = content || [];
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
        onContentChange(newItems); // Immediately update the parent state
        setNewItemName('');
    };

    const handleRemoveItem = (itemId: string) => {
        const newItems = items.filter((item) => item.id !== itemId);
        onContentChange(newItems);
    };

    const handleItemChange = (
        itemId: string,
        field: keyof InventoryItem,
        value: string | number,
    ) => {
        const newItems = items.map((item) => {
            if (item.id === itemId) {
                // A type assertion is safe here as we control the inputs.
                return { ...item, [field]: value };
            }
            return item;
        });
        onContentChange(newItems);
    };

    return (
        <div className="inventory-block">
            <h4 className="inventory-block__title">Inventory</h4>
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
