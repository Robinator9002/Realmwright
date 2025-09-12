// src/App.tsx

/**
 * COMMIT: feat(class-sheet): integrate ClassSheetEditor into main app view
 *
 * Rationale:
 * To make the new ClassSheetEditor accessible, the main application's view
 * router (`CurrentView` component) needs to know how to render it. This
 * commit adds the necessary data fetching and rendering logic.
 *
 * Implementation Details:
 * - The `CurrentView` component now consumes `editingClassId` from the `useView` hook.
 * - A new `useEffect` has been added to fetch the full `CharacterClass` object
 * from the database whenever `editingClassId` is set.
 * - A new `case` for 'class_sheet_editor' has been added to the main switch
 * statement, which renders the `ClassSheetEditor` component with the fetched
 * data.
 * - This completes the top-level integration of the new editor page.
 */
import { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout/AppLayout';
import { useView } from './context/global/ViewContext';
import { getAbilityTreeById } from './db/queries/ability.queries';
// NEW: Import the query to fetch a class by its ID.
import { getClassById } from './db/queries/class.queries';
import type { AbilityTree, CharacterClass } from './db/types';

// Page Imports
import WorldManagerPage from './pages/management//WorldManagerPage';
import { WorldDashboardPage } from './pages/management//WorldDashboardPage';
import { SettingsPage } from './pages/management//SettingsPage';
import { ModalManager } from './components/modal/ModalManager';
import { CharacterSheetPage } from './pages/views/CharacterSheetPage';
import { AbilityTreeEditorPage } from './pages/views/AbilityTreeEditorPage';
// NEW: Import the ClassSheetEditor component itself.
import { ClassSheetEditor } from './components/specific/Class/ClassSheetEditor';

/**
 * This helper component is responsible for fetching data needed for specific
 * views and rendering the correct page or editor component.
 */
const CurrentView = () => {
    const {
        currentView,
        setCurrentView,
        editingAbilityTreeId,
        setEditingAbilityTreeId,
        // NEW: Consume the new state from the context.
        editingClassId,
        setEditingClassId,
    } = useView();

    // State for the loaded ability tree object for the editor
    const [treeToEdit, setTreeToEdit] = useState<AbilityTree | null>(null);
    const [isLoadingTree, setIsLoadingTree] = useState(false);

    // NEW: State to hold the fully loaded class object for the editor.
    const [classToEdit, setClassToEdit] = useState<CharacterClass | null>(null);
    const [isLoadingClass, setIsLoadingClass] = useState(false);

    // Effect for fetching the Ability Tree to edit
    useEffect(() => {
        if (currentView === 'ability_tree_editor' && editingAbilityTreeId) {
            setIsLoadingTree(true);
            getAbilityTreeById(editingAbilityTreeId).then((tree) => {
                if (tree) {
                    setTreeToEdit(tree);
                } else {
                    console.error(`Ability Tree with ID ${editingAbilityTreeId} not found.`);
                    setCurrentView('world_dashboard');
                    setEditingAbilityTreeId(null);
                }
                setIsLoadingTree(false);
            });
        } else {
            setTreeToEdit(null);
        }
    }, [currentView, editingAbilityTreeId, setCurrentView, setEditingAbilityTreeId]);

    // NEW: Effect for fetching the Character Class to edit.
    useEffect(() => {
        if (currentView === 'class_sheet_editor' && editingClassId) {
            setIsLoadingClass(true);
            getClassById(editingClassId).then((charClass: any) => {
                if (charClass) {
                    setClassToEdit(charClass);
                } else {
                    console.error(`Character Class with ID ${editingClassId} not found.`);
                    setCurrentView('world_dashboard');
                    setEditingClassId(null);
                }
                setIsLoadingClass(false);
            });
        } else {
            setClassToEdit(null);
        }
    }, [currentView, editingClassId, setCurrentView, setEditingClassId]);

    // The main view router for the application.
    switch (currentView) {
        case 'world_dashboard':
            return <WorldDashboardPage />;
        case 'settings':
            return <SettingsPage />;
        case 'character_sheet':
            return <CharacterSheetPage />;

        case 'ability_tree_editor':
            if (isLoadingTree || !treeToEdit) {
                return <p>Loading Editor...</p>;
            }
            return (
                <AbilityTreeEditorPage
                    tree={treeToEdit}
                    onClose={() => {
                        setCurrentView('world_dashboard');
                        setEditingAbilityTreeId(null);
                    }}
                />
            );

        // NEW: The case for rendering the class sheet editor.
        case 'class_sheet_editor':
            if (isLoadingClass || !classToEdit) {
                return <p>Loading Sheet Editor...</p>;
            }
            return (
                <ClassSheetEditor
                    characterClass={classToEdit}
                    onBack={() => {
                        setCurrentView('world_dashboard');
                        setEditingClassId(null);
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
