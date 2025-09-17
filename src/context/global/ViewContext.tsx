// src/context/global/ViewContext.tsx

/**
 * COMMIT: feat(map-creator): add view state for Map Creator
 *
 * Rationale:
 * To integrate the new Map Creator feature, the global ViewContext must be
 * updated to recognize the new UI sections. This involves adding the new manager
 * tabs and defining the state for the full-page map editor view.
 *
 * Implementation Details:
 * - Added 'maps', 'locations', and 'quests' to the `WorldTab` type to
 * enable them as selectable tabs in the World Dashboard.
 * - Added 'map_editor' to the `MainView` type to define the new
 * full-page editor component.
 * - Introduced `editingMapId` and `setEditingMapId` to the context state
 * to track which map is being edited, mirroring the existing pattern for
 * other editors.
 */
import { createContext, useState, useContext, useMemo } from 'react';
import type { ReactNode, FC } from 'react';

// REWORK: Add 'class_sheet_editor' as a valid main view
export type MainView =
    | 'worlds'
    | 'world_dashboard'
    | 'settings'
    | 'character_sheet'
    | 'ability_tree_editor'
    | 'class_sheet_editor'
    | 'map_editor'; // NEW

// Define the available tabs within the world dashboard
export type WorldTab =
    | 'campaigns'
    | 'characters'
    | 'lore'
    | 'stats'
    | 'abilities'
    | 'classes'
    | 'maps' // NEW
    | 'locations' // NEW
    | 'quests'; // NEW

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

    // State to hold the ID of the ability tree we want to edit
    editingAbilityTreeId: number | null;
    setEditingAbilityTreeId: (id: number | null) => void;

    // NEW: State to hold the ID of the class we want to edit
    editingClassId: number | null;
    setEditingClassId: (id: number | null) => void;

    // NEW: State to hold the ID of the map we want to edit
    editingMapId: number | null;
    setEditingMapId: (id: number | null) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [currentView, setCurrentView] = useState<MainView>('worlds');
    const [activeWorldTab, setActiveWorldTab] = useState<WorldTab>('campaigns');
    const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('appearance');
    const [characterIdForSheet, setCharacterIdForSheet] = useState<number | null>(null);
    const [editingAbilityTreeId, setEditingAbilityTreeId] = useState<number | null>(null);
    const [editingClassId, setEditingClassId] = useState<number | null>(null);
    // NEW: Initialize the new state for the map editor
    const [editingMapId, setEditingMapId] = useState<number | null>(null);

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
            editingAbilityTreeId,
            setEditingAbilityTreeId,
            editingClassId,
            setEditingClassId,
            // NEW: Expose the new state and its setter
            editingMapId,
            setEditingMapId,
        }),
        [
            currentView,
            activeWorldTab,
            activeSettingsTab,
            characterIdForSheet,
            editingAbilityTreeId,
            editingClassId,
            editingMapId, // Add to dependency array
        ],
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
