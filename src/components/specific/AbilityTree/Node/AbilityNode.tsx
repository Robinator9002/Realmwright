// src/components/specific/AbilityTree/Node/AbilityNode.tsx
import type { FC } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { ShieldCheck } from 'lucide-react';

/**
 * REWORKED: The node is now wrapped in a div with a `title` attribute
 * to provide a native browser tooltip on hover, showing the full name and description.
 */
export const AbilityNode: FC<NodeProps> = ({ data }) => {
    // Construct the tooltip content. Show description only if it exists.
    const tooltipContent = `${data.label}${data.description ? `\n\n${data.description}` : ''}`;

    return (
        <div title={tooltipContent}>
            <div className="ability-node">
                <Handle type="target" position={Position.Top} className="ability-node__handle" />

                <div className="ability-node__icon-container">
                    {data.iconUrl && (
                        <img
                            src={data.iconUrl}
                            alt={data.label}
                            className="ability-node__icon"
                            onError={(e) => {
                                e.currentTarget.parentElement?.classList.add('error');
                            }}
                        />
                    )}
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
