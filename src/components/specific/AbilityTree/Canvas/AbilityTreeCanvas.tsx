// src/components/specific/AbilityTree/Canvas/AbilityTreeCanvas.tsx

/**
 * COMMIT: feat(ability-tree): synchronize all SVG visuals with viewport
 *
 * This commit resolves all outstanding visual bugs related to the grid and
 * drag highlighter by synchronizing them with the React Flow viewport.
 *
 * Rationale:
 * Previously, the custom SVG elements for the grid and highlighter were
 * rendered in a static coordinate space, causing them to become misaligned
 * when the user panned or zoomed the canvas.
 *
 * Implementation Details:
 * 1.  **Viewport Synchronization:**
 * - The `useViewport` hook is now used to get the live `x`, `y`, and `zoom`
 * of the canvas.
 * - All custom SVG elements are wrapped in a parent `<g>` element.
 * - The `transform` attribute of this `<g>` is dynamically set to match the
 * viewport's transform. This forces our entire custom layer to pan and
 * zoom in perfect sync with the React Flow nodes.
 * 2.  **Dynamic Grid Sizing:**
 * - The component now calculates the actual bounds of the nodes on the canvas.
 * - This is used to determine how many tier and column lines to render,
 * ensuring the grid always extends slightly beyond the content area rather
 * than being a fixed size.
 */
import { useEffect, useCallback, useMemo, useRef, type FC } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
    useStore,
    useViewport, // Import useViewport
    type Edge,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    type Node,
    type NodeMouseHandler,
    type PanOnScrollMode,
    useReactFlow,
    type Viewport,
    type NodeDragHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useAbilityTreeEditor } from '../../../../context/AbilityTreeEditorContext';
import { AbilityNode } from '../Node/AbilityNode';
import { AttachmentNode } from '../Node/AttachmentNode';
import { LogicEdge } from '../Edge/LogicEdge';
import {
    TIER_HEIGHT,
    COLUMN_WIDTH,
    NODE_START_X,
    NODE_HEIGHT,
} from '../../../../constants/abilityTree.constants';

const nodeTypes = { abilityNode: AbilityNode, attachmentNode: AttachmentNode };
const edgeTypes = { logicEdge: LogicEdge };
const defaultEdgeOptions = { type: 'logicEdge', style: { strokeWidth: 2 } };

const draggingNodeSelector = (state: { nodeInternals: Map<string, Node> }): Node | undefined => {
    const nodes = Array.from(state.nodeInternals.values());
    return nodes.find((n) => n.dragging);
};

interface AbilityTreeCanvasProps {
    onViewportChange: (viewport: { y: number; zoom: number }) => void;
}

