// src/components/modal/ModalManager.tsx

import { useModal } from '../../context/global/ModalContext';
import { AlertModal } from './AlertModal';
import { ConfirmationModal } from './ConfirmationModal';
// NEW: Import our specialized modal component
import { LinkLocationModal } from '../specific/Map/Modal/LinkLocationModal';

/**
 * The central component responsible for rendering the currently active modal.
 * It listens to the ModalContext and displays the correct modal based on its state.
 */
export const ModalManager = () => {
    const { modalType, modalOptions, hideModal } = useModal();

    if (!modalType || !modalOptions) {
        return null;
    }

    const renderModal = () => {
        switch (modalType) {
            case 'alert':
                return (
                    <AlertModal isOpen={true} onClose={hideModal} title={modalOptions.title}>
                        {modalOptions.message}
                    </AlertModal>
                );
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
                        isDanger={modalOptions.isDanger}
                    >
                        {modalOptions.message}
                    </ConfirmationModal>
                );
            // NEW: Add the case for our new modal type
            case 'link-location':
                return (
                    <LinkLocationModal
                        isOpen={true}
                        onClose={hideModal}
                        // We need to assert the type of onConfirm here because the generic
                        // ModalOptions type doesn't know it expects a number. We will fix
                        // this in the next step by improving the context's type safety.
                        onConfirm={modalOptions.onConfirm as (locationId: number) => void}
                    />
                );
            default:
                return null;
        }
    };

    return <>{renderModal()}</>;
};
