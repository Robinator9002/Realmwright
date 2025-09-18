// src/context/global/ModalContext.tsx

import { createContext, useState, useContext, useMemo } from 'react';
import type { ReactNode, FC } from 'react';

// Define the types of modals we can show
type ModalType = 'alert' | 'confirmation';

// Define the options for our modals
interface ModalOptions {
    title: string;
    message: string;
    onConfirm?: () => void; // For confirmation modals
    isDanger?: boolean; // NEW: Optional flag for danger-style confirmation buttons
}

interface ModalContextType {
    modalType: ModalType | null;
    modalOptions: ModalOptions | null;
    showModal: (type: ModalType, options: ModalOptions) => void;
    hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [modalType, setModalType] = useState<ModalType | null>(null);
    const [modalOptions, setModalOptions] = useState<ModalOptions | null>(null);

    const showModal = (type: ModalType, options: ModalOptions) => {
        setModalType(type);
        setModalOptions(options);
    };

    const hideModal = () => {
        setModalType(null);
        setModalOptions(null);
    };

    const value = useMemo(
        () => ({
            modalType,
            modalOptions,
            showModal,
            hideModal,
        }),
        [modalType, modalOptions],
    );

    return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export const useModal = (): ModalContextType => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
