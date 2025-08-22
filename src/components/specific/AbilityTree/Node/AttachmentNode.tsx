// src/components/specific/AbilityTree/AttachmentNode.tsx
import type { FC } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Plug, Link } from 'lucide-react'; // Icons for empty and filled sockets

/**
 * A custom styled node for displaying an Attachment Point in the React Flow editor.
 * It is visually distinct from a regular AbilityNode and shows its attachment status.
 */
export const AttachmentNode: FC<NodeProps> = ({ data }) => {
    const isAttached = !!data.attachmentPoint?.attachedTreeId;
    const attachedTreeName = data.attachedTreeName || 'Loading...';

    return (
        // The 'attachment-node' class will be used for specific styling
        <div className={`ability-node attachment-node ${isAttached ? 'attached' : ''}`}>
            <Handle type="target" position={Position.Top} className="ability-node__handle" />

            <div className="ability-node__icon-container">
                {/* Show a different icon based on whether a tree is attached */}
                {isAttached ? (
                    <Link className="attachment-node__icon--attached" size={32} />
                ) : (
                    <Plug className="attachment-node__icon--empty" size={32} />
                )}
            </div>

            <div className="ability-node__main-content">
                <h4 className="ability-node__title" title={data.label}>
                    {data.label}
                </h4>
                {/* NEW: Display the status or the name of the attached tree */}
                <p className="attachment-node__status">
                    {isAttached ? attachedTreeName : '(Empty Socket)'}
                </p>
            </div>

            <Handle type="source" position={Position.Bottom} className="ability-node__handle" />
        </div>
    );
};
