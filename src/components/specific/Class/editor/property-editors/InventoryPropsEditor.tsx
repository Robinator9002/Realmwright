// src/components/specific/Class/editor/property-editors/InventoryPropsEditor.tsx

/**
 * COMMIT: refactor(class-sheet): connect InventoryPropsEditor to Zustand store
 *
 * Rationale:
 * This commit completes Phase 3.2 by refactoring the final property editor,
 * InventoryPropsEditor, to be fully decoupled and connected to the central
 * Zustand store.
 *
 * Implementation Details:
 * - The component's props interface has been removed.
 * - It now uses the `useClassSheetStore` hook to select the `selectedBlock`
 * and the `updateBlockContent` action.
 * - All internal handlers (`handleAddItem`, `handleRemoveItem`, etc.) have
 * been updated to call the `updateBlockContent` action from the store,
- * ensuring changes are correctly propagated and saved.
 */
import type { FC } from 'react';
import { Plus, Trash2 } from 'lucide-react';
// NEW: Import the Zustand store.
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';
import type { InventoryItem } from '../../../SheetBlocks/character/InventoryBlock';

// This component no longer needs props.
export const InventoryPropsEditor: FC = () => {
    // --- ZUSTAND STORE ---
    const { selectedBlock, updateBlockContent } = useClassSheetStore((state) => ({
        selectedBlock: state.selectedBlock,
        updateBlockContent: state.updateBlockContent,
    }));

    // --- RENDER LOGIC ---
    if (!selectedBlock) {
        return null;
    }

    const items = (selectedBlock.content as InventoryItem[]) || [];

    const handleItemChange = (
        index: number,
        field: keyof InventoryItem,
        value: string | number,
    ) => {
        const newItems = [...items];
        // A type assertion is acceptable here as we control the object shape.
        (newItems[index] as any)[field] = value;
        updateBlockContent(selectedBlock.id, newItems);
    };

    const handleAddItem = () => {
        const newItem: InventoryItem = {
            id: crypto.randomUUID(),
            name: 'New Item',
            quantity: 1,
            description: '',
        };
        updateBlockContent(selectedBlock.id, [...items, newItem]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        updateBlockContent(selectedBlock.id, newItems);
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
