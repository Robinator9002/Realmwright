// src/components/specific/AbilityTreeEditor/AbilityTreeEditor.tsx
import { useMemo } from 'react';
import type { FC } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css'; // Required styles for React Flow

import type { Ability } from '../../../db/types';
import type { Node, Edge } from 'reactflow';
// NEW: Import our custom node component.
import { AbilityNode } from './AbilityNode';

// Define the props for our new editor component.
interface AbilityTreeEditorProps {
    abilities: Ability[];
}

// NEW: Create a nodeTypes object to tell React Flow about our custom node.
// The key 'abilityNode' must match the `type` we assigned to our nodes.
const nodeTypes = {
    abilityNode: AbilityNode,
};

/**
 * A visual, node-based editor for displaying an Ability Tree.
 * This component wraps the React Flow library and transforms our
 * application's Ability data into a format it can render.
 */
export const AbilityTreeEditor: FC<AbilityTreeEditorProps> = ({ abilities }) => {
    const { nodes, edges } = useMemo(() => {
        const initialNodes: Node[] = [];
        const initialEdges: Edge[] = [];

        for (const ability of abilities) {
            initialNodes.push({
                id: String(ability.id!),
                position: { x: ability.x || 0, y: ability.y || 0 },
                data: { label: ability.name, description: ability.description },
                type: 'abilityNode', // This string tells React Flow to use our custom component
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

        return { nodes: initialNodes, edges: initialEdges };
    }, [abilities]);

    return (
        <div style={{ height: '100%', width: '100%', minHeight: '500px' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                // NEW: Pass the custom nodeTypes to React Flow.
                nodeTypes={nodeTypes}
                fitView
                nodesDraggable={false}
                nodesConnectable={false}
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
};
