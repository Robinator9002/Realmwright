// src/context/ViewContext.tsx
import { createContext, useState, useContext, useMemo } from 'react';
import type { ReactNode, FC } from 'react';

// REWORK: Add 'ability_tree_editor' as a valid main view
export type MainView =
    | 'worlds'
    | 'world_dashboard'
    | 'settings'
    | 'character_sheet'
    | 'ability_tree_editor';

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

    // State to hold the ID of the character whose sheet we want to view
    characterIdForSheet: number | null;
    setCharacterIdForSheet: (id: number | null) => void;

    // NEW: State to hold the ID of the ability tree we want to edit
    editingAbilityTreeId: number | null;
    setEditingAbilityTreeId: (id: number | null) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [currentView, setCurrentView] = useState<MainView>('worlds');
    const [activeWorldTab, setActiveWorldTab] = useState<WorldTab>('campaigns');
    const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('appearance');
    const [characterIdForSheet, setCharacterIdForSheet] = useState<number | null>(null);
    // NEW: Initialize the new state for the ability tree editor
    const [editingAbilityTreeId, setEditingAbilityTreeId] = useState<number | null>(null);

    const value = useMemo(
        () => ({
            currentView,
            setCurrentView,
            activeWorldTab,
            setActiveWorldTab,
            activeSettingsTab,
            setActiveSettingsTab,
            characterIdForSheet,
            setCharacterIdForSheet,
            // NEW: Expose the new state and its setter
            editingAbilityTreeId,
            setEditingAbilityTreeId,
        }),
        [currentView, activeWorldTab, activeSettingsTab, characterIdForSheet, editingAbilityTreeId],
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
