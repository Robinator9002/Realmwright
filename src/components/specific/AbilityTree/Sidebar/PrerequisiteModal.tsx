// src/components/specific/AbilityTree/Sidebar/PrerequisiteModal.tsx

/**
 * COMMIT: feat(ability-tree): enhance PrerequisiteModal for edge editing
 *
 * This commit refactors the PrerequisiteModal to be a multi-purpose component
 * capable of both creating new connections and editing/deleting existing ones.
 *
 * Rationale:
 * To provide a consistent UI for all edge interactions, the modal is the ideal
 * central point. Reusing the existing component is more efficient than creating
 * a separate one for editing.
 *
 * Implementation Details:
 * - The component now consumes the `useAbilityTreeEditor` context to access
 * the `selectedEdge`, `handleUpdateEdgeLogic`, and `handleDeleteEdge` functions.
 * - It dynamically changes its title and button text based on whether a
 * `selectedEdge` exists.
 * - If an edge is selected, the "AND"/"OR" buttons now call `handleUpdateEdgeLogic`.
 * - A "Delete Connection" button is now visible in edit mode, which calls
 * `handleDeleteEdge` and is styled as a destructive action.
 * - The original `onSelect` prop is still used for creating new connections,
 * ensuring backward compatibility with the connection creation workflow.
 */
import type { FC } from 'react';
import { useAbilityTreeEditor } from '../../../../context/AbilityTreeEditorContext';
import type { PrerequisiteLogicType } from '../../../../db/types';

interface PrerequisiteModalProps {
    isOpen: boolean;
    onClose: () => void;
    // This prop is now only for CREATING new connections
    onSelect: (type: PrerequisiteLogicType) => void;
}

export const PrerequisiteModal: FC<PrerequisiteModalProps> = ({ isOpen, onClose, onSelect }) => {
    // Consume the context to get edge-related state and actions
    const { selectedEdge, handleUpdateEdgeLogic, handleDeleteEdge } = useAbilityTreeEditor();

    if (!isOpen) {
        return null;
    }

    // Determine if we are in "edit" mode (an edge is selected) or "create" mode
    const isEditMode = !!selectedEdge;
    const currentLogic = selectedEdge?.data.label as PrerequisiteLogicType | undefined;

    const handleSelectOrCreate = (type: PrerequisiteLogicType) => {
        onSelect(type); // For creating new connections
        onClose();
    };

    const handleUpdate = (type: PrerequisiteLogicType) => {
        handleUpdateEdgeLogic(type); // For updating existing connections
        // The context handler will close the modal by setting selectedEdge to null
    };

    const handleDelete = () => {
        handleDeleteEdge(); // For deleting existing connections
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">
                        {isEditMode ? 'Edit Connection Logic' : 'Select Prerequisite Logic'}
                    </h2>
                    <button onClick={onClose} className="modal__close-button">
                        &times;
                    </button>
                </div>
                <div className="modal__content">
                    <p>
                        {isEditMode
                            ? 'Update the logical requirement for this prerequisite.'
                            : 'How should this new prerequisite be linked to any existing ones?'}
                    </p>
                </div>
                <div className="modal__footer">
                    {isEditMode ? (
                        <>
                            <button
                                onClick={handleDelete}
                                className="button button--danger mr-auto"
                            >
                                Delete Connection
                            </button>
                            <button onClick={onClose} className="button">
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUpdate('OR')}
                                className={`button ${
                                    currentLogic === 'OR' ? 'button--primary' : ''
                                }`}
                            >
                                OR
                            </button>
                            <button
                                onClick={() => handleUpdate('AND')}
                                className={`button ${
                                    currentLogic === 'AND' ? 'button--primary' : ''
                                }`}
                            >
                                AND
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleSelectOrCreate('OR')} className="button">
                                OR (Must have this OR others)
                            </button>
                            <button
                                onClick={() => handleSelectOrCreate('AND')}
                                className="button button--primary"
                            >
                                AND (Must have this AND others)
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
