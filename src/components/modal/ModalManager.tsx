// src/components/common/Modal/ModalManager.tsx
import type { FC } from 'react';
import { useModal } from '../../context/ModalContext';
import { ConfirmationModal } from './ConfirmationModal';
import { AlertModal } from './AlertModal';

/**
 * A global component that listens to the ModalContext and renders the
 * appropriate modal when triggered from anywhere in the application.
 */
export const ModalManager: FC = () => {
    const { modalType, modalOptions, hideModal } = useModal();

    if (!modalType || !modalOptions) {
        return null;
    }

    switch (modalType) {
        case 'confirmation':
            return (
                <ConfirmationModal
                    isOpen={true}
                    onClose={hideModal}
                    onConfirm={() => {
                        modalOptions.onConfirm?.();
                        hideModal();
                    }}
                    title={modalOptions.title}
                    isDanger={true}
                >
                    <p>{modalOptions.message}</p>
                </ConfirmationModal>
            );

        case 'alert':
            return (
                <AlertModal isOpen={true} onClose={hideModal} title={modalOptions.title}>
                    <p>{modalOptions.message}</p>
                </AlertModal>
            );

        default:
            return null;
    }
};
