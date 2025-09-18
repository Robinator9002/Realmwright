// src/components/specific/Map/Canvas/MapCanvas.tsx

import type { FC } from 'react';
import { useMapEditor } from '../../../../context/feature/MapEditorContext';

/**
 * The core visual component for rendering the map's content,
 * which is either a user-uploaded image or a blank, theme-aware canvas.
 */
export const MapCanvas: FC = () => {
    const { currentMap } = useMapEditor();

    // REWORK: Instead of conditionally rendering a prompt, we now
    // conditionally apply styles to a persistent content element.
    const hasImage = !!currentMap.imageDataUrl;

    const canvasContentStyle = hasImage
        ? { backgroundImage: `url(${currentMap.imageDataUrl})` }
        : {};

    const canvasContentClassName = `map-canvas__content ${
        !hasImage ? 'map-canvas__content--blank' : ''
    }`;

    return (
        <div className="map-canvas">
            <div className={canvasContentClassName} style={canvasContentStyle} />
        </div>
    );
};
