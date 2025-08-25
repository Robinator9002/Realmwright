// src/components/specific/AbilityTree/Sidebar/PrerequisiteModal.tsx

/**
 * COMMIT: refactor(styling): Apply consistent BEM classes to PrerequisiteModal
 *
 * Rationale:
 * To align this component with the project's broader design system, this
 * commit replaces several Tailwind utility classes with the established BEM
 * class names defined in the project's CSS component files (e.g., _modal.css).
 *
 * Implementation Details:
 * - Applied `modal__header`, `modal__title`, `modal__content`, and `modal__footer`
 * classes to the modal's core structure for consistent padding, borders, and layout.
 * - Confirmed that button classes like `button`, `button--primary`, and
 * `button--danger` are used correctly according to the design system's intent.
 * - This change improves semantic clarity and makes future styling updates easier
 * by centralizing styles in the CSS files rather than in the component's JSX.
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
                {/* Footer with actions, styled according to the BEM convention. */}
                <div className={`modal__footer ${isEditMode ? 'justify-between' : ''}`}>
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
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
