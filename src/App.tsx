// src/App.tsx
import { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout/AppLayout';
import { useView } from './context/ViewContext';
import { getAbilityTreeById } from './db/queries/ability.queries';
import type { AbilityTree } from './db/types';

import WorldManagerPage from './pages/WorldManager/WorldManagerPage';
import { WorldDashboardPage } from './pages/WorldDashboard/WorldDashboardPage';
import { SettingsPage } from './pages/SettingsPage/SettingsPage';
import { ModalManager } from './components/common/Modal/ModalManager';
import { CharacterSheetPage } from './pages/CharacterSheet/CharacterSheetPage';
// NEW: Import the AbilityTreeEditorPage
import { AbilityTreeEditorPage } from './pages/AbiltyTree/AbilityTreeEditorPage';

/**
 * REWORKED: This helper component is now responsible for fetching data needed
 * for specific views and rendering the correct page component.
 */
const CurrentView = () => {
    const {
        currentView,
        setCurrentView,
        editingAbilityTreeId,
        setEditingAbilityTreeId,
        // ... other context values
    } = useView();

    // NEW: State to hold the fully loaded ability tree object for the editor
    const [treeToEdit, setTreeToEdit] = useState<AbilityTree | null>(null);
    const [isLoadingTree, setIsLoadingTree] = useState(false);

    // NEW: This effect listens for a change in the ID of the tree to edit.
    // When it changes, it fetches the full tree data from the database.
    useEffect(() => {
        if (currentView === 'ability_tree_editor' && editingAbilityTreeId) {
            setIsLoadingTree(true);
            const fetchTree = async () => {
                const tree = await getAbilityTreeById(editingAbilityTreeId);
                if (tree) {
                    setTreeToEdit(tree);
                } else {
                    // Handle case where tree is not found (e.g., deleted in another tab)
                    console.error(`Ability Tree with ID ${editingAbilityTreeId} not found.`);
                    // Go back to the dashboard to avoid a broken state
                    setCurrentView('world_dashboard');
                    setEditingAbilityTreeId(null);
                }
                setIsLoadingTree(false);
            };
            fetchTree();
        } else {
            // Clean up when we navigate away from the editor
            setTreeToEdit(null);
        }
    }, [currentView, editingAbilityTreeId, setCurrentView, setEditingAbilityTreeId]);

    switch (currentView) {
        case 'world_dashboard':
            return <WorldDashboardPage />;
        case 'settings':
            return <SettingsPage />;
        case 'character_sheet':
            return <CharacterSheetPage />;

        // NEW: The case for rendering the ability tree editor.
        case 'ability_tree_editor':
            if (isLoadingTree || !treeToEdit) {
                return <p>Loading Editor...</p>; // Or a proper loading spinner component
            }
            return (
                <AbilityTreeEditorPage
                    tree={treeToEdit}
                    onClose={() => {
                        // When closing, reset the view state in the context
                        setCurrentView('world_dashboard');
                        setEditingAbilityTreeId(null);
                    }}
                />
            );

        case 'worlds':
        default:
            return <WorldManagerPage />;
    }
};

/**
 * The root component of the Realmwright application.
 * Its structure remains the same.
 */
function App() {
    return (
        <>
            <AppLayout>
                <CurrentView />
            </AppLayout>
            <ModalManager />
        </>
    );
}

export default App;
