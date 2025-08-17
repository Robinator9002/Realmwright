// src/context/SettingsContext.tsx
import { createContext, useState, useContext, useMemo, useEffect } from 'react';
import type { ReactNode, FC } from 'react';

// Define the available themes
type Theme = 'light' | 'dark';

// Define the shape of our context
interface SettingsContextType {
    theme: Theme;
    toggleTheme: () => void;
}

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Create the provider component
export const SettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
    // State to hold the current theme, defaulting to the user's system preference
    const [theme, setTheme] = useState<Theme>(() => {
        if (
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
        ) {
            return 'dark';
        }
        return 'light';
    });

    // Effect to apply the theme class to the root HTML element
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    // Function to toggle the theme
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // useMemo ensures the context value object is only recreated when theme changes
    const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

// Custom hook for easy consumption of the context
export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
