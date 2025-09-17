// src/pages/views/MapEditorPage.tsx

import { useState, useEffect, type FC } from 'react';
import type { Map } from '../../db/types';
import { getMapById } from '../../db/queries/map/map.queries';

// This is the inner component that will contain the actual editor UI.
// For now, it's a simple placeholder.
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
                <div className="map-editor-page__placeholder">
                    <p>Map Canvas and Sidebar will be rendered here.</p>
                </div>
            </main>
        </div>
    );
};

// This is the parent component, responsible for fetching the map data.
// It follows the same pattern as the AbilityTreeEditorPage.
export const MapEditorPage: FC<{ mapId: number; onClose: () => void }> = ({ mapId, onClose }) => {
    const [map, setMap] = useState<Map | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMap = async () => {
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

    // Once the map is loaded, render the actual editor component.
    return <MapEditor map={map} onClose={onClose} />;
};
