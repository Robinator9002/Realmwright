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

// Define the props for our editor component, now including event handlers.
interface AbilityTreeEditorProps {
    abilities: Ability[];
    onNodeDragStop: (node: Node) => void;
    onConnect: (connection: Connection) => void;
}

const nodeTypes = {
    abilityNode: AbilityNode,
};

/**
 * A visual, node-based editor for displaying and modifying an Ability Tree.
 * It now handles user interactions and reports changes back to its parent component.
 */
export const AbilityTreeEditor: FC<AbilityTreeEditorProps> = ({
    abilities,
    onNodeDragStop,
    onConnect,
}) => {
    // React Flow's built-in hooks for managing state. This is more efficient
    // than recalculating on every render with useMemo.
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // This effect synchronizes the internal state of the editor with the
    // `abilities` data passed down from the parent.
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

    // This handler is called when a user finishes dragging a node.
    // We pass the event up to the parent component to handle the database update.
    const handleNodeDragStop: NodeDragHandler = useCallback(
        (_, node) => {
            onNodeDragStop(node);
        },
        [onNodeDragStop],
    );

    // This handler is called when a user successfully connects two nodes.
    // We optimistically update the UI by adding the edge, then pass the
    // connection details up to the parent to update the database.
    const handleConnect: OnConnect = useCallback(
        (connection) => {
            setEdges((eds) => addEdge(connection, eds));
            onConnect(connection);
        },
        [setEdges, onConnect],
    );

    return (
        <div style={{ height: '100%', width: '100%', minHeight: '500px' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDragStop={handleNodeDragStop}
                onConnect={handleConnect}
                fitView
                // REFACTOR: The editor is now fully interactive.
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
