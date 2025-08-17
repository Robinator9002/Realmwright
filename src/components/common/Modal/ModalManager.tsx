// src/components/common/Modal/ModalManager.tsx
import type { FC } from 'react';
import { useModal } from '../../../context/ModalContext';
import { ConfirmationModal } from './ConfirmationModal';
// We will create AlertModal in the next step.
// import { AlertModal } from './AlertModal';

/**
 * A global component that listens to the ModalContext and renders the
 * appropriate modal when triggered from anywhere in the application.
 */
export const ModalManager: FC = () => {
    const { modalType, modalOptions, hideModal } = useModal();

    if (!modalType || !modalOptions) {
        return null;
    }

    // Here we can switch between different types of modals.
    // For now, we only have the confirmation modal.
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
                    isDanger={true} // We can expand options later
                >
                    <p>{modalOptions.message}</p>
                </ConfirmationModal>
            );

        // We will add the 'alert' case in the next step.
        // case 'alert':
        //   return (
        //     <AlertModal
        //       isOpen={true}
        //       onClose={hideModal}
        //       title={modalOptions.title}
        //     >
        //       <p>{modalOptions.message}</p>
        //     </AlertModal>
        //   );

        default:
            return null;
    }
};
