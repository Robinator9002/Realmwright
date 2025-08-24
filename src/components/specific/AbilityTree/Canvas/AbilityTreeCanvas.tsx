// src/components/specific/AbilityTree/Canvas/AbilityTreeCanvas.tsx

/**
 * COMMIT: fix(ability-tree): correctly render drag highlighter inside SVG pane
 *
 * This commit resolves a critical runtime error where SVG elements were being
 * rendered in an HTML context, causing the browser to fail.
 *
 * Rationale:
 * The separate `GridHighlighter` component was being treated as an HTML overlay
 * by React Flow. The correct approach is to render the highlighter's SVG
 * elements within an existing SVG context that is part of the React Flow pane.
 *
 * Implementation Details:
 * - The logic from the now-obsolete `GridHighlighter.tsx` has been moved
 * directly into the `AbilityTreeCanvas` component.
 * - The `useStore` hook is now used within the canvas to track the dragging node.
 * - The `<rect>` and `<circle>` elements for the highlighter are now
 * conditionally rendered inside the same `<svg>` tag used for the grid lines,
 * ensuring they are in the correct SVG namespace and coordinate space.
 * - The separate `GridHighlighter.tsx` file is no longer needed and can be deleted.
 */
import { useEffect, useCallback, useMemo, useRef, type FC } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
    useStore, // Import useStore
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
    MAX_COLUMNS,
    NODE_START_X,
    NODE_HEIGHT,
} from '../../../../constants/abilityTree.constants';

const nodeTypes = { abilityNode: AbilityNode, attachmentNode: AttachmentNode };
const edgeTypes = { logicEdge: LogicEdge };
const defaultEdgeOptions = { type: 'logicEdge', style: { strokeWidth: 2 } };

// Selector for the useStore hook to efficiently find the dragging node.
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
        tree,
        handleNodeDragStop,
        handleDelete,
        setSelectedNode,
        setPendingConnection,
    } = useAbilityTreeEditor();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { getViewport } = useReactFlow();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    // Use the store to get the currently dragging node for the highlighter.
    const draggingNode = useStore(draggingNodeSelector);

    useEffect(() => {
        const { y, zoom } = getViewport();
        onViewportChange({ y, zoom });
    }, [getViewport, onViewportChange]);

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

        const extent: [[number, number], [number, number]] = [
            [NODE_START_X - COLUMN_WIDTH, -200],
            [NODE_START_X + (MAX_COLUMNS + 1) * COLUMN_WIDTH, tree.tierCount * TIER_HEIGHT + 200],
        ];

        return {
            initialNodes: transformedNodes,
            initialEdges: transformedEdges,
            canvasBounds: extent,
        };
    }, [abilities, tree]);

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
        (connection) => {
            setPendingConnection(connection);
        },
        [setPendingConnection],
    );

    const onConnectStart = useCallback(() => {
        reactFlowWrapper.current?.classList.add('connection-in-progress');
    }, []);

    const onConnectEnd = useCallback(() => {
        reactFlowWrapper.current?.classList.remove('connection-in-progress');
    }, []);

    const onNodeClick: NodeMouseHandler = useCallback(
        (_, node) => {
            setSelectedNode(node);
        },
        [setSelectedNode],
    );

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, [setSelectedNode]);

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
                onMove={(_, vp) => onViewportChange(vp)}
            >
                <Background
                    variant={BackgroundVariant.Lines}
                    gap={48}
                    color="var(--color-border)"
                />
                <svg className="ability-editor-canvas__grid-lines">
                    {/* Render the grid lines first */}
                    {Array.from({ length: tree.tierCount }, (_, i) => (
                        <line
                            key={`tier-line-${i}`}
                            x1="0"
                            y1={TIER_HEIGHT * (i + 1)}
                            x2="100%"
                            y2={TIER_HEIGHT * (i + 1)}
                            className="tier-line"
                        />
                    ))}
                    {Array.from({ length: MAX_COLUMNS + 1 }, (_, i) => (
                        <line
                            key={`col-line-${i}`}
                            x1={NODE_START_X + COLUMN_WIDTH * i}
                            y1="0"
                            x2={NODE_START_X + COLUMN_WIDTH * i}
                            y2="100%"
                            className="column-line"
                        />
                    ))}
                    {/* Conditionally render the highlighter elements inside the SVG */}
                    {draggingNode && (
                        <g>
                            <rect
                                x={0}
                                y={
                                    Math.max(
                                        0,
                                        Math.floor(
                                            (draggingNode.position.y + NODE_HEIGHT / 2) /
                                                TIER_HEIGHT,
                                        ),
                                    ) * TIER_HEIGHT
                                }
                                width="100%"
                                height={TIER_HEIGHT}
                                fill="var(--color-accent)"
                                opacity={0.05}
                                style={{ pointerEvents: 'none' }}
                            />
                            <circle
                                cx={
                                    NODE_START_X +
                                    Math.round(
                                        (draggingNode.position.x + NODE_HEIGHT / 2 - NODE_START_X) /
                                            COLUMN_WIDTH,
                                    ) *
                                        COLUMN_WIDTH -
                                    NODE_HEIGHT / 2 +
                                    NODE_HEIGHT / 2
                                }
                                cy={
                                    Math.max(
                                        0,
                                        Math.floor(
                                            (draggingNode.position.y + NODE_HEIGHT / 2) /
                                                TIER_HEIGHT,
                                        ),
                                    ) *
                                        TIER_HEIGHT +
                                    TIER_HEIGHT / 2
                                }
                                r={NODE_HEIGHT / 2 + 10}
                                fill="none"
                                stroke="var(--color-accent)"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                style={{ pointerEvents: 'none' }}
                            />
                        </g>
                    )}
                </svg>
                <Controls />
            </ReactFlow>
        </div>
    );
};
