// src/components/specific/Map/Canvas/MapCanvas.tsx

import type { FC } from 'react';
import type { Map } from '../../../../db/types';

interface MapCanvasProps {
    map: Map;
}

/**
 * The core visual component for rendering the map image.
 * It displays the map's imageDataUrl as a background image.
 */
export const MapCanvas: FC<MapCanvasProps> = ({ map }) => {
    // If there's no image data, we render a prompt for the user.
    if (!map.imageDataUrl) {
        return (
            <div className="map-canvas map-canvas--empty">
                <div className="map-canvas__prompt">
                    <h2>This map has no image.</h2>
                    <p>Upload an image in the sidebar to begin building your world.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="map-canvas">
            <div
                className="map-canvas__image"
                style={{
                    backgroundImage: `url(${map.imageDataUrl})`,
                    // We will dynamically control width/height later for different map sizes
                }}
            />
        </div>
    );
};
