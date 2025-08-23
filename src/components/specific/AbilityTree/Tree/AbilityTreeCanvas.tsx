// src/components/specific/AbilityTree/Tree/AbilityTreeCanvas.tsx
import { useEffect, useCallback, useMemo, useState, type FC } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
    type Edge,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    type Node,
    type NodeDragHandler,
    type Connection,
    type NodeMouseHandler,
    type PanOnScrollMode,
    useViewport,
    useReactFlow,
    type Viewport,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Ability, AbilityTree } from '../../../../db/types';
import { AbilityNode } from '../Node/AbilityNode';
import { LogicEdge } from '../Sidebar/LogicEdge';
import { AttachmentNode } from '../Node/AttachmentNode';
import {
    TIER_HEIGHT,
    NODE_HEIGHT,
    COLUMN_WIDTH,
    MAX_COLUMNS,
    NODE_START_X,
    MIN_ZOOM,
    MAX_ZOOM,
    MIN_Y_PAN,
    MAX_Y_PAN_BUFFER,
} from '../../../../constants/abilityTree.constants';

const nodeTypes = {
    abilityNode: AbilityNode,
    attachmentNode: AttachmentNode,
};
const edgeTypes = {
    logicEdge: LogicEdge,
};

const defaultEdgeOptions = {
    type: 'logicEdge',
    style: { strokeWidth: 2 },
};

// REWORKED: The drag preview state now tracks a single line position for clarity.
type DragPreviewState = {
    x: number;
    y: number;
    lineX: number; // Changed from colX to represent a line, not a column
    visible: boolean;
};

// REWORKED: The onViewportChange prop now passes both y and zoom.
interface AbilityTreeCanvasProps {
    abilities: Ability[];
    tierCount: number;
    onNodeDragStop: (node: Node, closestTier: number) => void;
    onConnect: (connection: Connection) => void;
    onDelete: (deletedNodes: Node[], deletedEdges: Edge[]) => void;
    onNodeClick: (node: Node | null) => void;
    availableTrees: AbilityTree[];
    onViewportChange: (viewport: { y: number; zoom: number }) => void;
}

