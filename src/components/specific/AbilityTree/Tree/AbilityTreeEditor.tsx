// src/components/specific/AbilityTree/AbilityTreeEditor.tsx
import { useEffect, useCallback } from 'react';
import type { FC } from 'react';
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

import type { Ability } from '../../../../db/types';
import type { Node, Edge, OnConnect, NodeDragHandler, Connection } from 'reactflow';
import { AbilityNode } from '../Node/AbilityNode';

interface AbilityTreeEditorProps {
    abilities: Ability[];
    tierCount: number;
    onNodeDragStop: (node: Node, closestTier: number) => void;
    onConnect: (connection: Connection) => void;
}

const nodeTypes = {
    abilityNode: AbilityNode,
};

const TIER_WIDTH = 250;

/**
 * A visual, node-based editor for displaying and modifying an Ability Tree with a tiered layout.
 */
export const AbilityTreeEditor: FC<AbilityTreeEditorProps> = ({
    abilities,
    tierCount,
    onNodeDragStop,
    onConnect,
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        const initialNodes: Node[] = [];
        const initialEdges: Edge[] = [];

        for (const ability of abilities) {
            // Ensure nodes don't start at the very edge
            const xPos = ability.x ?? TIER_WIDTH * ability.tier - TIER_WIDTH / 2;
            const yPos = ability.y ?? 100;

            initialNodes.push({
                id: String(ability.id!),
                position: { x: xPos, y: yPos },
                data: { label: ability.name, description: ability.description },
                type: 'abilityNode',
            });

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
    }, [abilities, setNodes, setEdges, tierCount]);

    const handleNodeDragStop: NodeDragHandler = useCallback(
        (_, node) => {
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
                    {/* REWORK: Dynamically render tier lines AND labels based on the prop */}
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
