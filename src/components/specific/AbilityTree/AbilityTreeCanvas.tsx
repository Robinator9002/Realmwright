// src/components/specific/AbilityTree/AbilityTreeCanvas.tsx
import { useEffect, useCallback, useMemo, type FC } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    // REWORK: We now import the hooks directly from reactflow
    useNodesState,
    useEdgesState,
    addEdge,
    BackgroundVariant,
    type Edge,
    // NEW: Import the change handlers for deletion logic
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    type Node,
    type NodeDragHandler,
    type Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Ability } from '../../../db/types';
import { AbilityNode } from './AbilityNode';
import { LogicEdge } from './LogicEdge';

const nodeTypes = {
    abilityNode: AbilityNode,
};
const edgeTypes = {
    logicEdge: LogicEdge,
};
const defaultEdgeOptions = {
    type: 'logicEdge',
    style: { strokeWidth: 2 },
};

const TIER_HEIGHT = 150;
const NODE_X_SPACING = 200;

interface AbilityTreeCanvasProps {
    abilities: Ability[];
    tierCount: number;
    onNodeDragStop: (node: Node, closestTier: number) => void;
    onConnect: (connection: Connection) => void;
    // NEW: Add a prop for handling deletions
    onDelete: (deletedNodes: Node[], deletedEdges: Edge[]) => void;
}

/**
 * REWORKED: This component now correctly handles node and edge deletions
 * by using the state management hooks provided by React Flow.
 */
export const AbilityTreeCanvas: FC<AbilityTreeCanvasProps> = ({
    abilities,
    tierCount,
    onNodeDragStop,
    onConnect,
    onDelete,
}) => {
    // We get the handlers directly from the hooks
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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
    }, [abilities]);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    /**
     * NEW: A wrapper for the onNodesChange handler. It calls the default
     * handler to update the UI, then calls our onDelete prop to notify
     * the parent of any deletions so they can be persisted.
     */
    const handleNodesChange: OnNodesChange = (changes) => {
        const deletedNodeChanges = changes.filter((change) => change.type === 'remove');
        if (deletedNodeChanges.length > 0) {
            const deletedNodeIds = new Set(deletedNodeChanges.map((change) => change.id));
            const deletedNodes = nodes.filter((node) => deletedNodeIds.has(node.id));
            onDelete(deletedNodes, []);
        }
        onNodesChange(changes);
    };

    /**
     * NEW: A wrapper for the onEdgesChange handler, with the same logic as above.
     */
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
            // We don't add the edge here anymore, because the parent will trigger a refresh
            onConnect(connection);
        },
        [onConnect],
    );

    return (
        <div className="ability-editor-wrapper">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                // REWORK: We now pass our new wrapped handlers
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onNodeDragStop={handleNodeDragStop}
                onConnect={handleConnect}
                fitView
                nodesDraggable={true}
                nodesConnectable={true}
                defaultEdgeOptions={defaultEdgeOptions}
                // NEW: This prop makes sure that deleting a node also deletes its connected edges
                deleteKeyCode={['Backspace', 'Delete']}
                nodesFocusable={true}
                edgesFocusable={true}
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
