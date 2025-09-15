// src/App.tsx

/**
 * COMMIT: refactor(app): move view-specific data fetching into page components
 *
 * Rationale:
 * The main App component was becoming a bottleneck, responsible for fetching
 * data for multiple, unrelated views (Ability Tree Editor, Class Sheet Editor).
 * This commit refactors the architecture to a more scalable, modular pattern
 * where each page-level component is responsible for its own data fetching.
 *
 * Implementation Details:
 * - The `CurrentView` component has been significantly simplified. All `useState`
 * and `useEffect` hooks related to fetching data for specific views have been removed.
 * - The component now simply renders the page components directly, passing in
 * the necessary IDs from the `useView` context.
 * - This change cleans up the root component, improves separation of concerns,
 * and makes the application easier to maintain, as all logic related to a
 * specific view is now co-located with that view's component.
 */
import { AppLayout } from './components/layout/AppLayout/AppLayout';
import { useView } from './context/global/ViewContext';

// Page Imports
import WorldManagerPage from './pages/management//WorldManagerPage';
import { WorldDashboardPage } from './pages/management//WorldDashboardPage';
import { SettingsPage } from './pages/management//SettingsPage';
import { ModalManager } from './components/modal/ModalManager';
import { CharacterSheetPage } from './pages/views/CharacterSheetPage';
import { AbilityTreeEditorPage } from './pages/views/AbilityTreeEditorPage';
import { ClassSheetEditor } from './components/specific/Class/editor/ClassSheetEditor';

/**
 * This helper component is responsible for rendering the correct page or
 * editor component based on the global view state.
 */
const CurrentView = () => {
    const {
        currentView,
        setCurrentView,
        editingAbilityTreeId,
        setEditingAbilityTreeId,
        editingClassId,
        setEditingClassId,
    } = useView();

    // The main view router for the application.
    switch (currentView) {
        case 'world_dashboard':
            return <WorldDashboardPage />;
        case 'settings':
            return <SettingsPage />;
        case 'character_sheet':
            return <CharacterSheetPage />;

        case 'ability_tree_editor':
            // The AbilityTreeEditorPage will now handle its own data fetching.
            return (
                <AbilityTreeEditorPage
                    treeId={editingAbilityTreeId!}
                    onClose={() => {
                        setCurrentView('world_dashboard');
                        setEditingAbilityTreeId(null);
                    }}
                />
            );

        case 'class_sheet_editor':
            // The ClassSheetEditor will now handle its own data fetching.
            return (
                <ClassSheetEditor
                    classId={editingClassId!}
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
