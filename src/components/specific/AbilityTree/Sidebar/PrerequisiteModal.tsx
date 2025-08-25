// src/components/specific/AbilityTree/Sidebar/PrerequisiteModal.tsx

/**
 * COMMIT: fix(ability-tree): Resolve modal logic bug and improve styling
 *
 * This commit addresses the final outstanding issues in the PrerequisiteModal.
 *
 * Rationale:
 * 1. A logic bug caused the creation modal to appear immediately after the
 * edit modal was closed. This was because the `onSelect` callback was
 * being called incorrectly.
 * 2. The button layout in the modal footer was cluttered and unintuitive.
 *
 * Implementation Details:
 * - The `handleSelectOrCreate` function has been removed. The "create" buttons
 * now directly call `onSelect` and then `onClose` separately, ensuring the
 * creation logic is only ever triggered by an explicit user action.
 * - The `onClose` prop is now correctly called by the "Cancel" button and
 * the overlay click, cleanly dismissing the modal without side effects.
 * - The JSX for the modal footer has been restructured with flexbox (`flex`,
 * `justify-between`, `items-center`) for a cleaner, more professional
 * layout, and the `button--danger` class is correctly applied.
 */
import type { FC } from 'react';
import { useAbilityTreeEditor } from '../../../../context/AbilityTreeEditorContext';
import type { PrerequisiteLogicType } from '../../../../db/types';

// --- INTERFACE DEFINITION ---
// Defines the properties (props) that this component accepts.
interface PrerequisiteModalProps {
    isOpen: boolean; // Controls whether the modal is visible or not.
    onClose: () => void; // Function to call when the modal should be closed.
    onSelect: (type: PrerequisiteLogicType) => void; // Function to call when a logic type is selected.
}

// --- COMPONENT DEFINITION ---
// This is a functional component for selecting or editing prerequisite logic.
export const PrerequisiteModal: FC<PrerequisiteModalProps> = ({ isOpen, onClose, onSelect }) => {
    // --- HOOKS ---
    // Accessing the global state and actions from our custom context.
    const { selectedEdge, handleUpdateEdgeLogic, handleDeleteEdge } = useAbilityTreeEditor();

    // --- RENDER LOGIC ---
    // If the modal is not supposed to be open, render nothing.
    if (!isOpen) {
        return null;
    }

    // Determine if the modal is in "edit" mode by checking if an edge is selected.
    const isEditMode = !!selectedEdge;
    // Get the current logic type from the selected edge's data, if it exists.
    const currentLogic = selectedEdge?.data.label as PrerequisiteLogicType | undefined;

    // --- EVENT HANDLERS ---
    // Handles the update action in edit mode.
    const handleUpdate = (type: PrerequisiteLogicType) => {
        handleUpdateEdgeLogic(type);
        onClose(); // Close the modal after updating.
    };

    // Handles the delete action in edit mode.
    const handleDelete = () => {
        handleDeleteEdge();
        onClose(); // Close the modal after deleting.
    };

    // --- JSX ---
    return (
        // The modal overlay, which closes the modal when clicked.
        <div className="modal-overlay" onClick={onClose}>
            {/* The modal content itself. stopPropagation prevents clicks inside from closing it. */}
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
                {/* Reworked footer for better styling and logic */}
                <div className="modal__footer flex justify-between items-center">
                    {isEditMode ? (
                        // --- EDIT MODE FOOTER ---
                        <>
                            <button onClick={handleDelete} className="button button--danger">
                                Delete Connection
                            </button>
                            <div className="flex gap-2">
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
                            </div>
                        </>
                    ) : (
                        // --- CREATE MODE FOOTER ---
                        <div className="flex w-full justify-end gap-2">
                            <button
                                onClick={() => {
                                    onSelect('OR');
                                    onClose();
                                }}
                                className="button"
                            >
                                OR (Must have this OR others)
                            </button>
                            <button
                                onClick={() => {
                                    onSelect('AND');
                                    onClose();
                                }}
                                className="button button--primary"
                            >
                                AND (Must have this AND others)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
