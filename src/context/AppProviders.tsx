// src/context/AppProviders.tsx
import type { FC, ReactNode } from 'react';
import { WorldProvider } from './WorldContext';
import { SettingsProvider } from './SettingsContext';

// This component composes all the context providers for the application.
// As we add more global contexts (like for authentication, notifications, etc.),
// we will add their providers here. This keeps main.tsx clean.

interface AppProvidersProps {
    children: ReactNode;
}

export const AppProviders: FC<AppProvidersProps> = ({ children }) => {
    return (
        // The order can matter. Providers that don't depend on others can be anywhere.
        // If one provider needed data from another, it would have to be nested inside it.
        <SettingsProvider>
            <WorldProvider>{children}</WorldProvider>
        </SettingsProvider>
    );
};
