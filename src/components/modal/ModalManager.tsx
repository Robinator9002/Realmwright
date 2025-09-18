// src/components/modal/ModalManager.tsx

import { useModal } from '../../context/global/ModalContext';
import { AlertModal } from './AlertModal';
import { ConfirmationModal } from './ConfirmationModal';
import { LinkLocationModal } from '../specific/Map/Modal/LinkLocationModal';

/**
 * The central component responsible for rendering the currently active modal.
 * It listens to the ModalContext and displays the correct modal based on its state.
 */
export const ModalManager = () => {
    // REWORK: We only need modalOptions and hideModal now.
    // The modalType is inferred from the options object.
    const { modalOptions, hideModal } = useModal();

    if (!modalOptions) {
        return null;
    }

    // REWORK: We now switch on the `type` property of the modalOptions object itself.
    // This allows TypeScript to correctly narrow the type of modalOptions in each case.
    switch (modalOptions.type) {
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
                        modalOptions.onConfirm();
                        hideModal();
                    }}
                    title={modalOptions.title}
                    isDanger={modalOptions.isDanger}
                >
                    {modalOptions.message}
                </ConfirmationModal>
            );
        case 'link-location':
            return (
                <LinkLocationModal
                    isOpen={true}
                    onClose={hideModal}
                    onConfirm={modalOptions.onConfirm}
                />
            );
        default:
            return null;
    }
};
