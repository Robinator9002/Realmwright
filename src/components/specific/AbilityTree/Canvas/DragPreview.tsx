// src/components/specific/AbilityTree/Canvas/DragPreview.tsx

/**
 * COMMIT: feat(ability-tree): isolate drag preview visuals into new component
 *
 * This commit creates the `DragPreview` component.
 *
 * Rationale:
 * The main `AbilityTreeCanvas` component was responsible for rendering both the
 * React Flow canvas and the visual feedback elements for dragging (the snap
 * target and tier highlight). To improve separation of concerns and clean up
 * the canvas component, these visual elements have been extracted into their
 * own dedicated, presentational component.
 *
 * Implementation Details:
 * - The component receives all necessary positional data as props.
 * - It is a pure presentational component with no internal logic.
 * - This makes the main canvas component's render method cleaner and more
 * focused on the React Flow instance itself.
 */
import type { FC } from 'react';

// Defines the shape of the data needed to render the preview visuals.
export interface DragPreviewState {
    snappedX: number;
    snappedY: number;
    targetCenterX: number;
    targetCenterY: number;
    tierHighlightY: number;
    visible: boolean;
}

// A constant representing the "zeroed-out" or initial state for the preview.
export const initialDragPreviewState: DragPreviewState = {
    snappedX: 0,
    snappedY: 0,
    targetCenterX: 0,
    targetCenterY: 0,
    tierHighlightY: 0,
    visible: false,
};

interface DragPreviewProps {
    dragPreviewState: DragPreviewState;
}

export const DragPreview: FC<DragPreviewProps> = ({ dragPreviewState }) => {
    // If the preview isn't visible, render nothing.
    if (!dragPreviewState.visible) {
        return null;
    }

    return (
        <>
            {/* The horizontal bar that highlights the entire target tier. */}
            <div
                className="snap-tier-highlight"
                style={{
                    height: `180px`, // TIER_HEIGHT
                    transform: `translateY(${dragPreviewState.tierHighlightY}px)`,
                }}
            />
            {/* The circular target indicating the exact snap point. */}
            <div
                className="snap-target"
                style={{
                    transform: `translate(${dragPreviewState.targetCenterX}px, ${dragPreviewState.targetCenterY}px)`,
                }}
            />
        </>
    );
};