export const AbilityTreeCanvas: FC<AbilityTreeCanvasProps> = ({
    abilities,
    tierCount,
    onNodeDragStop,
    onConnect,
    onDelete,
    onNodeClick,
    availableTrees,
    onViewportChange,
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { x, y, zoom } = useViewport();
    const { setViewport } = useReactFlow();

    const [dragPreview, setDragPreview] = useState<DragPreviewState>({
        x: 0,
        y: 0,
        lineX: 0,
        visible: false,
    });

    // REWORKED: This effect now passes the entire viewport object up.
    useEffect(() => {
        onViewportChange({ y, zoom });
    }, [y, zoom, onViewportChange]);

    const minX = NODE_START_X;
    const maxX = NODE_START_X + MAX_COLUMNS * COLUMN_WIDTH - NODE_HEIGHT;

    const minBoundX = NODE_START_X - COLUMN_WIDTH;
    const maxBoundX = NODE_START_X + MAX_COLUMNS * COLUMN_WIDTH + COLUMN_WIDTH;
    const minBoundY = MIN_Y_PAN;
    const maxBoundY = tierCount * TIER_HEIGHT + MAX_Y_PAN_BUFFER;

    const { initialNodes, initialEdges } = useMemo(() => {
        const nodes: Node[] = abilities.map((ability) => {
            const yPos = TIER_HEIGHT * ability.tier - TIER_HEIGHT / 2 - NODE_HEIGHT / 2;
            const initialX = ability.x ?? NODE_START_X + COLUMN_WIDTH / 2 - NODE_HEIGHT / 2;
            const xPos = Math.max(minX, Math.min(maxX, initialX));

            let attachedTreeName: string | undefined = undefined;
            if (ability.attachmentPoint?.attachedTreeId) {
                const foundTree = availableTrees.find(
                    (t) => t.id === ability.attachmentPoint!.attachedTreeId,
                );
                attachedTreeName = foundTree?.name;
            }

            return {
                id: String(ability.id!),
                position: { x: xPos, y: yPos },
                data: {
                    label: ability.name,
                    description: ability.description,
                    iconUrl: ability.iconUrl,
                    tier: ability.tier,
                    attachmentPoint: ability.attachmentPoint,
                    attachedTreeName: attachedTreeName,
                },
                type: ability.attachmentPoint ? 'attachmentNode' : 'abilityNode',
            };
        });

        const edges: Edge[] = [];
        for (const ability of abilities) {
            if (ability.prerequisites) {
                ability.prerequisites.forEach((group, groupIndex) => {
                    group.abilityIds.forEach((prereqId, prereqIndex) => {
                        const id = `e-${prereqId}-${ability.id}-${groupIndex}-${prereqIndex}`;
                        edges.push({
                            id,
                            source: String(prereqId),
                            target: String(ability.id!),
                            data: { label: group.type },
                        });
                    });
                });
            }
        }
        return { initialNodes: nodes, initialEdges: edges };
    }, [abilities, availableTrees, minX, maxX]);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const handleNodesChange: OnNodesChange = (changes) => {
        const deletedNodeChanges = changes.filter((change) => change.type === 'remove');
        if (deletedNodeChanges.length > 0) {
            const deletedNodeIds = new Set(deletedNodeChanges.map((change) => change.id));
            const deletedNodes = nodes.filter((node) => deletedNodeIds.has(node.id));
            onDelete(deletedNodes, []);
        }
        onNodesChange(changes);
    };

    const handleEdgesChange: OnEdgesChange = (changes) => {
        const deletedEdgeChanges = changes.filter((change) => change.type === 'remove');
        if (deletedEdgeChanges.length > 0) {
            const deletedEdgeIds = new Set(deletedEdgeChanges.map((change) => change.id));
            const deletedEdges = edges.filter((edge) => deletedEdgeIds.has(edge.id));
            onDelete([], deletedEdges);
        }
        onEdgesChange(changes);
    };

    const handleNodeDragStart = () => {
        setDragPreview((prev) => ({ ...prev, visible: true }));
    };

    const handleNodeDrag: NodeDragHandler = useCallback(
        (_, node) => {
            // --- FIX: Corrected Vertical Snapping Logic ---
            // This formula correctly identifies the tier the node's center is in.
            const nodeCenterY = node.position.y + NODE_HEIGHT / 2;
            const closestTier = Math.max(1, Math.floor(nodeCenterY / TIER_HEIGHT) + 1);
            // This calculation correctly finds the Y position to center the node in that tier.
            const snappedY = TIER_HEIGHT * closestTier - TIER_HEIGHT / 2 - NODE_HEIGHT / 2;

            // Horizontal (X) snapping logic (no change to this part)
            const nodeCenterX = node.position.x + NODE_HEIGHT / 2;
            const relativeCenterX = nodeCenterX - NODE_START_X;
            const closestColumnIndex = Math.max(0, Math.round(relativeCenterX / COLUMN_WIDTH));
            let snappedX =
                NODE_START_X +
                closestColumnIndex * COLUMN_WIDTH +
                COLUMN_WIDTH / 2 -
                NODE_HEIGHT / 2;

            snappedX = Math.max(minX, Math.min(maxX, snappedX));

            // --- FIX: Corrected Horizontal Preview Logic ---
            // Calculate the position for a single, centered line instead of a wide column.
            const lineX = NODE_START_X + closestColumnIndex * COLUMN_WIDTH + COLUMN_WIDTH / 2;

            setDragPreview({ x: snappedX, y: snappedY, lineX, visible: true });
        },
        [minX, maxX],
    );

    const handleNodeDragStop: NodeDragHandler = useCallback(
        (_, node) => {
            setDragPreview({ x: 0, y: 0, lineX: 0, visible: false });

            const { x: snappedX, y: snappedY } = dragPreview;
            const nodeCenterY = snappedY + NODE_HEIGHT / 2;
            // Use the same corrected logic here to ensure the final tier is correct.
            const closestTier = Math.max(1, Math.floor(nodeCenterY / TIER_HEIGHT) + 1);

            setNodes((nds) =>
                nds.map((n) =>
                    n.id === node.id ? { ...n, position: { x: snappedX, y: snappedY } } : n,
                ),
            );

            onNodeDragStop({ ...node, position: { x: snappedX, y: snappedY } }, closestTier);
        },
        [onNodeDragStop, setNodes, dragPreview],
    );

    const handleConnect: OnConnect = useCallback(
        (connection) => {
            onConnect(connection);
        },
        [onConnect],
    );

    const handleNodeClick: NodeMouseHandler = useCallback(
        (_, node) => {
            onNodeClick(node);
        },
        [onNodeClick],
    );

    const handlePaneClick = useCallback(() => {
        onNodeClick(null);
    }, [onNodeClick]);

    const onMove = useCallback(
        (_: any, newViewport: Viewport) => {
            const { x, y, zoom } = newViewport;
            const viewWidth = window.innerWidth;
            const viewHeight = window.innerHeight;
            const minXScreen = -maxBoundX * zoom + viewWidth;
            const maxXScreen = -minBoundX * zoom;
            const minYScreen = -maxBoundY * zoom + viewHeight;
            const maxYScreen = -minBoundY * zoom;
            const clampedX = Math.max(minXScreen, Math.min(x, maxXScreen));
            const clampedY = Math.max(minYScreen, Math.min(y, maxYScreen));
            const xDiff = Math.abs(clampedX - x);
            const yDiff = Math.abs(clampedY - y);
            if (xDiff > 0.01 || yDiff > 0.01) {
                setViewport({ x: clampedX, y: clampedY, zoom });
            }
        },
        [setViewport, minBoundX, minBoundY, maxBoundX, maxBoundY],
    );

    const numColumns = MAX_COLUMNS;

    return (
        <div className="ability-editor-wrapper">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onNodeDragStart={handleNodeDragStart}
                onNodeDrag={handleNodeDrag}
                onNodeDragStop={handleNodeDragStop}
                onConnect={handleConnect}
                onNodeClick={handleNodeClick}
                onPaneClick={handlePaneClick}
                fitView
                nodesDraggable={true}
                nodesConnectable={true}
                defaultEdgeOptions={defaultEdgeOptions}
                deleteKeyCode={['Backspace', 'Delete']}
                nodesFocusable={true}
                edgesFocusable={true}
                panOnDrag={true}
                panOnScroll={true}
                panOnScrollMode={'vertical' as PanOnScrollMode}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                onMove={onMove}
            >
                {dragPreview.visible && (
                    <>
                        {/* REWORKED: This is now a thin, centered line for clarity. */}
                        <div
                            className="snap-line-highlight"
                            style={{
                                transform: `translateX(${dragPreview.lineX}px)`,
                            }}
                        />
                        <div
                            className="ghost-node"
                            style={{
                                transform: `translate(${dragPreview.x}px, ${dragPreview.y}px)`,
                            }}
                        />
                    </>
                )}

                <Background
                    variant={BackgroundVariant.Lines}
                    gap={48}
                    lineWidth={0.25}
                    color="var(--color-border)"
                />
                <svg className="ability-editor-canvas__grid-lines">
                    {Array.from({ length: tierCount }, (_, i) => i + 1).map((tierNum) => (
                        <g key={`tier-group-${tierNum}`}>
                            <line
                                x1="0"
                                y1={TIER_HEIGHT * tierNum}
                                x2="100%"
                                y2={TIER_HEIGHT * tierNum}
                                className="tier-line"
                            />
                        </g>
                    ))}
                    {Array.from({ length: numColumns + 1 }, (_, i) => i).map((colNum) => (
                        <g key={`column-group-${colNum}`}>
                            <line
                                x1={NODE_START_X + COLUMN_WIDTH * colNum}
                                y1="0"
                                x2={NODE_START_X + COLUMN_WIDTH * colNum}
                                y2="100%"
                                className="column-line"
                            />
                        </g>
                    ))}
                </svg>
                <Controls />
            </ReactFlow>
        </div>
    );
};
