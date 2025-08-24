// src/components/specific/AbilityTree/Canvas/GridHighlighter.tsx

/**
 * COMMIT: fix(ability-tree): ensure GridHighlighter persists during drag
 *
 * This commit corrects a logic error in the `draggingNodeSelector` that caused
 * the drag preview to disappear mid-drag.
 *
 * Rationale:
 * The previous selector included the condition `!n.selected`. However, React
 * Flow's internal state often flags a node as both `dragging` and `selected`
 * simultaneously. This caused the selector to fail, returning `undefined` and
 * causing the `GridHighlighter` to render nothing.
 *
 * Implementation Details:
 * - The selector has been simplified to `nodes.find((n) => n.dragging)`. This
 * is the most direct and reliable way to identify the node being actively
 * dragged, regardless of its selection status.
 * - This ensures the visual aids remain persistent and reliable throughout the
 * entire drag-and-drop operation.
 */
import { useStore, type Node } from 'reactflow';
import {
    COLUMN_WIDTH,
    NODE_HEIGHT,
    NODE_START_X,
    TIER_HEIGHT,
} from '../../../../constants/abilityTree.constants';

// The selector function is now corrected. It no longer incorrectly filters
// out nodes that are both dragging AND selected.
const draggingNodeSelector = (state: { nodeInternals: Map<string, Node> }): Node | undefined => {
    const nodes = Array.from(state.nodeInternals.values());
    // The most reliable way to find the dragging node is to just check the `dragging` flag.
    return nodes.find((n) => n.dragging);
};

export const GridHighlighter = () => {
    const draggingNode = useStore(draggingNodeSelector);

    if (!draggingNode) {
        return null;
    }

    // --- Snapping Calculation ---
    const nodeCenterY = draggingNode.position.y + NODE_HEIGHT / 2;
    const closestTier = Math.max(1, Math.floor(nodeCenterY / TIER_HEIGHT) + 1);

    const nodeCenterX = draggingNode.position.x + NODE_HEIGHT / 2;
    const relativeCenterX = nodeCenterX - NODE_START_X;
    const closestColIndex = Math.max(0, Math.round(relativeCenterX / COLUMN_WIDTH));
    const snappedX =
        NODE_START_X + closestColIndex * COLUMN_WIDTH + COLUMN_WIDTH / 2 - NODE_HEIGHT / 2;

    const targetCenterX = snappedX + NODE_HEIGHT / 2;
    const tierHighlightY = (closestTier - 1) * TIER_HEIGHT;

    return (
        <g>
            {/* Tier Highlight Rectangle */}
            <rect
                x={0}
                y={tierHighlightY}
                width="100%"
                height={TIER_HEIGHT}
                fill="var(--color-accent)"
                opacity={0.05}
                style={{ pointerEvents: 'none' }}
            />
            {/* Snap Target Circle */}
            <circle
                cx={targetCenterX}
                cy={tierHighlightY + TIER_HEIGHT / 2}
                r={NODE_HEIGHT / 2 + 10}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={2}
                strokeDasharray="5 5"
                style={{ pointerEvents: 'none' }}
            />
        </g>
    );
};
