// src/context/AppProviders.tsx
import type { FC, ReactNode } from 'react';
import { WorldProvider } from './WorldContext';
import { SettingsProvider } from './SettingsContext';
import { ViewProvider } from './ViewContext';

// This component composes all the context providers for the application.
// We add our new ViewProvider to the stack.

interface AppProvidersProps {
    children: ReactNode;
}

export const AppProviders: FC<AppProvidersProps> = ({ children }) => {
    return (
        <SettingsProvider>
            <WorldProvider>
                <ViewProvider>{children}</ViewProvider>
            </WorldProvider>
        </SettingsProvider>
    );
};
