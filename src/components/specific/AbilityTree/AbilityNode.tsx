// src/components/specific/AbilityTreeEditor/AbilityNode.tsx
import type { FC } from 'react';
// Handle is the component that creates the connection points on our nodes.
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

/**
 * A custom styled node for displaying an Ability in the React Flow editor.
 * It provides connection points (Handles) for prerequisites and dependents.
 */
export const AbilityNode: FC<NodeProps> = ({ data }) => {
    return (
        <div className="ability-node">
            {/* This Handle is the connection point for incoming edges (prerequisites). */}
            <Handle type="target" position={Position.Left} className="ability-node__handle" />

            <div className="ability-node__header">
                <h4 className="ability-node__title">{data.label}</h4>
            </div>
            <div className="ability-node__content">
                <p className="ability-node__description">{data.description}</p>
            </div>

            {/* This Handle is the connection point for outgoing edges (abilities that require this one). */}
            <Handle type="source" position={Position.Right} className="ability-node__handle" />
        </div>
    );
};
