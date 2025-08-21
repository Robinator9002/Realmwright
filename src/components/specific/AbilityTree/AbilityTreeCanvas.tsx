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

const TIER_WIDTH = 250; // The horizontal space allocated for each tier

/**
 * A dedicated component for rendering the React Flow canvas for the ability tree.
 * It is responsible for converting ability data into nodes and edges.
 */
export const AbilityTreeCanvas: FC<AbilityTreeCanvasProps> = ({
    abilities,
    tierCount,
    onNodeDragStop,
    onConnect,
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // This effect transforms the raw ability data into nodes and edges for React Flow.
    useEffect(() => {
        const initialNodes: Node[] = abilities.map((ability) => {
            // Default positioning logic if x/y are not set in the DB
            const xPos = ability.x ?? TIER_WIDTH * ability.tier - TIER_WIDTH / 2;
            const yPos = ability.y ?? 100;

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
            // Calculate the center of the tier the node is being dragged over
            const closestTier = Math.max(1, Math.round(node.position.x / TIER_WIDTH) + 1);
            const snappedX = TIER_WIDTH * closestTier - TIER_WIDTH / 2;

            // Optimistically snap the node in the UI for immediate feedback
            setNodes((nds) =>
                nds.map((n) =>
                    n.id === node.id ? { ...n, position: { ...n.position, x: snappedX } } : n,
                ),
            );

            // Call the prop function to persist the change
            onNodeDragStop({ ...node, position: { ...node.position, x: snappedX } }, closestTier);
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
                    {/* Render tier dividers and labels dynamically */}
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
