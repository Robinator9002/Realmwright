// src/components/layout/Topbar/TabButton.tsx
import type { FC, ReactNode } from 'react';

interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    children: ReactNode;
}

/**
 * A reusable button component for tab navigation within the Topbar.
 */
export const TabButton: FC<TabButtonProps> = ({ isActive, onClick, children }) => {
    // Base classes for all tabs
    const baseClasses = 'px-4 py-2 text-sm font-medium rounded-t-md transition-colors duration-200';

    // Classes for the active tab
    const activeClasses = 'bg-gray-800 text-white';

    // Classes for inactive tabs
    const inactiveClasses = 'text-gray-400 hover:bg-gray-700 hover:text-white';

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
            {children}
        </button>
    );
};
