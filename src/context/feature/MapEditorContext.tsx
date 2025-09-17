// src/context/feature/MapEditorContext.tsx

import { createContext, useState, useContext, useMemo, type ReactNode, type FC } from 'react';
import type { Map } from '../../db/types';
import { updateMap as dbUpdateMap } from '../../db/queries/map/map.queries';

interface MapEditorContextType {
    currentMap: Map;
    updateMap: (mapData: Partial<Map>) => Promise<void>;
}

const MapEditorContext = createContext<MapEditorContextType | undefined>(undefined);

interface MapEditorProviderProps {
    children: ReactNode;
    initialMap: Map;
}

export const MapEditorProvider: FC<MapEditorProviderProps> = ({ children, initialMap }) => {
    const [currentMap, setCurrentMap] = useState<Map>(initialMap);

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
        }),
        [currentMap],
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
