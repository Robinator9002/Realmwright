// src/components/specific/Map/Canvas/ViewportControls.tsx

import type { FC } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useMapEditor } from '../../../../context/feature/MapEditorContext';

// Define the same constants as in MapCanvas for consistency
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.1;

/**
 * A floating UI component with buttons to control the map's viewport (zoom and pan).
 */
export const ViewportControls: FC = () => {
    const { viewport, setViewport } = useMapEditor();

    const handleZoomIn = () => {
        // Increase zoom by 20%, respecting the max zoom limit
        const newZoom = Math.min(viewport.zoom * 1.2, MAX_ZOOM);
        setViewport((v) => ({ ...v, zoom: newZoom }));
    };

    const handleZoomOut = () => {
        // Decrease zoom by 20%, respecting the min zoom limit
        const newZoom = Math.max(viewport.zoom / 1.2, MIN_ZOOM);
        setViewport((v) => ({ ...v, zoom: newZoom }));
    };

    const handleResetView = () => {
        // Reset pan and zoom to their default state
        setViewport({ pan: { x: 0, y: 0 }, zoom: 1 });
    };

    return (
        <div className="viewport-controls">
            <button
                onClick={handleZoomIn}
                className="button viewport-controls__button"
                aria-label="Zoom In"
            >
                <ZoomIn size={18} />
            </button>
            <button
                onClick={handleZoomOut}
                className="button viewport-controls__button"
                aria-label="Zoom Out"
            >
                <ZoomOut size={18} />
            </button>
            <button
                onClick={handleResetView}
                className="button viewport-controls__button"
                aria-label="Reset View"
            >
                <Maximize size={18} />
            </button>
        </div>
    );
};
