// src/components/specific/AbilityTree/Node/AttachmentNode.tsx
import type { FC } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Plug, Link } from 'lucide-react';

/**
 * REWORKED: The node now has a native browser tooltip to show its full details,
 * including its current attachment status.
 */
export const AttachmentNode: FC<NodeProps> = ({ data }) => {
    const isAttached = !!data.attachmentPoint?.attachedTreeId;
    const attachedTreeName = data.attachedTreeName || 'Loading...';

    // Construct the tooltip content based on attachment status.
    const statusText = isAttached ? `Attached: ${attachedTreeName}` : 'Status: Empty Socket';
    const tooltipContent = `${data.label}\n\n${statusText}${
        data.description ? `\n\n${data.description}` : ''
    }`;

    return (
        <div title={tooltipContent}>
            <div className={`ability-node attachment-node ${isAttached ? 'attached' : ''}`}>
                <Handle type="target" position={Position.Top} className="ability-node__handle" />

                <div className="ability-node__icon-container">
                    {isAttached ? (
                        <Link className="attachment-node__icon--attached" size={32} />
                    ) : (
                        <Plug className="attachment-node__icon--empty" size={32} />
                    )}
                </div>

                <div className="ability-node__main-content">
                    <h4 className="ability-node__title">{data.label}</h4>
                    <p className="attachment-node__status">
                        {isAttached ? attachedTreeName : '(Empty Socket)'}
                    </p>
                </div>

                <Handle type="source" position={Position.Bottom} className="ability-node__handle" />
            </div>
        </div>
    );
};
