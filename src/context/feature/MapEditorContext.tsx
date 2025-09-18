// src/context/feature/MapEditorContext.tsx

import { createContext, useState, useContext, useMemo, type ReactNode, type FC } from 'react';
import type { Map } from '../../db/types';
import { updateMap as dbUpdateMap } from '../../db/queries/map/map.queries';

// NEW: Define the shape of our viewport state
export interface Viewport {
    pan: { x: number; y: number };
    zoom: number;
}

interface MapEditorContextType {
    currentMap: Map;
    updateMap: (mapData: Partial<Map>) => Promise<void>;
    // NEW: Expose viewport state and its setter
    viewport: Viewport;
    setViewport: React.Dispatch<React.SetStateAction<Viewport>>;
}

const MapEditorContext = createContext<MapEditorContextType | undefined>(undefined);

interface MapEditorProviderProps {
    children: ReactNode;
    initialMap: Map;
}

export const MapEditorProvider: FC<MapEditorProviderProps> = ({ children, initialMap }) => {
    const [currentMap, setCurrentMap] = useState<Map>(initialMap);
    // NEW: Initialize viewport state
    const [viewport, setViewport] = useState<Viewport>({
        pan: { x: 0, y: 0 },
        zoom: 1,
    });

    const updateMap = async (mapData: Partial<Map>) => {
        try {
            const updatedMapData = { ...currentMap, ...mapData };
            await dbUpdateMap(currentMap.id!, mapData);
            setCurrentMap(updatedMapData);
        } catch (error) {
            console.error('Failed to update map:', error);
            // Optionally, handle this error in the UI
        }
    };

    const value = useMemo(
        () => ({
            currentMap,
            updateMap,
            // NEW: Add viewport state to the context value
            viewport,
            setViewport,
        }),
        [currentMap, viewport], // NEW: Add viewport to dependency array
    );

    return <MapEditorContext.Provider value={value}>{children}</MapEditorContext.Provider>;
};

export const useMapEditor = (): MapEditorContextType => {
    const context = useContext(MapEditorContext);
    if (context === undefined) {
        throw new Error('useMapEditor must be used within a MapEditorProvider');
    }
    return context;
};
