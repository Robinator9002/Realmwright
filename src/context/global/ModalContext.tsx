// src/context/global/ModalContext.tsx

import { createContext, useState, useContext, useMemo } from 'react';
import type { ReactNode, FC } from 'react';

// REWORK: Add our new modal type to the list of allowed types.
export type ModalType = 'alert' | 'confirmation' | 'link-location';

// --- Type Definitions for Modal Payloads ---

// Base interface for common properties
interface BaseModalOptions {
    title: string;
    message: string;
}

// Specific payload for the 'alert' modal
interface AlertOptions extends BaseModalOptions {
    type: 'alert';
}

// Specific payload for the 'confirmation' modal
interface ConfirmationOptions extends BaseModalOptions {
    type: 'confirmation';
    onConfirm: () => void;
    isDanger?: boolean;
}

// Specific payload for our new 'link-location' modal
interface LinkLocationOptions {
    type: 'link-location';
    onConfirm: (locationId: number) => void;
}

// REWORK: Create a discriminated union of all possible modal option shapes.
// This is the core of our type-safe refactor.
export type ModalPayload = AlertOptions | ConfirmationOptions | LinkLocationOptions;

interface ModalContextType {
    modalType: ModalType | null;
    modalOptions: ModalPayload | null;
    // REWORK: The showModal function is now much smarter and safer.
    showModal: (payload: ModalPayload) => void;
    hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [modalType, setModalType] = useState<ModalType | null>(null);
    const [modalOptions, setModalOptions] = useState<ModalPayload | null>(null);

    // REWORK: The function now accepts a single payload object.
    const showModal = (payload: ModalPayload) => {
        // The type is inferred directly from the payload object.
        setModalType(payload.type);
        setModalOptions(payload);
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
