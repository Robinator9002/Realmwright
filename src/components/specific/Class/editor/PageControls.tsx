// src/components/specific/Class/editor/PageControls.tsx

import { useState, useEffect, type FC } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';

export const PageControls: FC = () => {
    // --- ZUSTAND STORE ---
    const {
        pages,
        activePageIndex,
        setActivePageIndex,
        addPage,
        deletePage,
        renamePage,
        pageWidth,
        pageHeight,
        setPageDimensions,
    } = useClassSheetStore((state) => ({
        pages: state.editableClass?.characterSheet || [],
        activePageIndex: state.activePageIndex,
        setActivePageIndex: state.setActivePageIndex,
        addPage: state.addPage,
        deletePage: state.deletePage,
        renamePage: state.renamePage,
        pageWidth: state.pageWidth,
        pageHeight: state.pageHeight,
        setPageDimensions: state.setPageDimensions,
    }));

    // Local state for the inline-editing UI
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    useEffect(() => {
        if (editingIndex !== null && editingIndex !== activePageIndex) {
            setEditingIndex(null);
        }
    }, [activePageIndex, editingIndex]);

    const handleStartEditing = (index: number, currentName: string) => {
        setEditingIndex(index);
        setEditingName(currentName);
    };

    const handleFinishEditing = () => {
        if (editingIndex !== null && editingName.trim()) {
            renamePage(editingIndex, editingName);
        }
        setEditingIndex(null);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleFinishEditing();
        } else if (event.key === 'Escape') {
            setEditingIndex(null);
        }
    };

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
        <div className="page-controls">
            <div className="page-controls__left-section">
                <div className="page-controls__tabs">
                    {pages.map((page, index) =>
                        editingIndex === index ? (
                            <input
                                key={page.id}
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onBlur={handleFinishEditing}
                                onKeyDown={handleKeyDown}
                                className="page-controls__tab-input"
                                autoFocus
                            />
                        ) : (
                            <button
                                key={page.id}
                                onClick={() => setActivePageIndex(index)}
                                onDoubleClick={() => handleStartEditing(index, page.name)}
                                className={`page-controls__tab ${
                                    index === activePageIndex ? 'page-controls__tab--active' : ''
                                }`}
                                title="Double-click to rename"
                            >
                                {page.name || `Page ${index + 1}`}
                            </button>
                        ),
                    )}
                </div>
                <div className="page-controls__settings">
                    <div className="form__group--inline">
                        <label htmlFor="page-width">W:</label>
                        <input
                            id="page-width"
                            name="width"
                            type="number"
                            className="form__input--small"
                            value={pageWidth}
                            onChange={handleDimensionChange}
                        />
                    </div>
                    <div className="form__group--inline">
                        <label htmlFor="page-height">H:</label>
                        <input
                            id="page-height"
                            name="height"
                            type="number"
                            className="form__input--small"
                            value={pageHeight}
                            onChange={handleDimensionChange}
                        />
                    </div>
                </div>
            </div>

            <div className="page-controls__actions">
                <button onClick={addPage} className="button button--icon" title="Add Page">
                    <Plus size={16} />
                </button>
                <button
                    onClick={() => deletePage(activePageIndex)}
                    className="button button--danger button--icon"
                    title="Delete Current Page"
                    disabled={pages.length <= 1}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};
