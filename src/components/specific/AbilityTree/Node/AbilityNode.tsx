// src/components/specific/AbilityTree/Node/AbilityNode.tsx

/**
 * COMMIT: chore(ability-tree): relocate AbilityNode to node directory
 *
 * This commit moves the `AbilityNode` component to its final, organized
 * location within the `/Node` subdirectory.
 *
 * Rationale:
 * Consolidating all custom React Flow node components into a dedicated
 * directory improves the overall structure and maintainability of the module,
 * making it easy to locate and manage these critical visual components.
 *
 * No functional changes were required.
 */
import type { FC } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { ShieldCheck } from 'lucide-react';

export const AbilityNode: FC<NodeProps> = ({ data }) => {
    // The `title` attribute provides a native browser tooltip on hover.
    const tooltipContent = `${data.label}${data.description ? `\n\n${data.description}` : ''}`;

    return (
        <div title={tooltipContent}>
            <div className="ability-node">
                <Handle type="target" position={Position.Top} className="ability-node__handle" />

                <div className="ability-node__icon-container">
                    {data.iconUrl ? (
                        <img
                            src={data.iconUrl}
                            alt={data.label}
                            className="ability-node__icon"
                            // Simple error handling to show placeholder if image fails
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : null}
                    <ShieldCheck className="ability-node__icon-placeholder" size={32} />
                </div>

                <div className="ability-node__main-content">
                    <h4 className="ability-node__title">{data.label}</h4>
                </div>

                <Handle type="source" position={Position.Bottom} className="ability-node__handle" />
            </div>
        </div>
    );
};
