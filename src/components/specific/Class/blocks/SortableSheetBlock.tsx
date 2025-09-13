// src/components/specific/Class/SortableSheetBlock.tsx

/**
 * COMMIT: fix(class-sheet): remove obsolete width logic from SortableSheetBlock
 *
 * Rationale:
 * This component was referencing the `block.width` property, which was removed
 * from the `SheetBlock` type during the migration to `react-grid-layout`.
 * This caused a TypeScript error.
 *
 * Implementation Details:
 * - Removed the `blockWidthClass` variable and its associated logic.
 * - The `className` on the root div is now just the static 'sheet-block'.
 * - This component is likely deprecated and will be removed later, but this
 * change resolves the immediate compilation error.
 */
import type { FC, ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import type { SheetBlock } from '../../../../db/types';

// --- COMPONENT PROPS ---
interface SortableSheetBlockProps {
    block: SheetBlock;
    onRemove: (blockId: string) => void;
    children: ReactNode;
}

// --- COMPONENT DEFINITION ---
export const SortableSheetBlock: FC<SortableSheetBlockProps> = ({ block, onRemove, children }) => {
    // --- HOOKS ---
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: block.id,
    });

    // --- STYLES ---
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // FIX: Removed the `blockWidthClass` logic as `block.width` no longer exists.
    // The layout is now handled entirely by react-grid-layout.

    // --- JSX ---
    return (
        <div
            ref={setNodeRef}
            style={style}
            className="sheet-block" // The dynamic width class is no longer needed.
        >
            <div className="sheet-block__content">{children}</div>

            <div className="sheet-block__drag-handle" {...attributes} {...listeners}>
                <GripVertical size={18} />
            </div>

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
