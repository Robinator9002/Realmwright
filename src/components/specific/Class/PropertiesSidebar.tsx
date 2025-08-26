// src/components/specific/Class/PropertiesSidebar.tsx

/**
 * COMMIT: feat(class-sheet): create foundational PropertiesSidebar component
 *
 * Rationale:
 * To enable the customization of sheet blocks on the canvas, this commit
 * introduces the PropertiesSidebar. This component will serve as the main UI
 * for editing the layout and styles of a selected block.
 *
 * Implementation Details:
 * - The component is conditionally rendered based on whether a `selectedBlock`
 * prop is provided.
 * - It includes a foundational "Layout" section with controlled number inputs
 * for editing a block's position (x, y) and dimensions (w, h).
 * - An `onUpdateBlock` callback prop is used to communicate changes back up to
 * the main ClassSheetEditor, ensuring a unidirectional data flow.
 * - A placeholder for "Component-Specific Properties" is included for future
 * expansion.
 */
import type { FC } from 'react';
import type { SheetBlock } from '../../../db/types';

// --- COMPONENT PROPS ---
interface PropertiesSidebarProps {
    selectedBlock: SheetBlock | null;
    onUpdateBlock: (blockId: string, newLayout: Partial<SheetBlock['layout']>) => void;
    onDeselect: () => void;
}

// --- COMPONENT DEFINITION ---
export const PropertiesSidebar: FC<PropertiesSidebarProps> = ({
    selectedBlock,
    onUpdateBlock,
    onDeselect,
}) => {
    // If no block is selected, the sidebar renders nothing.
    if (!selectedBlock) {
        return null;
    }

    // --- EVENT HANDLERS ---
    const handleLayoutChange = (field: keyof SheetBlock['layout'], value: string) => {
        const numericValue = parseInt(value, 10) || 0;
        onUpdateBlock(selectedBlock.id, { [field]: numericValue });
    };

    // --- JSX ---
    return (
        <div className="properties-sidebar">
            <div className="properties-sidebar__header">
                <h3 className="sidebar__title">Properties</h3>
                <button onClick={onDeselect} className="properties-sidebar__close-button">
                    &times;
                </button>
            </div>

            <div className="properties-sidebar__content">
                {/* Section for universal layout properties */}
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

                {/* Placeholder for future component-specific controls */}
                <div className="properties-sidebar__section">
                    <h4 className="properties-sidebar__section-title">Component Properties</h4>
                    <p className="panel__empty-message--small">
                        Select a component to see its specific options.
                    </p>
                </div>
            </div>
        </div>
    );
};
