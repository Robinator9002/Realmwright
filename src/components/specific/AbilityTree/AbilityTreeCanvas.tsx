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
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    type Node,
    type NodeDragHandler,
    type Connection,
    type NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Ability, AbilityTree } from '../../../db/types';
import { AbilityNode } from './AbilityNode';
import { LogicEdge } from './LogicEdge';
import { AttachmentNode } from './AttachmentNode';

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

const TIER_HEIGHT = 150;
const NODE_X_SPACING = 200;

interface AbilityTreeCanvasProps {
    abilities: Ability[];
    tierCount: number;
    onNodeDragStop: (node: Node, closestTier: number) => void;
    onConnect: (connection: Connection) => void;
    onDelete: (deletedNodes: Node[], deletedEdges: Edge[]) => void;
    onNodeClick: (node: Node | null) => void;
    // NEW: Add availableTrees to the props interface
    availableTrees: AbilityTree[];
}

/**
 * REWORKED: The canvas now uses the availableTrees prop to find and
 * display the names of attached trees on AttachmentNodes.
 */
export const AbilityTreeCanvas: FC<AbilityTreeCanvasProps> = ({
    abilities,
    tierCount,
    onNodeDragStop,
    onConnect,
    onDelete,
    onNodeClick,
    availableTrees, // Destructure the new prop
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const { initialNodes, initialEdges } = useMemo(() => {
        const nodes: Node[] = abilities.map((ability) => {
            const yPos = ability.y ?? TIER_HEIGHT * ability.tier - TIER_HEIGHT / 2;
            const xPos = ability.x ?? NODE_X_SPACING * ability.tier;

            // NEW: Logic to find the name of the attached tree
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
                    iconUrl: ability.iconUrl,
                    attachmentPoint: ability.attachmentPoint,
                    attachedTreeName: attachedTreeName, // Pass the name to the node
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
    }, [abilities, availableTrees]); // Add availableTrees to dependency array

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
            >
                <Background
                    variant={BackgroundVariant.Lines}
                    gap={48}
                    lineWidth={0.25}
                    color="var(--color-border)"
                />
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
                        </g>
                    ))}
                </svg>
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
};
