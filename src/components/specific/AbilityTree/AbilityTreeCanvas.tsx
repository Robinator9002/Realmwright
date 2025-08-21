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
    // NEW: Import the Edge type for our default options
    type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Ability } from '../../../db/types';
import type { Node, OnConnect, NodeDragHandler, Connection } from 'reactflow';
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

// NEW: Define default options for our edges to make them cleaner.
const defaultEdgeOptions = {
    type: 'straight', // Use straight lines instead of bezier curves
    style: { strokeWidth: 2 },
};

const TIER_HEIGHT = 150;
const NODE_X_SPACING = 200;

/**
 * REWORKED: The canvas now uses cleaner edges and a subtler background.
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
            const yPos = ability.y ?? TIER_HEIGHT * ability.tier - TIER_HEIGHT / 2;
            const xPos = ability.x ?? NODE_X_SPACING * ability.tier;

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
                            // REMOVED: No longer animated by default for a cleaner look
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
            const closestTier = Math.max(1, Math.round(node.position.y / TIER_HEIGHT) + 1);
            const snappedY = TIER_HEIGHT * closestTier - TIER_HEIGHT / 2;

            setNodes((nds) =>
                nds.map((n) =>
                    n.id === node.id ? { ...n, position: { ...n.position, y: snappedY } } : n,
                ),
            );

            onNodeDragStop({ ...node, position: { ...n.position, y: snappedY } }, closestTier);
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
                defaultEdgeOptions={defaultEdgeOptions} // NEW: Apply the clean edge style
            >
                {/* REWORK: Use a subtler line background */}
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
