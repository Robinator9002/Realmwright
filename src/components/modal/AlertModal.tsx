// src/components/common/Modal/AlertModal.tsx
import type { FC, ReactNode } from 'react';

export interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

/**
 * A simple modal dialog for displaying informational messages.
 */
export const AlertModal: FC<AlertModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) {
        return null;
    }

    return (
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
                    <button onClick={onClose} className="button button--primary">
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};
