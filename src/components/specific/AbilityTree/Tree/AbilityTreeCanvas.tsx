// src/components/specific/AbilityTree/Tree/AbilityTreeCanvas.tsx
import { useEffect, useCallback, useMemo, type FC } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Ability, AbilityTree } from '../../../../db/types';
import { AbilityNode } from '../Node/AbilityNode';
import { LogicEdge } from '../Sidebar/LogicEdge';
import { AttachmentNode } from '../Node/AttachmentNode';

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

// NEW: Constants for a vertical, column-based layout.
const TIER_WIDTH = 250;
const NODE_START_Y = 100;

interface AbilityTreeCanvasProps {
    abilities: Ability[];
    tierCount: number;
    onNodeDragStop: (node: Node, closestTier: number) => void;
    onConnect: (connection: Connection) => void;
    onDelete: (deletedNodes: Node[], deletedEdges: Edge[]) => void;
    onNodeClick: (node: Node | null) => void;
    availableTrees: AbilityTree[];
}

/**
 * REWORKED: The canvas is now oriented vertically. Tiers are columns.
 * - Node X positions are determined by their tier and snap into place.
 * - Node Y positions are freely draggable.
 * - The `TierBar` component is no longer needed; tier labels are rendered inside the canvas SVG.
 * - Panning is constrained by `translateExtent` to prevent the user from getting lost.
 */
export const AbilityTreeCanvas: FC<AbilityTreeCanvasProps> = ({
    abilities,
    tierCount,
    onNodeDragStop,
    onConnect,
    onDelete,
    onNodeClick,
    availableTrees,
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const { initialNodes, initialEdges } = useMemo(() => {
        const nodes: Node[] = abilities.map((ability) => {
            // REWORKED: X is now based on tier, Y is free.
            const xPos = ability.x ?? TIER_WIDTH * ability.tier - TIER_WIDTH / 2;
            const yPos = ability.y ?? NODE_START_Y;

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
                    tier: ability.tier, // Pass tier data for the edit panel
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
    }, [abilities, availableTrees]);

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
            // REWORKED: Snapping logic is now based on the X-axis.
            let closestTier = 1;
            let minDistance = Infinity;

            for (let i = 1; i <= tierCount; i++) {
                const tierX = TIER_WIDTH * i - TIER_WIDTH / 2;
                const distance = Math.abs(node.position.x - tierX);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestTier = i;
                }
            }

            const snappedX = TIER_WIDTH * closestTier - TIER_WIDTH / 2;
            setNodes((nds) =>
                nds.map((n) =>
                    n.id === node.id ? { ...n, position: { ...n.position, x: snappedX } } : n,
                ),
            );

            onNodeDragStop({ ...node, position: { ...node.position, x: snappedX } }, closestTier);
        },
        [onNodeDragStop, tierCount, setNodes],
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

    // NEW: Define the boundaries for panning.
    const translateExtent: [[number, number], [number, number]] = [
        [0, -500],
        [tierCount * TIER_WIDTH + TIER_WIDTH / 2, 2000],
    ];

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
                // NEW: Apply the panning constraint.
                translateExtent={translateExtent}
            >
                <Background
                    variant={BackgroundVariant.Lines}
                    gap={48}
                    lineWidth={0.25}
                    color="var(--color-border)"
                />
                {/* REWORKED: Render vertical tier lines and labels directly here. */}
                <svg>
                    {Array.from({ length: tierCount }, (_, i) => i + 1).map((tierNum) => (
                        <g key={`tier-group-${tierNum}`}>
                            <line
                                x1={TIER_WIDTH * tierNum}
                                y1={0}
                                x2={TIER_WIDTH * tierNum}
                                y2="100%"
                                className="tier-line"
                            />
                            <text
                                x={TIER_WIDTH * tierNum - TIER_WIDTH / 2}
                                y={30}
                                className="tier-label"
                            >
                                Tier {tierNum}
                            </text>
                        </g>
                    ))}
                </svg>
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
};
