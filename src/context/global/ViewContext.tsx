// src/context/global/ViewContext.tsx

/**
 * COMMIT: feat(class-sheet): add view state for ClassSheetEditor
 *
 * Rationale:
 * To properly integrate the new ClassSheetEditor as a full-page component,
 * the global ViewContext needs to be aware of it. This aligns the class
 * editing workflow with the existing patterns used by the Ability Tree and
 * Character Sheet views.
 *
 * Implementation Details:
 * - Added 'class_sheet_editor' to the `MainView` type definition.
 * - Introduced `editingClassId` and `setEditingClassId` to the context's
 * state and type definition. This will be used to track which class blueprint
 * is currently being designed.
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
    | 'class_sheet_editor'; // NEW

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

    // State to hold the ID of the ability tree we want to edit
    editingAbilityTreeId: number | null;
    setEditingAbilityTreeId: (id: number | null) => void;

    // NEW: State to hold the ID of the class we want to edit
    editingClassId: number | null;
    setEditingClassId: (id: number | null) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [currentView, setCurrentView] = useState<MainView>('worlds');
    const [activeWorldTab, setActiveWorldTab] = useState<WorldTab>('campaigns');
    const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('appearance');
    const [characterIdForSheet, setCharacterIdForSheet] = useState<number | null>(null);
    const [editingAbilityTreeId, setEditingAbilityTreeId] = useState<number | null>(null);
    // NEW: Initialize the new state for the class sheet editor
    const [editingClassId, setEditingClassId] = useState<number | null>(null);

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
            // NEW: Expose the new state and its setter
            editingClassId,
            setEditingClassId,
        }),
        [
            currentView,
            activeWorldTab,
            activeSettingsTab,
            characterIdForSheet,
            editingAbilityTreeId,
            editingClassId, // Add to dependency array
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
