// src/components/specific/Map/Sidebar/MapEditorSidebar.tsx

import type { FC } from 'react';
import type { Map } from '../../../../db/types';

interface MapEditorSidebarProps {
    map: Map;
}

/**
 * The main sidebar component for the Map Editor.
 * It will contain various panels for managing map properties, layers, and selected elements.
 */
export const MapEditorSidebar: FC<MapEditorSidebarProps> = ({ map }) => {
    return (
        <aside className="map-editor-sidebar">
            <div className="panel">
                <h3 className="panel__title">Map Details</h3>
                <div className="panel__content">
                    {/* Placeholder for map name, description, and image upload */}
                    <p>Map name: {map.name}</p>
                    <p className="panel__item-description">{map.description}</p>
                    <button className="button button--primary" style={{ width: '100%' }}>
                        Upload Image
                    </button>
                </div>
            </div>
            <div className="panel">
                <h3 className="panel__title">Layers</h3>
                <div className="panel__content">
                    {/* Placeholder for layer controls (e.g., toggle visibility of zones, locations, quests) */}
                    <p className="panel__empty-message">Layer controls will appear here.</p>
                </div>
            </div>
            <div className="panel">
                <h3 className="panel__title">Selected Item</h3>
                <div className="panel__content">
                    {/* Placeholder for showing details of a selected location, zone, etc. */}
                    <p className="panel__empty-message">
                        Click an item on the map to see its details.
                    </p>
                </div>
            </div>
        </aside>
    );
};
