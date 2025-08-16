// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { WorldProvider } from './context/WorldContext.tsx';

// Get the root element from the HTML
const rootElement = document.getElementById('root')!;

// Create a root for the React application
const root = createRoot(rootElement);

// Render the application
root.render(
    <StrictMode>
        {/* By wrapping the entire App in the WorldProvider, every component
      inside App can now access the world context via the useWorld() hook.
    */}
        <WorldProvider>
            <App />
        </WorldProvider>
    </StrictMode>,
);
