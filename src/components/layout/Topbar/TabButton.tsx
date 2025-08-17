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
    // We construct the className string conditionally.
    const className = `tab-button ${isActive ? 'tab-button--active' : ''}`;

    return (
        <button onClick={onClick} className={className}>
            {children}
        </button>
    );
};
