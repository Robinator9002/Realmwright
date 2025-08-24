// src/components/specific/AbilityTree/Node/AttachmentNode.tsx

/**
 * COMMIT: chore(ability-tree): relocate AttachmentNode to node directory
 *
 * This commit moves the `AttachmentNode` component to its final location
 * within the `/Node` subdirectory, alongside the standard `AbilityNode`.
 *
 * Rationale:
 * This completes the organizational goal of consolidating all custom React
 * Flow nodes into a single, easy-to-find directory. This improves the
 * project's structure and makes the codebase more intuitive to navigate.
 *
 * No functional changes were required for this component.
 */
import type { FC } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Plug, Link } from 'lucide-react';

export const AttachmentNode: FC<NodeProps> = ({ data }) => {
    const isAttached = !!data.attachmentPoint?.attachedTreeId;

    // The `attachedTreeName` is now passed down in the node's data object,
    // which is more efficient than looking it up here.
    const attachedTreeName = data.attachedTreeName || 'Loading...';

    // Construct the tooltip content based on the node's current state.
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
