// src/components/specific/AbilityTree/AbilityNode.tsx
import type { FC } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { ShieldCheck } from 'lucide-react'; // A nice default placeholder icon

/**
 * A custom styled node for displaying an Ability in the React Flow editor.
 * It now supports displaying a custom icon.
 */
export const AbilityNode: FC<NodeProps> = ({ data }) => {
    return (
        <div className="ability-node">
            <Handle type="target" position={Position.Top} className="ability-node__handle" />

            <div className="ability-node__icon-container">
                {/* We render the img tag if the URL exists */}
                {data.iconUrl ? (
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
                ) : null}
                {/* The default placeholder icon, which we can show or hide with CSS */}
                <ShieldCheck className="ability-node__icon-placeholder" size={32} />
            </div>

            <div className="ability-node__main-content">
                <div className="ability-node__header">
                    <h4 className="ability-node__title">{data.label}</h4>
                </div>
                <div className="ability-node__content">
                    <p className="ability-node__description">{data.description}</p>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="ability-node__handle" />
        </div>
    );
};
