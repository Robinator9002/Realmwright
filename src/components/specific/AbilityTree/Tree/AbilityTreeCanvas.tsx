// src/components/specific/AbilityTree/Tree/AbilityTreeCanvas.tsx
import { useEffect, useCallback, useMemo, type FC } from 'react';
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
} from '../../../../constants/abilityTree.constants';

// Memoize nodeTypes and edgeTypes outside the component to prevent re-creation warnings.
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

interface AbilityTreeCanvasProps {
    abilities: Ability[];
    tierCount: number;
    onNodeDragStop: (node: Node, closestTier: number) => void;
    onConnect: (connection: Connection) => void;
    onDelete: (deletedNodes: Node[], deletedEdges: Edge[]) => void;
    onNodeClick: (node: Node | null) => void;
    availableTrees: AbilityTree[];
    onViewportChange: (viewportY: number) => void;
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
    const viewport = useViewport();

    useEffect(() => {
        onViewportChange(viewport.y);
    }, [viewport.y, onViewportChange]);

    // Define the horizontal boundaries for node dragging
    const minX = NODE_START_X;
    const maxX = NODE_START_X + MAX_COLUMNS * COLUMN_WIDTH - NODE_HEIGHT;

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

    const handleNodeDragStop: NodeDragHandler = useCallback(
        (_, node) => {
            // Calculate the target y-position for snapping: center of the closest tier.
            const nodeCenterY = node.position.y + NODE_HEIGHT / 2;
            const closestTier = Math.max(1, Math.round(nodeCenterY / TIER_HEIGHT));
            const snappedY = TIER_HEIGHT * closestTier - TIER_HEIGHT / 2 - NODE_HEIGHT / 2;

            // Calculate the target x-position for snapping: center of the closest column.
            const nodeCenterX = node.position.x + NODE_HEIGHT / 2;
            const relativeCenterX = nodeCenterX - NODE_START_X;
            const closestColumnIndex = Math.max(0, Math.round(relativeCenterX / COLUMN_WIDTH));
            let snappedX =
                NODE_START_X +
                closestColumnIndex * COLUMN_WIDTH +
                COLUMN_WIDTH / 2 -
                NODE_HEIGHT / 2;

            // NEW: Clamp snappedX within the defined horizontal boundaries
            snappedX = Math.max(minX, Math.min(maxX, snappedX));

            setNodes((nds) =>
                nds.map((n) =>
                    n.id === node.id ? { ...n, position: { x: snappedX, y: snappedY } } : n,
                ),
            );

            onNodeDragStop({ ...node, position: { x: snappedX, y: snappedY } }, closestTier);
        },
        [onNodeDragStop, setNodes, minX, maxX],
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
                panOnDrag={false}
                panOnScroll={true}
                panOnScrollMode={'vertical' as PanOnScrollMode}
                minZoom={MIN_ZOOM} // NEW: Apply minimum zoom level
                maxZoom={MAX_ZOOM} // NEW: Apply maximum zoom level
            >
                <Background
                    variant={BackgroundVariant.Lines}
                    gap={48}
                    lineWidth={0.25}
                    color="var(--color-border)"
                />
                <svg className="ability-editor-canvas__grid-lines">
                    {/* Horizontal Tier Lines */}
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
                    {/* NEW: Vertical Column Lines for Horizontal Snapping Guidance */}
                    {Array.from({ length: numColumns }, (_, i) => i + 1).map((colNum) => (
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
