// src/feature/global/WorldContext.tsx
import React, { createContext, useState, useContext, type ReactNode } from 'react';
import type { World } from '../../db/types';

// Define the shape of the context data.
// This includes the currently selected world and functions to change it.
interface WorldContextType {
    selectedWorld: World | null;
    selectWorld: (world: World) => void;
    clearWorld: () => void;
}

// Create the context with a default value of undefined.
// We will handle the 'undefined' case with a custom hook.
const WorldContext = createContext<WorldContextType | undefined>(undefined);

// Define the props for our provider component.
// It will wrap other components, so it needs to accept `children`.
interface WorldProviderProps {
    children: ReactNode;
}

/**
 * The WorldProvider component is responsible for managing the state
 * of the currently selected world and providing it to its children.
 */
export const WorldProvider: React.FC<WorldProviderProps> = ({ children }) => {
    const [selectedWorld, setSelectedWorld] = useState<World | null>(null);

    const selectWorld = (world: World) => {
        setSelectedWorld(world);
    };

    const clearWorld = () => {
        setSelectedWorld(null);
    };

    // The value object contains the state and the functions to modify it.
    const value = { selectedWorld, selectWorld, clearWorld };

    return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
};

/**
 * Custom hook for consuming the WorldContext.
 * This simplifies access to the context and adds a check to ensure
 * it's used within a WorldProvider.
 */
export const useWorld = (): WorldContextType => {
    const context = useContext(WorldContext);
    if (context === undefined) {
        throw new Error('useWorld must be used within a WorldProvider');
    }
    return context;
};
