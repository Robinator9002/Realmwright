// src/components/specific/Class/editor/sidebar/BlockLayoutEditor.tsx

/**
 * COMMIT: feat(class-sheet): extract BlockLayoutEditor component
 *
 * Rationale:
 * As the first step in refactoring the monolithic PropertiesSidebar, the UI
 * for editing a block's layout properties (x, y, w, h) has been extracted
 * into this dedicated component.
 *
 * Implementation Details:
 * - This component is purely presentational and is responsible for rendering
 * the four number inputs for the block's layout.
 * - It receives the selected block and the `onUpdateBlockLayout` callback
 * as props, ensuring it remains decoupled from the main editor's state.
 * - This improves code organization and separates the universal layout
 * controls from the block-specific property editors.
 */
import type { FC } from 'react';
import type { SheetBlock, SheetBlockLayout } from '../../../../../db/types';

interface BlockLayoutEditorProps {
    selectedBlock: SheetBlock;
    onUpdateBlockLayout: (blockId: string, newLayout: Partial<SheetBlockLayout>) => void;
}

export const BlockLayoutEditor: FC<BlockLayoutEditorProps> = ({
    selectedBlock,
    onUpdateBlockLayout,
}) => {
    const handleLayoutChange = (field: keyof SheetBlockLayout, value: string) => {
        const numericValue = parseInt(value, 10) || 0;
        onUpdateBlockLayout(selectedBlock.id, { [field]: numericValue });
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
                    <label className="form__label">Width</label>
                    <input
                        type="number"
                        className="form__input"
                        value={selectedBlock.layout.w}
                        onChange={(e) => handleLayoutChange('w', e.target.value)}
                    />
                </div>
                <div className="form__group">
                    <label className="form__label">Height</label>
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
