// src/components/specific/AbilityTree/AbilityNode.tsx
import type { FC } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { ShieldCheck } from 'lucide-react'; // A nice default placeholder icon

/**
 * REWORKED: A custom styled node for displaying an Ability in the React Flow editor.
 * The structure is now optimized for a compact, icon-focused, square layout.
 */
export const AbilityNode: FC<NodeProps> = ({ data }) => {
    return (
        <div className="ability-node">
            {/* Handles are the connection points for edges */}
            <Handle type="target" position={Position.Top} className="ability-node__handle" />

            <div className="ability-node__icon-container">
                {/* We only render the img tag if the URL exists */}
                {data.iconUrl && (
                    <img
                        src={data.iconUrl}
                        alt={data.label}
                        className="ability-node__icon"
                        // If the image fails to load, we add an 'error' class to its parent
                        // so we can show the placeholder via CSS instead.
                        onError={(e) => {
                            e.currentTarget.parentElement?.classList.add('error');
                        }}
                    />
                )}
                {/* The default placeholder icon, which is shown or hidden via CSS */}
                <ShieldCheck className="ability-node__icon-placeholder" size={32} />
            </div>

            <div className="ability-node__main-content">
                {/* The title attribute provides a native tooltip for truncated names */}
                <h4 className="ability-node__title" title={data.label}>
                    {data.label}
                </h4>
            </div>

            <Handle type="source" position={Position.Bottom} className="ability-node__handle" />
        </div>
    );
};
