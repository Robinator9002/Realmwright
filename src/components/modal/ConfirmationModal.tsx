// src/components/common/Modal/ConfirmationModal.tsx
import type { FC, ReactNode } from 'react';

export interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: ReactNode; // The message or content of the modal
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean; // Toggles the confirm button to a danger style
}

/**
 * A reusable modal dialog for confirming user actions.
 */
export const ConfirmationModal: FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = false,
}) => {
    // If the modal is not open, render nothing.
    if (!isOpen) {
        return null;
    }

    // Determine the class for the confirmation button based on the isDanger prop.
    const confirmButtonClass = `button ${isDanger ? 'button--danger' : 'button--primary'}`;

    return (
        // The modal-overlay is the semi-transparent background.
        // We stop propagation on the modal itself to prevent clicks inside it from closing it.
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">{title}</h2>
                    <button onClick={onClose} className="modal__close-button">
                        &times;
                    </button>
                </div>
                <div className="modal__content">{children}</div>
                <div className="modal__footer">
                    <button onClick={onClose} className="button">
                        {cancelText}
                    </button>
                    <button onClick={onConfirm} className={confirmButtonClass}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
