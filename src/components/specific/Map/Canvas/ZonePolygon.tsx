// src/components/specific/Map/Canvas/ZonePolygon.tsx

import type { FC } from 'react';
import type { Point } from '../../../../db/types';

interface ZonePolygonProps {
    points: Point[];
    isSelected?: boolean;
    onClick?: (event: React.MouseEvent) => void;
}

/**
 * A visual component that renders a semi-transparent polygon for a zone.
 */
export const ZonePolygon: FC<ZonePolygonProps> = ({ points, isSelected = false, onClick }) => {
    // We need to find the top-left corner of the polygon's bounding box
    // to position our SVG element correctly on the canvas.
    const minX = Math.min(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));

    // And we need the width and height for the SVG's dimensions.
    const maxX = Math.max(...points.map((p) => p.x));
    const maxY = Math.max(...points.map((p) => p.y));
    const width = maxX - minX;
    const height = maxY - minY;

    // The points for the SVG polygon need to be relative to the SVG's
    // top-left corner (minX, minY), not the whole map.
    const relativePoints = points.map((p) => ({
        x: p.x - minX,
        y: p.y - minY,
    }));

    // Convert the array of points into a string for the SVG attribute.
    const pointsString = relativePoints.map((p) => `${p.x},${p.y}`).join(' ');

    const polygonClassName = `zone-polygon ${isSelected ? 'zone-polygon--selected' : ''}`;

    // The SVG element is positioned absolutely on the map canvas.
    return (
        <svg
            className="zone-polygon-svg"
            style={{
                left: `${minX}px`,
                top: `${minY}px`,
                width: `${width}px`,
                height: `${height}px`,
            }}
            onClick={onClick}
        >
            <polygon points={pointsString} className={polygonClassName} />
        </svg>
    );
};
