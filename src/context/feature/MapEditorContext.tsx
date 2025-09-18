// src/context/feature/MapEditorContext.tsx

import {
    createContext,
    useState,
    useContext,
    useMemo,
    useCallback,
    type ReactNode,
    type FC,
} from 'react';
import type { Map, MapLayer } from '../../db/types';
import { updateMap as dbUpdateMap } from '../../db/queries/map/map.queries';

export interface Viewport {
    pan: { x: number; y: number };
    zoom: number;
}

interface MapEditorContextType {
    currentMap: Map;
    updateMap: (mapData: Partial<Map>) => Promise<void>;
    viewport: Viewport;
    setViewport: React.Dispatch<React.SetStateAction<Viewport>>;
    // NEW: Expose a dedicated function for updating layers
    updateLayers: (layers: MapLayer[]) => Promise<void>;
}

const MapEditorContext = createContext<MapEditorContextType | undefined>(undefined);

interface MapEditorProviderProps {
    children: ReactNode;
    initialMap: Map;
}

export const MapEditorProvider: FC<MapEditorProviderProps> = ({ children, initialMap }) => {
    const [currentMap, setCurrentMap] = useState<Map>(initialMap);
    const [viewport, setViewport] = useState<Viewport>({
        pan: { x: 0, y: 0 },
        zoom: 1,
    });

    // This is a general-purpose function to update any top-level property of the map
    const updateMap = useCallback(
        async (mapData: Partial<Map>) => {
            try {
                // Optimistically update the local state for a responsive UI
                const updatedMapData = { ...currentMap, ...mapData };
                setCurrentMap(updatedMapData);
                // Persist the changes to the database
                await dbUpdateMap(currentMap.id!, mapData);
            } catch (error) {
                console.error('Failed to update map:', error);
                // NOTE: In a real app, we might want to revert the optimistic update here
            }
        },
        [currentMap],
    );

    // NEW: This is a specific helper function for updating the layers array
    const updateLayers = useCallback(
        async (layers: MapLayer[]) => {
            // We use the more general updateMap function to handle the actual update logic
            await updateMap({ layers });
        },
        [updateMap],
    );

    const value = useMemo(
        () => ({
            currentMap,
            updateMap,
            viewport,
            setViewport,
            // NEW: Provide the new function to consuming components
            updateLayers,
        }),
        [currentMap, viewport, updateMap, updateLayers],
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
