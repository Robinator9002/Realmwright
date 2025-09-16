// src/components/specific/Class/editor/sidebar/BlockAppearanceSettings.tsx

import type { FC } from 'react';
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';
import type { SheetBlock, SheetBlockStyles } from '../../../../../db/types';

/**
 * A component for editing the visual appearance properties (e.g., text alignment)
 * of the currently selected sheet block.
 */
export const BlockAppearanceSettings: FC = () => {
    // --- ZUSTAND STORE ---
    // Note: We will add `updateBlockStyles` to the store in the next step.
    const { editableClass, activePageIndex, selectedBlockId, updateBlockStyles } =
        useClassSheetStore((state) => ({
            editableClass: state.editableClass,
            activePageIndex: state.activePageIndex,
            selectedBlockId: state.selectedBlockId,
            updateBlockStyles: state.updateBlockStyles,
        }));

    // --- DERIVED STATE ---
    const selectedBlock: SheetBlock | null =
        editableClass?.characterSheet[activePageIndex]?.blocks.find(
            (b) => b.id === selectedBlockId,
        ) || null;

    if (!selectedBlock) {
        return null;
    }

    // --- EVENT HANDLERS ---

    /**
     * Handles changes to any of the style input fields.
     * @param field The style property to update (e.g., 'textAlign').
     * @param value The new value from the input element.
     */
    const handleStyleChange = (field: keyof SheetBlockStyles, value: string) => {
        // We ensure the value is one of the allowed types for textAlign.
        if (field === 'textAlign') {
            const typedValue = value as SheetBlockStyles['textAlign'];
            updateBlockStyles(selectedBlock.id, { [field]: typedValue });
        }
    };

    return (
        <div className="properties-sidebar__section">
            <h4 className="properties-sidebar__section-title">Appearance</h4>
            <div className="form__group">
                <label className="form__label">Text Align</label>
                <select
                    className="form__select"
                    value={selectedBlock.styles?.textAlign || 'left'}
                    onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </select>
            </div>
        </div>
    );
};
