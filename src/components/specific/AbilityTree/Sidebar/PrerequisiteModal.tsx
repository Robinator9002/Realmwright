// src/components/specific/AbilityTree/Sidebar/PrerequisiteModal.tsx

/**
 * COMMIT: chore(ability-tree): relocate PrerequisiteModal to sidebar directory
 *
 * This commit moves the `PrerequisiteModal` component into the `/Sidebar`
 * directory, its final planned location.
 *
 * Rationale:
 * Although it is a modal, its function is exclusively tied to the creation
 * of edges, an action initiated from the sidebar's context (and soon, the
 * canvas). Grouping it with the other sidebar components keeps all related
 * UI logic consolidated.
 *
 * No functional changes were required for this component.
 */
import type { FC } from 'react';

// The logical types for prerequisites that a user can choose from.
export type PrerequisiteLogicType = 'AND' | 'OR';

interface PrerequisiteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: PrerequisiteLogicType) => void;
}

export const PrerequisiteModal: FC<PrerequisiteModalProps> = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) {
        return null;
    }

    const handleSelect = (type: PrerequisiteLogicType) => {
        onSelect(type);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">Select Prerequisite Logic</h2>
                    <button onClick={onClose} className="modal__close-button">
                        &times;
                    </button>
                </div>
                <div className="modal__content">
                    <p>How should this new prerequisite be linked to any existing ones?</p>
                </div>
                <div className="modal__footer">
                    <button onClick={() => handleSelect('AND')} className="button button--primary">
                        AND (Must have this AND others)
                    </button>
                    <button onClick={() => handleSelect('OR')} className="button">
                        OR (Must have this OR others)
                    </button>
                </div>
            </div>
        </div>
    );
};
