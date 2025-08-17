// src/App.tsx
import { AppLayout } from './components/layout/AppLayout/AppLayout';
import { useView } from './context/ViewContext';
import WorldManagerPage from './pages/WorldManager/WorldManagerPage';
import { WorldDashboardPage } from './pages/WorldDashboard/WorldDashboardPage';
import { SettingsPage } from './pages/SettingsPage/SettingsPage';

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
 * It sets up the main layout and renders the current view inside it.
 */
function App() {
    return (
        <AppLayout>
            <CurrentView />
        </AppLayout>
    );
}

export default App;
