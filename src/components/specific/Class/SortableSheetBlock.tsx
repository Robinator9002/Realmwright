// src/components/specific/Class/SortableSheetBlock.tsx

/**
 * COMMIT: feat(class-sheet): create SortableSheetBlock wrapper component
 *
 * Rationale:
 * To create a clean and maintainable ClassSheetEditor, the logic for making
 * a sheet block draggable and sortable has been extracted into this dedicated
 * wrapper component. This isolates the `dnd-kit` implementation details from
 * the main editor's layout and state management logic.
 *
 * Implementation Details:
 * - This component uses the `useSortable` hook from `dnd-kit` to get the
 * necessary props for drag-and-drop functionality.
 * - It renders a common "chrome" for each block in the editor, including a
 * drag handle and a remove button.
 * - The actual block content is passed in as `children`, making this a
 * flexible and reusable wrapper.
 * - CSS classes are added based on the block's `width` property to support
 * the new grid-based layout.
 */
import type { FC, ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import type { SheetBlock } from '../../../db/types';

// --- COMPONENT PROPS ---
interface SortableSheetBlockProps {
    block: SheetBlock;
    onRemove: (blockId: string) => void;
    children: ReactNode;
}

// --- COMPONENT DEFINITION ---
export const SortableSheetBlock: FC<SortableSheetBlockProps> = ({ block, onRemove, children }) => {
    // --- HOOKS ---
    // The useSortable hook from dnd-kit provides all the necessary tools.
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: block.id,
    });

    // --- STYLES ---
    // This style object applies the transform from dnd-kit to move the block
    // during drag operations, creating a smooth animation.
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        // When dragging, we lower the opacity to give a visual cue.
        opacity: isDragging ? 0.5 : 1,
    };

    // Determine the CSS class for the grid layout based on the block's width.
    const blockWidthClass =
        block.width === 'full' ? 'sheet-block--full-width' : 'sheet-block--half-width';

    // --- JSX ---
    return (
        <div
            ref={setNodeRef}
            style={style}
            // Combine the base class with the dynamic width class.
            className={`sheet-block ${blockWidthClass}`}
        >
            {/* The main content of the block is passed in from the parent. */}
            <div className="sheet-block__content">{children}</div>

            {/* The drag handle, which receives the dnd-kit listeners. */}
            <div className="sheet-block__drag-handle" {...attributes} {...listeners}>
                <GripVertical size={18} />
            </div>

            {/* A button to remove the block from the sheet. */}
            <button
                onClick={() => onRemove(block.id)}
                className="sheet-block__remove-button"
                title="Remove Block"
            >
                <X size={16} />
            </button>
        </div>
    );
};
