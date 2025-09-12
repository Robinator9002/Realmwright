// src/components/specific/AbilityTree/Sidebar/ManageAttachmentPanel.tsx

/**
 * COMMIT: feat(ability-tree): create isolated ManageAttachmentPanel component
 *
 * This commit introduces the `ManageAttachmentPanel`, the specialized component
 * for managing "socket" or `attachmentNode` type abilities.
 *
 * Rationale:
 * The logic for attaching, detaching, and deleting sockets is distinct from
 * standard ability editing. Isolating it in its own component cleans up the
 * main sidebar and adheres to the single-responsibility principle.
 *
 * Implementation Details:
 * - It receives `availableTrees` as a prop, as this list is managed by the
 * top-level page component and is not part of the core ability data context.
 * - It uses the `useAbilityTreeEditor` hook to get the `selectedNode` and the
 * functions `handleAttachTree`, `handleDetachTree`, and `handleDeleteAbility`.
 * - A `useMemo` hook is used to efficiently filter the `availableTrees` list
 * to show only those that are compatible with the socket's defined
 * `allowedAttachmentType`.
 * - It leverages the `useModal` context for user confirmation on both detach
 * and delete actions, preventing accidental data loss.
 */
import { useState, useEffect, useMemo, type FC } from 'react';
import { Trash2 } from 'lucide-react';
import { useAbilityTreeEditor } from '../../../../context/feature/AbilityTreeEditorContext';
import { useModal } from '../../../../context/global/ModalContext';
import type { AbilityTree } from '../../../../db/types';

interface ManageAttachmentPanelProps {
    availableTrees: AbilityTree[];
}

export const ManageAttachmentPanel: FC<ManageAttachmentPanelProps> = ({ availableTrees }) => {
    const {
        selectedNode,
        handleAttachTree,
        handleDetachTree,
        handleDeleteAbility,
        setSelectedNode,
    } = useAbilityTreeEditor();
    const { showModal } = useModal();

    const [selectedTreeId, setSelectedTreeId] = useState<string>('');

    // This effect resets the dropdown selection when the selected node changes.
    useEffect(() => {
        setSelectedTreeId('');
    }, [selectedNode]);

    // Memoize the list of compatible trees to avoid re-calculating on every render.
    const compatibleTrees = useMemo(() => {
        const requiredType = selectedNode?.data.attachmentPoint?.allowedAttachmentType;
        if (!requiredType) {
            return availableTrees; // If no type is specified, all trees are compatible.
        }
        return availableTrees.filter((tree) => tree.attachmentType === requiredType);
    }, [availableTrees, selectedNode]);

    // Safeguard in case this panel is rendered without a selected node.
    if (!selectedNode) return null;

    const attachedTreeId = selectedNode.data.attachmentPoint?.attachedTreeId;
    const attachedTree = attachedTreeId
        ? availableTrees.find((t) => t.id === attachedTreeId)
        : null;

    const handleAttach = () => {
        if (selectedTreeId) {
            handleAttachTree(parseInt(selectedNode.id, 10), parseInt(selectedTreeId, 10));
        }
    };

    const handleDetach = () => {
        showModal('confirmation', {
            title: 'Detach Tree?',
            message: `Are you sure you want to detach "${
                attachedTree?.name || 'this tree'
            }" from this socket?`,
            onConfirm: () => handleDetachTree(parseInt(selectedNode.id, 10)),
        });
    };

    const handleDelete = () => {
        showModal('confirmation', {
            title: 'Delete Attachment Socket?',
            message: `This will permanently delete the "${selectedNode.data.label}" socket. This action cannot be undone.`,
            onConfirm: async () => {
                await handleDeleteAbility(parseInt(selectedNode.id, 10));
                setSelectedNode(null); // Clear selection after deletion.
            },
        });
    };

    return (
        <div className="sidebar-panel">
            <h3 className="sidebar__title">Manage Socket</h3>

            <div className="sidebar-panel__section">
                <div className="form__group">
                    <h4 className="panel__item-title">{selectedNode.data.label}</h4>
                    {selectedNode.data.description && (
                        <p className="panel__item-description">{selectedNode.data.description}</p>
                    )}
                    {selectedNode.data.attachmentPoint?.allowedAttachmentType && (
                        <p className="panel__item-meta">
                            Requires Type:{' '}
                            <strong>
                                {selectedNode.data.attachmentPoint.allowedAttachmentType}
                            </strong>
                        </p>
                    )}
                </div>
            </div>

            <div className="sidebar-panel__section">
                {attachedTree ? (
                    <div className="form__group">
                        <label className="form__label">Currently Attached</label>
                        <div className="attachment-display">
                            <span className="attachment-display__name">{attachedTree.name}</span>
                            <button
                                onClick={handleDetach}
                                className="button button--danger button--sm"
                            >
                                Detach
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="form__group">
                            <label htmlFor="attach-tree-select" className="form__label">
                                Attach a Tree
                            </label>
                            <select
                                id="attach-tree-select"
                                value={selectedTreeId}
                                onChange={(e) => setSelectedTreeId(e.target.value)}
                                className="form__select"
                                disabled={compatibleTrees.length === 0}
                            >
                                <option value="" disabled>
                                    {compatibleTrees.length > 0
                                        ? 'Select a compatible tree...'
                                        : 'No compatible trees found.'}
                                </option>
                                {compatibleTrees.map((tree) => (
                                    <option key={tree.id} value={String(tree.id!)}>
                                        {tree.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleAttach}
                            disabled={!selectedTreeId}
                            className="button button--primary button--full-width"
                        >
                            Attach Selected Tree
                        </button>
                    </>
                )}
            </div>

            <div className="sidebar-panel__section danger-zone">
                <h4 className="danger-zone__title">Danger Zone</h4>
                <p>Permanently remove this socket from the ability tree.</p>
                <button onClick={handleDelete} className="button button--danger button--full-width">
                    <Trash2 size={16} /> Delete Socket
                </button>
            </div>
        </div>
    );
};
