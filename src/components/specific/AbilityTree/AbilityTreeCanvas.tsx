// src/components/specific/AbilityTree/AbilityTreeCanvas.tsx
import { useEffect, useCallback, type FC } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Ability } from '../../../db/types';
import type { Node, Edge, OnConnect, NodeDragHandler, Connection } from 'reactflow';
import { AbilityNode } from './AbilityNode';

interface AbilityTreeCanvasProps {
    abilities: Ability[];
    tierCount: number;
    onNodeDragStop: (node: Node, closestTier: number) => void;
    onConnect: (connection: Connection) => void;
}

const nodeTypes = {
    abilityNode: AbilityNode,
};

// REWORK: We now define layout constants for a horizontal (row-based) tier system.
const TIER_HEIGHT = 150; // The vertical space for each tier row.
const NODE_X_SPACING = 200; // The horizontal space between nodes in a progression.

/**
 * REWORKED: The canvas now implements a horizontal tier system. Tiers are rows,
 * and abilities flow from left to right. Snapping is now on the Y-axis.
 */
export const AbilityTreeCanvas: FC<AbilityTreeCanvasProps> = ({
    abilities,
    tierCount,
    onNodeDragStop,
    onConnect,
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        const initialNodes: Node[] = abilities.map((ability) => {
            // REWORK: Default positioning logic is now based on horizontal progression.
            // Y position is determined by tier, X position is free or based on DB value.
            const yPos = ability.y ?? TIER_HEIGHT * ability.tier - TIER_HEIGHT / 2;
            const xPos = ability.x ?? NODE_X_SPACING * ability.tier; // A sensible default

            return {
                id: String(ability.id!),
                position: { x: xPos, y: yPos },
                data: {
                    label: ability.name,
                    description: ability.description,
                    iconUrl: ability.iconUrl,
                },
                type: 'abilityNode',
            };
        });

        const initialEdges: Edge[] = [];
        for (const ability of abilities) {
            if (ability.prerequisites) {
                for (const group of ability.prerequisites) {
                    for (const prereqId of group.abilityIds) {
                        initialEdges.push({
                            id: `e-${prereqId}-${ability.id}`,
                            source: String(prereqId),
                            target: String(ability.id!),
                            animated: true,
                        });
                    }
                }
            }
        }

        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [abilities, setNodes, setEdges]);

    const handleNodeDragStop: NodeDragHandler = useCallback(
        (_, node) => {
            // REWORK: Snapping logic is now based on the Y-axis to lock nodes into tier rows.
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
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDragStop={handleNodeDragStop}
                onConnect={handleConnect}
                fitView
                nodesDraggable={true}
                nodesConnectable={true}
            >
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                <svg>
                    {/* REWORK: Render horizontal tier dividers and labels on the left. */}
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
                                x={40} /* Position label on the left */
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
