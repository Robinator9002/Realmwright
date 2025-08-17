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
        <div className="min-h-screen flex flex-col bg-gray-900 text-white">
            <Topbar />
            <main className="flex-grow">
                {/* The children prop will be the active page component,
            which is determined by the logic in App.tsx */}
                {children}
            </main>
        </div>
    );
};
