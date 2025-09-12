// src/context/AppProviders.tsx
import type { FC, ReactNode } from 'react';
import { WorldProvider } from '../feature/WorldContext';
import { SettingsProvider } from './SettingsContext';
import { ViewProvider } from './ViewContext';
import { ModalProvider } from './ModalContext';

// This component composes all the context providers for the application.

interface AppProvidersProps {
    children: ReactNode;
}

export const AppProviders: FC<AppProvidersProps> = ({ children }) => {
    return (
        <SettingsProvider>
            <WorldProvider>
                <ViewProvider>
                    <ModalProvider>{children}</ModalProvider>
                </ViewProvider>
            </WorldProvider>
        </SettingsProvider>
    );
};
