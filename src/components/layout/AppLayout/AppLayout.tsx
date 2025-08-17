// src/components/layout/AppLayout/AppLayout.tsx
import type { FC, ReactNode } from 'react';
import { Topbar } from '../Topbar/Topbar';

interface AppLayoutProps {
    children: ReactNode;
}

/**
 * The main layout component for the entire application.
 * It renders the persistent Topbar and a main content area
 * where the current page's content will be displayed.
 */
export const AppLayout: FC<AppLayoutProps> = ({ children }) => {
    return (
        // We replace all Tailwind classes with a single, semantic class name.
        <div className="app-layout">
            <Topbar />
            <main className="app-layout__content">{children}</main>
        </div>
    );
};
