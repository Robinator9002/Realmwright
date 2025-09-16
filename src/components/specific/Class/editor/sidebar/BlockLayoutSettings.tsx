// src/components/specific/Class/editor/sidebar/BlockLayoutSettings.tsx

import type { FC } from 'react';
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';
import type { SheetBlock, SheetBlockLayout } from '../../../../../db/types';

/**
 * A component dedicated to editing the layout properties (position and size)
 * of the currently selected sheet block.
 */
export const BlockLayoutSettings: FC = () => {
    // --- ZUSTAND STORE ---
    const { editableClass, activePageIndex, selectedBlockId, updateBlockLayout } =
        useClassSheetStore((state) => ({
            editableClass: state.editableClass,
            activePageIndex: state.activePageIndex,
            selectedBlockId: state.selectedBlockId,
            updateBlockLayout: state.updateBlockLayout,
        }));

    // --- DERIVED STATE ---
    // Find the selected block object to ensure we're always working with the latest data.
    const selectedBlock: SheetBlock | null =
        editableClass?.characterSheet[activePageIndex]?.blocks.find(
            (b) => b.id === selectedBlockId,
        ) || null;

    if (!selectedBlock) {
        return null;
    }

    // --- EVENT HANDLERS ---

    /**
     * Handles changes to any of the layout input fields.
     * @param field The layout property to update (e.g., 'x', 'w').
     * @param value The new value from the input element.
     */
    const handleLayoutChange = (field: keyof SheetBlockLayout, value: string) => {
        const numericValue = parseInt(value, 10);
        // Only update if the value is a valid number to prevent data corruption.
        if (!isNaN(numericValue)) {
            updateBlockLayout(selectedBlock.id, { [field]: numericValue });
        }
    };

    return (
        <div className="properties-sidebar__section">
            <h4 className="properties-sidebar__section-title">Layout</h4>
            <div className="properties-sidebar__grid">
                <div className="form__group">
                    <label className="form__label">X</label>
                    <input
                        type="number"
                        className="form__input"
                        value={selectedBlock.layout.x}
                        onChange={(e) => handleLayoutChange('x', e.target.value)}
                    />
                </div>
                <div className="form__group">
                    <label className="form__label">Y</label>
                    <input
                        type="number"
                        className="form__input"
                        value={selectedBlock.layout.y}
                        onChange={(e) => handleLayoutChange('y', e.target.value)}
                    />
                </div>
                <div className="form__group">
                    <label className="form__label">Width (W)</label>
                    <input
                        type="number"
                        className="form__input"
                        value={selectedBlock.layout.w}
                        onChange={(e) => handleLayoutChange('w', e.target.value)}
                    />
                </div>
                <div className="form__group">
                    <label className="form__label">Height (H)</label>
                    <input
                        type="number"
                        className="form__input"
                        value={selectedBlock.layout.h}
                        onChange={(e) => handleLayoutChange('h', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};
