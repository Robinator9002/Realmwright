// src/App.tsx
import WorldManagerPage from './pages/WorldManager/WorldManagerPage';

/**
 * The root component of the Realmwright application.
 * * For now, it directly renders the WorldManagerPage.
 * In the future, this component will handle routing to display
 * different pages based on the application's state (e.g., if a world is selected).
 */
function App() {
    return (
        <main className="min-h-screen">
            {/* Currently, we only have one page, so we render it directly.
        Later, this will be replaced with a routing system.
      */}
            <WorldManagerPage />
        </main>
    );
}

export default App;
