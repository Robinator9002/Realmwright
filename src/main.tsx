// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/main.css';
import { AppProviders } from './context/global/AppProviders.tsx';

// Get the root element from the HTML
const rootElement = document.getElementById('root')!;

// Create a root for the React application
const root = createRoot(rootElement);

// Render the application
root.render(
    <StrictMode>
        {/* By using our composite AppProviders component, this file remains clean
      and simple, regardless of how many global contexts we add in the future.
    */}
        <AppProviders>
            <App />
        </AppProviders>
    </StrictMode>,
);
