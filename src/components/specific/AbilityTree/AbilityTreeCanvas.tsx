// src/components/specific/AbilityTree/AbilityTreeCanvas.tsx
import { useEffect, useCallback, useMemo, type FC } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    BackgroundVariant,
    type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Ability } from '../../../db/types';
import type { Node, OnConnect, NodeDragHandler, Connection } from 'reactflow';
import { AbilityNode } from './AbilityNode';
// NEW: Import our custom edge component
import { LogicEdge } from './LogicEdge';

// BUGFIX #1: Define node and edge types OUTSIDE the component.
// This prevents them from being recreated on every render, fixing the
// React Flow performance warning and associated visual glitches.
const nodeTypes = {
    abilityNode: AbilityNode,
};
const edgeTypes = {
    logicEdge: LogicEdge,
};

const defaultEdgeOptions = {
    type: 'logicEdge', // Use our new custom edge by default
    style: { strokeWidth: 2 },
};

const TIER_HEIGHT = 150;
const NODE_X_SPACING = 200;

interface AbilityTreeCanvasProps {
    abilities: Ability[];
    tierCount: number;
    onNodeDragStop: (node: Node, closestTier: number) => void;
    onConnect: (connection: Connection) => void;
}

/**
 * REWORKED: This component is now stabilized with performance and key fixes.
 * It properly uses custom nodes and edges.
 */
export const AbilityTreeCanvas: FC<AbilityTreeCanvasProps> = ({
    abilities,
    tierCount,
    onNodeDragStop,
    onConnect,
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // useMemo is used here as a good practice to avoid re-calculating nodes/edges
    // if the underlying abilities data hasn't changed.
    const { initialNodes, initialEdges } = useMemo(() => {
        const nodes: Node[] = abilities.map((ability) => {
            const yPos = ability.y ?? TIER_HEIGHT * ability.tier - TIER_HEIGHT / 2;
            const xPos = ability.x ?? NODE_X_SPACING * ability.tier;
            return {
                id: String(ability.id!),
                position: { x: xPos, y: yPos },
                data: { label: ability.name, iconUrl: ability.iconUrl },
                type: 'abilityNode',
            };
        });

        const edges: Edge[] = [];
        for (const ability of abilities) {
            if (ability.prerequisites) {
                // Iterate through each prerequisite group for the ability
                ability.prerequisites.forEach((group, groupIndex) => {
                    // Iterate through each prerequisite ID within the group
                    group.abilityIds.forEach((prereqId, prereqIndex) => {
                        // BUGFIX #2: Generate a TRULY unique key for each edge.
                        const id = `e-${prereqId}-${ability.id}-${groupIndex}-${prereqIndex}`;
                        edges.push({
                            id,
                            source: String(prereqId),
                            target: String(ability.id!),
                            data: {
                                label: group.type, // Pass the logic type as a label
                            },
                        });
                    });
                });
            }
        }
        return { initialNodes: nodes, initialEdges: edges };
    }, [abilities]);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const handleNodeDragStop: NodeDragHandler = useCallback(
        (_, node) => {
            const closestTier = Math.max(1, Math.round(node.position.y / TIER_HEIGHT) + 1);
            const snappedY = TIER_HEIGHT * closestTier - TIER_HEIGHT / 2;
            setNodes((nds) =>
                nds.map((n) =>
                    n.id === node.id ? { ...n, position: { ...n.position, y: snappedY } } : n,
                ),
            );
            onNodeDragStop({ ...node, position: { ...node.position, y: snappedY } }, closestTier);
        },
        [onNodeDragStop, setNodes],
    );

    const handleConnect: OnConnect = useCallback(
        (connection) => {
            setEdges((eds) => addEdge(connection, eds));
            onConnect(connection);
        },
        [setEdges, onConnect],
    );

    return (
        <div className="ability-editor-wrapper">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes} // NEW: Tell React Flow about our custom edge
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDragStop={handleNodeDragStop}
                onConnect={handleConnect}
                fitView
                nodesDraggable={true}
                nodesConnectable={true}
                defaultEdgeOptions={defaultEdgeOptions}
            >
                <Background variant={BackgroundVariant.Lines} gap={24} lineWidth={0.5} />
                <svg>
                    {Array.from({ length: tierCount }, (_, i) => i + 1).map((tierNum) => (
                        <g key={`tier-group-${tierNum}`}>
                            <line
                                x1={0}
                                y1={TIER_HEIGHT * tierNum}
                                x2="100%"
                                y2={TIER_HEIGHT * tierNum}
                                className="tier-line"
                            />
                            <text
                                x={40}
                                y={TIER_HEIGHT * tierNum - TIER_HEIGHT / 2}
                                className="tier-label"
                            >
                                T{tierNum}
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
