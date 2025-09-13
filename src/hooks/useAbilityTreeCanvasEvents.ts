// src/hooks/useAbilityTreeCanvasEvents.ts

/**
 * COMMIT: feat(ability-tree): extract useAbilityTreeCanvasEvents hook
 *
 * Rationale:
 * To continue the refactoring of the AbilityTreeCanvas, this commit extracts
 * all of the memoized React Flow event handlers into a dedicated custom hook.
 *
 * Implementation Details:
 * - This hook encapsulates all `useCallback` functions for handling events
 * like node dragging, edge clicks, connections, and deletions.
 * - It accepts the necessary state (nodes, edges) and context actions
 * (e.g., `handleDelete`, `setSelectedNode`) as arguments.
 * - It returns a consolidated object of handler functions that can be passed
 * directly to the ReactFlow component as props.
 * - This change further decouples the main canvas from its interaction
 * logic, making the component significantly cleaner.
 */
import { useCallback, type RefObject } from 'react';
import {
    type OnNodesChange,
    type OnEdgesChange,
    type NodeDragHandler,
    type EdgeMouseHandler,
    type OnConnect,
    type NodeMouseHandler,
    type Node,
    type Edge,
} from 'reactflow';
import {
    NODE_HEIGHT,
    TIER_HEIGHT,
    COLUMN_WIDTH,
    NODE_START_X,
} from '../constants/abilityTree.constants';

// Define the arguments this hook will need
interface UseAbilityTreeCanvasEventsProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    handleNodeDragStop: (node: Node, closestTier: number) => void;
    handleDelete: (deletedNodes: Node[], deletedEdges: Edge[]) => void;
    setSelectedNode: (node: Node | null) => void;
    setPendingConnection: (connection: any | null) => void;
    setSelectedEdge: (edge: Edge | null) => void;
    // FIX: Allow the RefObject to be potentially null to match how useRef works.
    reactFlowWrapperRef: RefObject<HTMLDivElement>;
}

export const useAbilityTreeCanvasEvents = ({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    handleNodeDragStop,
    handleDelete,
    setSelectedNode,
    setPendingConnection,
    setSelectedEdge,
    reactFlowWrapperRef,
}: UseAbilityTreeCanvasEventsProps) => {
    const handleNodesChange: OnNodesChange = useCallback(
        (changes) => {
            const deletedNodeChanges = changes.filter((c) => c.type === 'remove');
            if (deletedNodeChanges.length > 0) {
                const deletedNodes = nodes.filter((node) =>
                    deletedNodeChanges.some((change) => change.id === node.id),
                );
                handleDelete(deletedNodes, []);
            }
            onNodesChange(changes);
        },
        [nodes, handleDelete, onNodesChange],
    );

    const handleEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            const deletedEdgeChanges = changes.filter((c) => c.type === 'remove');
            if (deletedEdgeChanges.length > 0) {
                const deletedEdges = edges.filter((edge) =>
                    deletedEdgeChanges.some((change) => change.id === edge.id),
                );
                handleDelete([], deletedEdges);
            }
            onEdgesChange(changes);
        },
        [edges, handleDelete, onEdgesChange],
    );

    const onNodeDragStop: NodeDragHandler = useCallback(
        (_, node) => {
            const nodeCenterY = node.position.y + NODE_HEIGHT / 2;
            const closestTier = Math.max(1, Math.floor(nodeCenterY / TIER_HEIGHT) + 1);
            const snappedY = TIER_HEIGHT * closestTier - TIER_HEIGHT / 2 - NODE_HEIGHT / 2;

            const nodeCenterX = node.position.x + NODE_HEIGHT / 2;
            const relativeX = nodeCenterX - NODE_START_X;
            const closestColIndex = Math.round(relativeX / COLUMN_WIDTH);
            const snappedX = NODE_START_X + closestColIndex * COLUMN_WIDTH - NODE_HEIGHT / 2;

            const snappedNode = { ...node, position: { x: snappedX, y: snappedY } };
            handleNodeDragStop(snappedNode, closestTier);
        },
        [handleNodeDragStop],
    );

    const onEdgeClick: EdgeMouseHandler = useCallback(
        (_, edge) => setSelectedEdge(edge),
        [setSelectedEdge],
    );
    const onConnect: OnConnect = useCallback(
        (connection) => setPendingConnection(connection),
        [setPendingConnection],
    );
    const onConnectStart = useCallback(() => {
        reactFlowWrapperRef.current?.classList.add('connection-in-progress');
    }, [reactFlowWrapperRef]);
    const onConnectEnd = useCallback(() => {
        reactFlowWrapperRef.current?.classList.remove('connection-in-progress');
    }, [reactFlowWrapperRef]);
    const onNodeClick: NodeMouseHandler = useCallback(
        (_, node) => setSelectedNode(node),
        [setSelectedNode],
    );
    const onPaneClick = useCallback(() => setSelectedNode(null), [setSelectedNode]);

    return {
        handleNodesChange,
        handleEdgesChange,
        onNodeDragStop,
        onEdgeClick,
        onConnect,
        onConnectStart,
        onConnectEnd,
        onNodeClick,
        onPaneClick,
    };
};
