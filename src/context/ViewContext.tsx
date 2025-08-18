// src/context/ViewContext.tsx
import { createContext, useState, useContext, useMemo } from 'react';
import type { ReactNode, FC } from 'react';

// Define the main views of the application
export type MainView = 'worlds' | 'world_dashboard' | 'settings';

// Define the available tabs within the world dashboard
// NEW: Add 'abilities' as a possible tab option.
export type WorldTab = 'campaigns' | 'characters' | 'lore' | 'rules' | 'abilities' | 'maps';

// Define the available tabs within the settings page
export type SettingsTab = 'appearance' | 'data';

interface ViewContextType {
    // State for the current main view
    currentView: MainView;
    setCurrentView: (view: MainView) => void;

    // State for the active tab in the world dashboard
    activeWorldTab: WorldTab;
    setActiveWorldTab: (tab: WorldTab) => void;

    // State for the active tab in the settings page
    activeSettingsTab: SettingsTab;
    setActiveSettingsTab: (tab: SettingsTab) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [currentView, setCurrentView] = useState<MainView>('worlds');
    const [activeWorldTab, setActiveWorldTab] = useState<WorldTab>('campaigns');
    const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('appearance');

    const value = useMemo(
        () => ({
            currentView,
            setCurrentView,
            activeWorldTab,
            setActiveWorldTab,
            activeSettingsTab,
            setActiveSettingsTab,
        }),
        [currentView, activeWorldTab, activeSettingsTab],
    );

    return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
};

export const useView = (): ViewContextType => {
    const context = useContext(ViewContext);
    if (context === undefined) {
        throw new Error('useView must be used within a ViewProvider');
    }
    return context;
};
