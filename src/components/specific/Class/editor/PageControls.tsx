// src/components/specific/Class/editor/PageControls.tsx

/**
 * COMMIT: feat(class-sheet): implement inline page renaming UI
 *
 * Rationale:
 * To fulfill the requirement for page management, this commit introduces the
 * UI and local state management for renaming page tabs directly in the
 * PageControls component.
 *
 * Implementation Details:
 * - The component now has local state (`editingIndex`, `editingName`) to
 * track which page tab is currently being edited.
 * - An `onDoubleClick` handler has been added to the page tabs to initiate
 * the renaming process.
 * - When a tab is being edited, it is replaced with a controlled `<input>` field.
 * - The `onBlur` and `onKeyDown` ('Enter') events on the input field trigger
 * a new `onRenamePage` callback prop, committing the change.
 * - This provides a clean, intuitive, and self-contained UI for page renaming.
 */
import { useState, useEffect, type FC } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { SheetPage } from '../../../../db/types';

interface PageControlsProps {
    pages: SheetPage[];
    activePageIndex: number;
    onSelectPage: (index: number) => void;
    onAddPage: () => void;
    onDeletePage: (index: number) => void;
    // NEW: Add a callback for when a page is renamed.
    onRenamePage: (index: number, newName: string) => void;
}

export const PageControls: FC<PageControlsProps> = ({
    pages,
    activePageIndex,
    onSelectPage,
    onAddPage,
    onDeletePage,
    onRenamePage,
}) => {
    // State to manage which tab is currently being edited.
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
            onRenamePage(editingIndex, editingName);
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
                            onClick={() => onSelectPage(index)}
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
                <button onClick={onAddPage} className="button button--icon" title="Add Page">
                    <Plus size={16} />
                </button>
                <button
                    onClick={() => onDeletePage(activePageIndex)}
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
