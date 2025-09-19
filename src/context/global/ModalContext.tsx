// src/context/global/ModalContext.tsx

import { createContext, useState, useContext, useMemo } from 'react';
import type { ReactNode, FC } from 'react';

// Add 'link-quest' to the list of allowed modal types.
export type ModalType = 'alert' | 'confirmation' | 'link-location' | 'link-quest';

// --- Type Definitions for Modal Payloads ---

interface BaseModalOptions {
    title: string;
    message: string;
}

interface AlertOptions extends BaseModalOptions {
    type: 'alert';
}

interface ConfirmationOptions extends BaseModalOptions {
    type: 'confirmation';
    onConfirm: () => void;
    isDanger?: boolean;
}

interface LinkLocationOptions {
    type: 'link-location';
    onConfirm: (locationId: number) => void;
}

// NEW: Define the specific shape for our 'link-quest' modal payload.
interface LinkQuestOptions {
    type: 'link-quest';
    onConfirm: (questId: number) => void;
}

// Add the new options type to the discriminated union.
export type ModalPayload =
    | AlertOptions
    | ConfirmationOptions
    | LinkLocationOptions
    | LinkQuestOptions;

interface ModalContextType {
    modalType: ModalType | null;
    modalOptions: ModalPayload | null;
    showModal: (payload: ModalPayload) => void;
    hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [modalType, setModalType] = useState<ModalType | null>(null);
    const [modalOptions, setModalOptions] = useState<ModalPayload | null>(null);

    const showModal = (payload: ModalPayload) => {
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
