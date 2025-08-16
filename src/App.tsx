// src/App.tsx
import { useWorld } from './context/WorldContext';
import WorldManagerPage from './pages/WorldManager/WorldManagerPage';
import CampaignDashboardPage from './pages/CampaignDashboard/CampaignDashboardPage';

/**
 * The root component of the Realmwright application.
 * It acts as a simple conditional router based on the global state.
 * It checks if a world has been selected in the WorldContext and renders
 * the appropriate page.
 */
function App() {
    // Consume the WorldContext to get the currently selected world.
    const { selectedWorld } = useWorld();

    return (
        <main className="min-h-screen">
            {/*
        This is our basic routing logic.
        - If `selectedWorld` is null, the user is at the top level, so we show
          the page for managing and selecting worlds.
        - If `selectedWorld` has a value, the user has entered a world, so we
          show the main dashboard for that world.
      */}
            {selectedWorld ? <CampaignDashboardPage /> : <WorldManagerPage />}
        </main>
    );
}

export default App;
