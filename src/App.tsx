// src/App.tsx
import { AppLayout } from './components/layout/AppLayout/AppLayout';
import { useView } from './context/ViewContext';
import WorldManagerPage from './pages/WorldManager/WorldManagerPage';
import { WorldDashboardPage } from './pages/WorldDashboard/WorldDashboardPage';
import { SettingsPage } from './pages/SettingsPage/SettingsPage';
import { ModalManager } from './components/common/Modal/ModalManager';

/**
 * A helper component to select which main page to render
 * based on the current view state.
 */
const CurrentView = () => {
    const { currentView } = useView();

    switch (currentView) {
        case 'world_dashboard':
            return <WorldDashboardPage />;
        case 'settings':
            return <SettingsPage />;
        case 'worlds':
        default:
            return <WorldManagerPage />;
    }
};

/**
 * The root component of the Realmwright application.
 * It sets up the main layout and renders the global ModalManager
 * as a sibling to the layout, ensuring it always appears on top.
 */
function App() {
    return (
        <>
            <AppLayout>
                <CurrentView />
            </AppLayout>
            {/* By placing ModalManager here, it exists in the root stacking context. */}
            <ModalManager />
        </>
    );
}

export default App;
