// src/components/specific/Class/editor/PageControls.tsx

/**
 * COMMIT: refactor(class-sheet): connect PageControls to Zustand store
 *
 * Rationale:
 * As part of Phase 1.3, this commit refactors the PageControls component to
 * connect directly to the `useClassSheetStore`. This eliminates the need for
 * prop drilling from the main editor component.
 *
 * Implementation Details:
 * - The component's props interface has been completely removed.
 * - It now imports and uses the `useClassSheetStore` hook to select the
 * necessary state (`pages`, `activePageIndex`) and actions (`setActivePageIndex`,
 * `addPage`, `deletePage`, `renamePage`).
 * - All internal logic now reads from and dispatches to the central store,
 * making the component self-sufficient and decoupled from its parent.
 */
import { useState, useEffect, type FC } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';

// This component no longer needs to receive any props.
export const PageControls: FC = () => {
    // --- ZUSTAND STORE ---
    const { pages, activePageIndex, setActivePageIndex, addPage, deletePage, renamePage } =
        useClassSheetStore((state) => ({
            pages: state.editableClass?.characterSheet || [],
            activePageIndex: state.activePageIndex,
            setActivePageIndex: state.setActivePageIndex,
            addPage: state.addPage,
            deletePage: state.deletePage,
            renamePage: state.renamePage,
        }));

    // Local state for the inline-editing UI is still managed here.
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    useEffect(() => {
        // If the user clicks away or changes pages, cancel editing.
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
            // Dispatch the rename action to the store.
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

    return (
        <div className="page-controls">
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
