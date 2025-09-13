// src/components/specific/AbilityTree/Canvas/overlays/NodeDragHighlighter.tsx

/**
 * COMMIT: feat(ability-tree): extract NodeDragHighlighter component
 *
 * Rationale:
 * This commit extracts the logic for rendering the SVG highlight effect that
 * appears during a node drag operation into a dedicated component.
 *
 * Implementation Details:
 * - This component receives the currently dragging node and the canvas zoom
 * level as props. It returns null if no node is being dragged.
 * - It is solely responsible for calculating the position of the tier highlight
 * rectangle and the column snap circle, based on the node's real-time
 * position.
 * - This change completes the extraction of all SVG overlay logic from the
 * main AbilityTreeCanvas, making it much cleaner.
 */
import type { FC } from 'react';
import type { Node } from 'reactflow';
import {
    TIER_HEIGHT,
    COLUMN_WIDTH,
    NODE_START_X,
    NODE_HEIGHT,
} from '../../../../../constants/abilityTree.constants';

const GRID_SPAN = 100000; // A large number to ensure lines cover the viewport

interface NodeDragHighlighterProps {
    draggingNode: Node | undefined;
    zoom: number;
    x: number;
    y: number;
}

export const NodeDragHighlighter: FC<NodeDragHighlighterProps> = ({ draggingNode, zoom, x, y }) => {
    if (!draggingNode) {
        return null;
    }

    // Calculate the Y position of the tier the node is currently hovering over.
    const highlightRectY =
        (Math.max(1, Math.floor((draggingNode.position.y + NODE_HEIGHT / 2) / TIER_HEIGHT) + 1) -
            1) *
        TIER_HEIGHT;

    // Calculate the X position for the center of the column the node is closest to.
    const snapCircleX =
        NODE_START_X +
        Math.round((draggingNode.position.x + NODE_HEIGHT / 2 - NODE_START_X) / COLUMN_WIDTH) *
            COLUMN_WIDTH;

    // Calculate the Y position for the center of the tier.
    const snapCircleY = highlightRectY + TIER_HEIGHT / 2;

    return (
        <svg
            style={{
                position: 'absolute',
                zIndex: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
            }}
            aria-hidden="true"
        >
            <g transform={`translate(${x}, ${y}) scale(${zoom})`}>
                {/* A faint rectangle highlighting the entire tier row */}
                <rect
                    x={-GRID_SPAN / 2}
                    y={highlightRectY}
                    width={GRID_SPAN}
                    height={TIER_HEIGHT}
                    fill="var(--color-accent)"
                    opacity={0.05}
                />
                {/* A dashed circle indicating the precise snap point */}
                <circle
                    cx={snapCircleX}
                    cy={snapCircleY}
                    r={NODE_HEIGHT / 2 + 10}
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth={2 / zoom}
                    strokeDasharray={`${10 / zoom} ${5 / zoom}`}
                />
            </g>
        </svg>
    );
};
