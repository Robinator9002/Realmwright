// src/components/specific/Class/editor/PropertiesSidebar.tsx

import type { FC } from 'react';
import { Trash2 } from 'lucide-react';
// BUILD FIX: Add file extensions to relative imports to fix resolver errors.
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store.ts';
import { BlockLayoutEditor } from './sidebar/BlockLayoutEditor.tsx';
import { BlockSpecificPropertiesEditor } from './sidebar/BlockSpecificPropertiesEditor.tsx';

export const PropertiesSidebar: FC = () => {
    // --- ZUSTAND STORE ---
    const {
        selectedBlock,
        setSelectedBlockId,
        deleteBlock,
        pageWidth,
        pageHeight,
        setPageDimensions,
    } = useClassSheetStore((state) => ({
        selectedBlock: state.selectedBlock,
        setSelectedBlockId: state.setSelectedBlockId,
        deleteBlock: state.deleteBlock,
        pageWidth: state.pageWidth,
        pageHeight: state.pageHeight,
        setPageDimensions: state.setPageDimensions,
    }));

    // Handler for page dimension inputs.
    const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numericValue = parseInt(value, 10) || 0;
        if (name === 'width') {
            setPageDimensions({ width: numericValue, height: pageHeight });
        } else {
            setPageDimensions({ width: pageWidth, height: numericValue });
        }
    };

    return (
        <aside className="properties-sidebar">
            <div className="properties-sidebar__header">
                <h3 className="sidebar__title">
                    {selectedBlock ? 'Block Properties' : 'Page Settings'}
                </h3>
                {selectedBlock && (
                    <button
                        onClick={() => setSelectedBlockId(null)}
                        className="properties-sidebar__close-button"
                    >
                        &times;
                    </button>
                )}
            </div>

            <div className="properties-sidebar__content">
                <div className="properties-sidebar__section">
                    <h4 className="properties-sidebar__section-title">Page Dimensions</h4>
                    <div className="properties-sidebar__grid">
                        <div className="form__group">
                            <label htmlFor="page-width" className="form__label">
                                Width (px)
                            </label>
                            <input
                                id="page-width"
                                name="width"
                                type="number"
                                className="form__input"
                                value={pageWidth}
                                onChange={handleDimensionChange}
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="page-height" className="form__label">
                                Height (px)
                            </label>
                            <input
                                id="page-height"
                                name="height"
                                type="number"
                                className="form__input"
                                value={pageHeight}
                                onChange={handleDimensionChange}
                            />
                        </div>
                    </div>
                </div>

                {selectedBlock && (
                    <>
                        <BlockLayoutEditor />
                        <BlockSpecificPropertiesEditor />
                    </>
                )}
            </div>

            {selectedBlock && (
                <div className="properties-sidebar__footer">
                    <button
                        onClick={() => deleteBlock(selectedBlock.id)}
                        className="button button--danger w-full"
                    >
                        <Trash2 size={16} /> Delete Block
                    </button>
                </div>
            )}
        </aside>
    );
};
