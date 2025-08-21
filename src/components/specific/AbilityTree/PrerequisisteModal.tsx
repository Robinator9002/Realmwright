// src/components/specific/AbilityTree/PrerequisiteModal.tsx
import type { FC } from 'react';
import type { PrerequisiteGroup } from '../../../db/types';

// Define the logical types for prerequisites that the user can choose from.
export type PrerequisiteLogicType = 'AND' | 'OR'; // Add 'XOR', 'NOR' etc. here in the future

interface PrerequisiteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: PrerequisiteLogicType) => void;
}

/**
 * A simple modal that allows the user to select the logical relationship
 * for a new prerequisite connection between two abilities.
 */
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
                    {/* For now, we only offer AND and OR as per the initial plan */}
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
