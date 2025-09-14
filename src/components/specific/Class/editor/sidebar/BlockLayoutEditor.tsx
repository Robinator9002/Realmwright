// src/components/specific/Class/editor/sidebar/BlockLayoutEditor.tsx

/**
 * COMMIT: refactor(class-sheet): connect BlockLayoutEditor to Zustand store
 *
 * Rationale:
 * As part of the final cleanup of the PropertiesSidebar, this component is
 * being refactored to connect directly to the Zustand store. It no longer
 * needs to receive the selected block or update functions via props.
 *
 * Implementation Details:
 * - Removed the component's props interface.
 * - It now uses the `useClassSheetStore` hook to get the `selectedBlock` and
 * the `updateBlockLayout` action.
 * - This change makes the component self-sufficient and resolves TypeScript
 * errors in its parent, `PropertiesSidebar`.
 */
import type { FC } from 'react';
import { useClassSheetStore } from '../../../../../stores/classSheetEditor.store';
import type { SheetBlockLayout } from '../../../../../db/types';

export const BlockLayoutEditor: FC = () => {
    // --- ZUSTAND STORE ---
    const { selectedBlock, updateBlockLayout } = useClassSheetStore((state) => ({
        selectedBlock: state.selectedBlock,
        updateBlockLayout: state.updateBlockLayout,
    }));

    if (!selectedBlock) {
        return null;
    }

    const handleLayoutChange = (field: keyof SheetBlockLayout, value: string) => {
        const numericValue = parseInt(value, 10);
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
