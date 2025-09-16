// src/components/specific/SheetBlocks/settings/character/InventoryBlockSettings.tsx

import type { FC } from 'react';
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';
import type { SheetBlock } from '../../../../../db/types';

/**
 * A settings component for the InventoryBlock, allowing the user to define
 * a custom title for the block.
 */
export const InventoryBlockSettings: FC = () => {
    // --- ZUSTAND STORE ---
    const { selectedBlockId, getBlockById, updateBlockConfig } = useClassSheetStore((state) => ({
        selectedBlockId: state.selectedBlockId,
        getBlockById: (id: string): SheetBlock | undefined =>
            state.editableClass?.characterSheet[state.activePageIndex]?.blocks.find(
                (b) => b.id === id,
            ),
        updateBlockConfig: state.updateBlockConfig,
    }));

    // --- DERIVED STATE ---
    const selectedBlock = selectedBlockId ? getBlockById(selectedBlockId) : null;
    const title = selectedBlock?.config?.title || '';

    if (!selectedBlock) {
        return null;
    }

    // --- EVENT HANDLERS ---
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateBlockConfig(selectedBlock.id, { title: e.target.value });
    };

    return (
        <div className="form__group">
            <label htmlFor="block-title" className="form__label">
                Block Title
            </label>
            <input
                id="block-title"
                type="text"
                className="form__input"
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g., Inventory"
            />
        </div>
    );
};
