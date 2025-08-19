// src/components/specific/AbilityTreeEditor/AbilityTreeEditor.tsx
import { useEffect, useCallback } from 'react';
import type { FC } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import type { Ability } from '../../../db/types';
import type { Node, Edge, OnConnect, NodeDragHandler, Connection } from 'reactflow';
import { AbilityNode } from './AbilityNode';

interface AbilityTreeEditorProps {
    abilities: Ability[];
    onNodeDragStop: (node: Node) => void;
    onConnect: (connection: Connection) => void;
}

// FIX: Define nodeTypes outside the component.
// This prevents it from being recreated on every render, resolving the performance warning.
const nodeTypes = {
    abilityNode: AbilityNode,
};

/**
 * A visual, node-based editor for displaying and modifying an Ability Tree.
 */
export const AbilityTreeEditor: FC<AbilityTreeEditorProps> = ({
    abilities,
    onNodeDragStop,
    onConnect,
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        const initialNodes: Node[] = [];
        const initialEdges: Edge[] = [];

        for (const ability of abilities) {
            initialNodes.push({
                id: String(ability.id!),
                position: { x: ability.x || 0, y: ability.y || 0 },
                data: { label: ability.name, description: ability.description },
                type: 'abilityNode',
            });

            if (ability.prerequisites?.abilityIds) {
                for (const prereqId of ability.prerequisites.abilityIds) {
                    initialEdges.push({
                        id: `e-${prereqId}-${ability.id}`,
                        source: String(prereqId),
                        target: String(ability.id!),
                        animated: true,
                    });
                }
            }
        }
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [abilities, setNodes, setEdges]);

    const handleNodeDragStop: NodeDragHandler = useCallback(
        (_, node) => {
            onNodeDragStop(node);
        },
        [onNodeDragStop],
    );

    const handleConnect: OnConnect = useCallback(
        (connection) => {
            setEdges((eds) => addEdge(connection, eds));
            onConnect(connection);
        },
        [setEdges, onConnect],
    );

    return (
        // FIX: The wrapper div now has a class instead of inline styles.
        // This allows us to control its height more effectively from the parent.
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
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
};
