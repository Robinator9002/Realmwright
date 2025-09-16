// src/components/specific/SheetBlocks/settings/content/NotesBlockSettings.tsx

import type { FC } from 'react';
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';
import type { SheetBlock } from '../../../../../db/types';

/**
 * A settings component for the NotesBlock, allowing the user to define
 * a custom placeholder text.
 */
export const NotesBlockSettings: FC = () => {
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
    const placeholder = selectedBlock?.config?.placeholder || '';

    if (!selectedBlock) {
        return null;
    }

    // --- EVENT HANDLERS ---
    const handlePlaceholderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateBlockConfig(selectedBlock.id, { placeholder: e.target.value });
    };

    return (
        <div className="form__group">
            <label htmlFor="block-placeholder" className="form__label">
                Placeholder Text
            </label>
            <input
                id="block-placeholder"
                type="text"
                className="form__input"
                value={placeholder}
                onChange={handlePlaceholderChange}
                placeholder="e.g., 'Enter notes here...'"
            />
        </div>
    );
};