export const AbilityTreeCanvas: FC<AbilityTreeCanvasProps> = ({ onViewportChange }) => {
    const {
        abilities,
        currentTree,
        handleNodeDragStop,
        handleDelete,
        setSelectedNode,
        setPendingConnection,
    } = useAbilityTreeEditor();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { getViewport } = useReactFlow();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const draggingNode = useStore(draggingNodeSelector);
    const { x, y, zoom } = useViewport(); // Get live viewport data

    useEffect(() => {
        onViewportChange({ x, y, zoom });
    }, [x, y, zoom, onViewportChange]);

    const { initialNodes, initialEdges, canvasBounds, gridDimensions } = useMemo(() => {
        const transformedNodes: Node[] = abilities.map((ability) => ({
            id: String(ability.id!),
            position: { x: ability.x ?? 0, y: ability.y ?? 0 },
            data: { ...ability, label: ability.name },
            type: ability.attachmentPoint ? 'attachmentNode' : 'abilityNode',
        }));

        const transformedEdges: Edge[] = [];
        abilities.forEach((ability) => {
            ability.prerequisites?.forEach((group, groupIndex) => {
                group.abilityIds.forEach((prereqId, prereqIndex) => {
                    transformedEdges.push({
                        id: `e-${prereqId}-${ability.id}-${groupIndex}-${prereqIndex}`,
                        source: String(prereqId),
                        target: String(ability.id!),
                        data: { label: group.type },
                    });
                });
            });
        });

        // Calculate dynamic grid dimensions
        let maxNodeX = NODE_START_X + COLUMN_WIDTH * 5; // Default width
        if (transformedNodes.length > 0) {
            maxNodeX = Math.max(...transformedNodes.map((n) => n.position.x + COLUMN_WIDTH));
        }
        const numCols = Math.ceil((maxNodeX - NODE_START_X) / COLUMN_WIDTH) + 1;

        const extent: [[number, number], [number, number]] = [
            [NODE_START_X - COLUMN_WIDTH, -200],
            [NODE_START_X + numCols * COLUMN_WIDTH, currentTree.tierCount * TIER_HEIGHT + 200],
        ];

        return {
            initialNodes: transformedNodes,
            initialEdges: transformedEdges,
            canvasBounds: extent,
            gridDimensions: { numCols },
        };
    }, [abilities, currentTree.tierCount]);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const handleNodesChange: OnNodesChange = (changes) => {
        const deletedNodeChanges = changes.filter((c) => c.type === 'remove');
        if (deletedNodeChanges.length > 0) {
            const deletedNodes = nodes.filter((node) =>
                deletedNodeChanges.some((change) => change.id === node.id),
            );
            handleDelete(deletedNodes, []);
        }
        onNodesChange(changes);
    };

    const handleEdgesChange: OnEdgesChange = (changes) => {
        const deletedEdgeChanges = changes.filter((c) => c.type === 'remove');
        if (deletedEdgeChanges.length > 0) {
            const deletedEdges = edges.filter((edge) =>
                deletedEdgeChanges.some((change) => change.id === edge.id),
            );
            handleDelete([], deletedEdges);
        }
        onEdgesChange(changes);
    };

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

    const onConnect: OnConnect = useCallback(
        (connection) => setPendingConnection(connection),
        [setPendingConnection],
    );
    const onConnectStart = useCallback(() => {
        reactFlowWrapper.current?.classList.add('connection-in-progress');
    }, []);
    const onConnectEnd = useCallback(() => {
        reactFlowWrapper.current?.classList.remove('connection-in-progress');
    }, []);
    const onNodeClick: NodeMouseHandler = useCallback(
        (_, node) => setSelectedNode(node),
        [setSelectedNode],
    );
    const onPaneClick = useCallback(() => setSelectedNode(null), [setSelectedNode]);

    return (
        <div className="ability-editor-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onNodeDragStop={onNodeDragStop}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                defaultEdgeOptions={defaultEdgeOptions}
                deleteKeyCode={['Backspace', 'Delete']}
                panOnDrag={false}
                panOnScroll
                panOnScrollMode={'vertical' as PanOnScrollMode}
                translateExtent={canvasBounds}
                nodeDragThreshold={1}
                minZoom={0.5}
                maxZoom={2}
            >
                <Background
                    variant={BackgroundVariant.Lines}
                    gap={48}
                    color="var(--color-border)"
                />
                <svg style={{ position: 'absolute', zIndex: -1, width: '100%', height: '100%' }}>
                    <g transform={`translate(${x}, ${y}) scale(${zoom})`}>
                        {/* Render grid lines within the transformed group */}
                        {Array.from({ length: currentTree.tierCount }, (_, i) => (
                            <line
                                key={`tier-line-${i}`}
                                x1={canvasBounds[0][0]}
                                y1={TIER_HEIGHT * (i + 1)}
                                x2={canvasBounds[1][0]}
                                y2={TIER_HEIGHT * (i + 1)}
                                className="tier-line"
                            />
                        ))}
                        {Array.from({ length: gridDimensions.numCols }, (_, i) => (
                            <line
                                key={`col-line-${i}`}
                                x1={NODE_START_X + COLUMN_WIDTH * i}
                                y1={canvasBounds[0][1]}
                                x2={NODE_START_X + COLUMN_WIDTH * i}
                                y2={canvasBounds[1][1]}
                                className="column-line"
                            />
                        ))}
                        {/* Conditionally render highlighter within the transformed group */}
                        {draggingNode && (
                            <g>
                                <rect
                                    x={canvasBounds[0][0]}
                                    y={
                                        (Math.max(
                                            1,
                                            Math.floor(
                                                (draggingNode.position.y + NODE_HEIGHT / 2) /
                                                    TIER_HEIGHT,
                                            ) + 1,
                                        ) -
                                            1) *
                                        TIER_HEIGHT
                                    }
                                    width={canvasBounds[1][0] - canvasBounds[0][0]}
                                    height={TIER_HEIGHT}
                                    fill="var(--color-accent)"
                                    opacity={0.05}
                                    style={{ pointerEvents: 'none' }}
                                />
                                <circle
                                    cx={
                                        NODE_START_X +
                                        Math.round(
                                            (draggingNode.position.x +
                                                NODE_HEIGHT / 2 -
                                                NODE_START_X) /
                                                COLUMN_WIDTH,
                                        ) *
                                            COLUMN_WIDTH
                                    }
                                    cy={
                                        (Math.max(
                                            1,
                                            Math.floor(
                                                (draggingNode.position.y + NODE_HEIGHT / 2) /
                                                    TIER_HEIGHT,
                                            ) + 1,
                                        ) -
                                            1) *
                                            TIER_HEIGHT +
                                        TIER_HEIGHT / 2
                                    }
                                    r={NODE_HEIGHT / 2 + 10}
                                    fill="none"
                                    stroke="var(--color-accent)"
                                    strokeWidth={2 / zoom} // Make stroke width consistent when zooming
                                    strokeDasharray={`${10 / zoom} ${5 / zoom}`} // Adjust dash array with zoom
                                    style={{ pointerEvents: 'none' }}
                                />
                            </g>
                        )}
                    </g>
                </svg>
                <Controls />
            </ReactFlow>
        </div>
    );
};
