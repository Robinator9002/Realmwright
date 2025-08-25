// src/components/specific/AbilityTree/Canvas/AbilityTreeCanvas.tsx

/**
 * COMMIT: feat(ability-tree): implement 'infinite' grid for seamless zooming
 *
 * This commit addresses the issue where grid lines and the drag highlighter
 * would not cover the entire viewport when zoomed out.
 *
 * Rationale:
 * The previous implementation sized the SVG grid elements based on the content
 * bounds, which created a jarring visual artifact at low zoom levels. The grid
 * should appear continuous and infinite to the user.
 *
 * Implementation Details:
 * - A `GRID_SPAN` constant has been introduced with a very large value.
 * - The `<line>` elements for the grid and the `<rect>` for the highlighter
 * are now rendered using this large span. Their `x` and `y` coordinates are
 * offset by half this span, ensuring they are always centered and extend
 * far beyond the visible area, regardless of pan or zoom.
 * - The dynamic calculation of `gridDimensions` has been removed in favor of
 * rendering a generous, fixed number of column lines to ensure performance
 * while still covering a wide pan area.
 */
import { useEffect, useCallback, useMemo, useRef, type FC } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
    useStore,
    useViewport,
    type Edge,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    type Node,
    type NodeMouseHandler,
    type PanOnScrollMode,
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
const GRID_SPAN = 100000; // A very large number for our "infinite" grid

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
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const draggingNode = useStore(draggingNodeSelector);
    const { x, y, zoom } = useViewport();

    useEffect(() => {
        onViewportChange({ y, zoom });
    }, [y, zoom, onViewportChange]);

    const { initialNodes, initialEdges, canvasBounds } = useMemo(() => {
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

        let maxNodeX = NODE_START_X + COLUMN_WIDTH * 5;
        if (transformedNodes.length > 0) {
            maxNodeX = Math.max(...transformedNodes.map((n) => n.position.x + COLUMN_WIDTH));
        }
        const numCols = Math.ceil((maxNodeX - NODE_START_X) / COLUMN_WIDTH) + 1;

        const extent: [[number, number], [number, number]] = [
            [-GRID_SPAN / 2, -GRID_SPAN / 2],
            [GRID_SPAN / 2, GRID_SPAN / 2],
        ];

        return {
            initialNodes: transformedNodes,
            initialEdges: transformedEdges,
            canvasBounds: extent,
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
                        {Array.from({ length: currentTree.tierCount }, (_, i) => (
                            <line
                                key={`tier-line-${i}`}
                                x1={-GRID_SPAN / 2}
                                y1={TIER_HEIGHT * (i + 1)}
                                x2={GRID_SPAN / 2}
                                y2={TIER_HEIGHT * (i + 1)}
                                className="tier-line"
                            />
                        ))}
                        {/* Render a generous fixed number of column lines */}
                        {Array.from({ length: 50 }, (_, i) => (
                            <line
                                key={`col-line-${i}`}
                                x1={NODE_START_X + COLUMN_WIDTH * (i - 25)}
                                y1={-GRID_SPAN / 2}
                                x2={NODE_START_X + COLUMN_WIDTH * (i - 25)}
                                y2={GRID_SPAN / 2}
                                className="column-line"
                            />
                        ))}
                        {draggingNode && (
                            <g>
                                <rect
                                    x={-GRID_SPAN / 2}
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
                                    width={GRID_SPAN}
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
                                    strokeWidth={2 / zoom}
                                    strokeDasharray={`${10 / zoom} ${5 / zoom}`}
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
