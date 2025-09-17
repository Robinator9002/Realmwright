// src/pages/views/MapEditorPage.tsx

import { useState, useEffect, type FC } from 'react';
import type { Map } from '../../db/types';
import { getMapById } from '../../db/queries/map/map.queries';
import { MapCanvas } from '../../components/specific/Map/Canvas/MapCanvas';

/**
 * The inner component responsible for the editor's UI layout.
 * It receives the fully loaded map data and arranges the major UI blocks.
 */
const MapEditor: FC<{ map: Map; onClose: () => void }> = ({ map, onClose }) => {
    return (
        <div className="map-editor-page">
            <header className="map-editor-page__header">
                <button onClick={onClose} className="button">
                    &larr; Back to Map List
                </button>
                <h2 className="map-editor-page__title">Editing Map: {map.name}</h2>
            </header>
            <main className="map-editor-page__main">
                <MapCanvas map={map} />
            </main>
        </div>
    );
};

/**
 * The main page component for the Map Editor.
 * It's responsible for fetching the specific map's data based on the provided
 * mapId and managing the loading and error states.
 */
export const MapEditorPage: FC<{ mapId: number; onClose: () => void }> = ({ mapId, onClose }) => {
    const [map, setMap] = useState<Map | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMap = async () => {
            // Reset state on new ID
            setIsLoading(true);
            setError(null);
            try {
                const fetchedMap = await getMapById(mapId);
                if (fetchedMap) {
                    setMap(fetchedMap);
                } else {
                    setError(`Map with ID ${mapId} not found.`);
                }
            } catch (err) {
                setError('Failed to load the map.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMap();
    }, [mapId]);

    if (isLoading) {
        return <p>Loading Map Editor...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (!map) {
        return <p>Could not load map data.</p>;
    }

    // Once the map is loaded, render the actual editor UI component.
    return <MapEditor map={map} onClose={onClose} />;
};
