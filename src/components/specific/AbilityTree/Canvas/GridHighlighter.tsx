// src/components/specific/AbilityTree/Canvas/GridHighlighter.tsx

/**
 * COMMIT: fix(ability-tree): correct typing in GridHighlighter store selector
 *
 * This commit resolves TypeScript errors in the `GridHighlighter` component.
 *
 * Rationale:
 * The React Flow `useStore` hook is generically typed. The original code did
 * not provide enough type information, causing TypeScript to infer the nodes
 * as `unknown`, which led to compilation errors when trying to access node
 * properties like `.position` and `.dragging`.
 *
 * Implementation Details:
 * - The `draggingNodeSelector` function has been updated to explicitly type
 * the values it receives from the store's `nodeInternals` Map as `Node`.
 * - The `Array.from` call now correctly understands it is creating an array
 * of `Node` objects.
 * - This provides the necessary type safety and resolves the downstream errors,
 * allowing the component to compile and function as intended.
 */
import { useStore, type Node } from 'reactflow';
import {
    COLUMN_WIDTH,
    NODE_HEIGHT,
    NODE_START_X,
    TIER_HEIGHT,
} from '../../../../constants/abilityTree.constants';

// This selector function is now properly typed. We explicitly tell TypeScript
// that `state.nodeInternals` is a Map-like object containing `Node` values.
const draggingNodeSelector = (state: { nodeInternals: Map<string, Node> }): Node | undefined => {
    // By typing the Map, `Array.from` now correctly infers `nodes` as `Node[]`.
    const nodes = Array.from(state.nodeInternals.values());
    // The predicate `(n: Node)` is now valid.
    return nodes.find((n) => n.dragging && !n.selected);
};

export const GridHighlighter = () => {
    const draggingNode = useStore(draggingNodeSelector);

    if (!draggingNode) {
        return null;
    }

    // --- Snapping Calculation ---
    // This logic is now type-safe because `draggingNode` is correctly inferred as `Node`.
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
                r={NODE_HEIGHT / 2 + 10} // Slightly larger than the node
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={2}
                strokeDasharray="5 5"
                style={{ pointerEvents: 'none' }}
            />
        </g>
    );
};
