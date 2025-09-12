// src/context/global/SettingsContext.tsx
import { createContext, useState, useContext, useMemo, useEffect } from 'react';
import type { ReactNode, FC } from 'react';

// Define our four specific themes
export type Theme = 'modern-dark' | 'modern-light' | 'ancient-dark' | 'ancient-light';

// Define the shape of our context
interface SettingsContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
    // State to hold the current theme, defaulting to 'modern-dark'.
    const [theme, setTheme] = useState<Theme>('modern-dark');

    // This effect is the core of our theme engine.
    // Whenever the `theme` state changes, it updates the `data-theme`
    // attribute on the root <html> element.
    useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute('data-theme', theme);
    }, [theme]);

    // The value object now provides the current theme and a function to set it.
    const value = useMemo(() => ({ theme, setTheme }), [theme]);

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

// The custom hook remains the same.
export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
