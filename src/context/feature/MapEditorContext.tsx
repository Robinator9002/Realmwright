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
// FIX: Correct the import path to properly resolve the queries file.
import { updateMap as dbUpdateMap } from '../../db/queries/map/map.queries';

export interface Viewport {
    pan: { x: number; y: number };
    zoom: number;
}

// Add 'add-quest' as a recognized tool type.
export type Tool = 'pan' | 'select' | 'add-location' | 'draw-zone' | 'add-quest';

interface MapEditorContextType {
    currentMap: Map;
    updateMap: (mapData: Partial<Map>) => Promise<void>;
    viewport: Viewport;
    setViewport: React.Dispatch<React.SetStateAction<Viewport>>;
    updateLayers: (layers: MapLayer[]) => Promise<void>;
    activeTool: Tool;
    setActiveTool: (tool: Tool) => void;
    activeLayerId: string | null;
    setActiveLayerId: (layerId: string | null) => void;
    selectedObjectId: string | null;
    setSelectedObjectId: (objectId: string | null) => void;
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
    const [activeTool, setActiveTool] = useState<Tool>('pan');
    const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

    const updateMap = useCallback(
        async (mapData: Partial<Map>) => {
            try {
                const updatedMapData = { ...currentMap, ...mapData };
                setCurrentMap(updatedMapData);
                await dbUpdateMap(currentMap.id!, mapData);
            } catch (error) {
                console.error('Failed to update map:', error);
            }
        },
        [currentMap],
    );

    const updateLayers = useCallback(
        async (layers: MapLayer[]) => {
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
            updateLayers,
            activeTool,
            setActiveTool,
            activeLayerId,
            setActiveLayerId,
            selectedObjectId,
            setSelectedObjectId,
        }),
        [
            currentMap,
            viewport,
            updateMap,
            updateLayers,
            activeTool,
            activeLayerId,
            selectedObjectId,
        ],
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
