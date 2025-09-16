// src/components/specific/SheetBlocks/settings/content/AbilityTreeSettings.tsx

import type { FC } from 'react';
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';
import type { SheetBlock } from '../../../../../db/types';

/**
 * A settings component specifically for the 'ability_tree' block type.
 * It allows the user to select which Ability Tree should be displayed within the block.
 */
export const AbilityTreeSettings: FC = () => {
    // --- ZUSTAND STORE ---
    const { allAbilityTrees, editableClass, activePageIndex, selectedBlockId, updateBlockConfig } =
        useClassSheetStore((state) => ({
            allAbilityTrees: state.allAbilityTrees,
            editableClass: state.editableClass,
            activePageIndex: state.activePageIndex,
            selectedBlockId: state.selectedBlockId,
            updateBlockConfig: state.updateBlockConfig,
        }));

    // --- DERIVED STATE ---
    const selectedBlock: SheetBlock | null =
        editableClass?.characterSheet[activePageIndex]?.blocks.find(
            (b) => b.id === selectedBlockId,
        ) || null;

    // This should not happen if used correctly, but it's a necessary safeguard.
    if (!selectedBlock) {
        return null;
    }

    // --- EVENT HANDLERS ---

    /**
     * Handles changes to the tree selection dropdown.
     * @param e - The React change event from the select element.
     */
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        // Convert the string value from the select to a number, or undefined if empty.
        const treeId = value ? parseInt(value, 10) : undefined;
        updateBlockConfig(selectedBlock.id, { treeId });
    };

    return (
        <div className="form__group">
            <label className="form__label">Ability Tree to Display</label>
            <select
                className="form__select"
                value={selectedBlock.config?.treeId ?? ''}
                onChange={handleSelectChange}
            >
                <option value="">-- Select a Tree --</option>
                {allAbilityTrees.map((tree) => (
                    <option key={tree.id} value={tree.id}>
                        {tree.name}
                    </option>
                ))}
            </select>
        </div>
    );
};
