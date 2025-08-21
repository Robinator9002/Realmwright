// src/context/ViewContext.tsx
import { createContext, useState, useContext, useMemo } from 'react';
import type { ReactNode, FC } from 'react';

// NEW: Add 'character_sheet' as a valid main view
export type MainView = 'worlds' | 'world_dashboard' | 'settings' | 'character_sheet';

// Define the available tabs within the world dashboard
export type WorldTab =
    | 'campaigns'
    | 'characters'
    | 'lore'
    | 'stats'
    | 'abilities'
    | 'classes'
    | 'maps';

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

    // NEW: State to hold the ID of the character whose sheet we want to view
    characterIdForSheet: number | null;
    setCharacterIdForSheet: (id: number | null) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [currentView, setCurrentView] = useState<MainView>('worlds');
    const [activeWorldTab, setActiveWorldTab] = useState<WorldTab>('campaigns');
    const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('appearance');
    // NEW: Initialize the new state
    const [characterIdForSheet, setCharacterIdForSheet] = useState<number | null>(null);

    const value = useMemo(
        () => ({
            currentView,
            setCurrentView,
            activeWorldTab,
            setActiveWorldTab,
            activeSettingsTab,
            setActiveSettingsTab,
            // NEW: Expose the new state and its setter
            characterIdForSheet,
            setCharacterIdForSheet,
        }),
        [currentView, activeWorldTab, activeSettingsTab, characterIdForSheet],
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
