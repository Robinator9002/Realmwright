// src/components/specific/Class/PageControls.tsx

/**
 * COMMIT: feat(class-sheet): create PageControls component for multi-page management
 *
 * Rationale:
 * To support multi-page character sheets, a dedicated UI component is needed
 * to handle page navigation and management. This commit introduces the
 * PageControls component, which isolates this functionality from the main
 * ClassSheetEditor.
 *
 * Implementation Details:
 * - The component receives the array of pages, the active page index, and
 * callback handlers for selecting, adding, and deleting pages.
 * - It renders the pages as a series of tab-like buttons, visually indicating
 * the active page.
 * - It includes "Add Page" and "Delete Page" buttons to allow the user to
 * modify the sheet's structure.
 * - This component is purely presentational and relies on the parent
 * ClassSheetEditor to manage the actual state changes.
 */
import type { FC } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { SheetPage } from '../../../db/types';

// --- COMPONENT PROPS ---
interface PageControlsProps {
    pages: SheetPage[];
    activePageIndex: number;
    onSelectPage: (index: number) => void;
    onAddPage: () => void;
    onDeletePage: (index: number) => void;
}

// --- COMPONENT DEFINITION ---
export const PageControls: FC<PageControlsProps> = ({
    pages,
    activePageIndex,
    onSelectPage,
    onAddPage,
    onDeletePage,
}) => {
    return (
        <div className="page-controls">
            <div className="page-controls__tabs">
                {pages.map((page, index) => (
                    <button
                        key={page.id}
                        onClick={() => onSelectPage(index)}
                        className={`page-controls__tab ${
                            index === activePageIndex ? 'page-controls__tab--active' : ''
                        }`}
                    >
                        {page.name || `Page ${index + 1}`}
                    </button>
                ))}
            </div>
            <div className="page-controls__actions">
                <button onClick={onAddPage} className="button button--icon" title="Add Page">
                    <Plus size={16} />
                </button>
                <button
                    onClick={() => onDeletePage(activePageIndex)}
                    className="button button--danger button--icon"
                    title="Delete Current Page"
                    // Disable deleting the last page.
                    disabled={pages.length <= 1}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};
