// src/components/specific/Map/Canvas/ZonePolygon.tsx

import type { FC } from 'react';
import type { Point } from '../../../../db/types';

export interface ZonePolygonProps {
    points: Point[];
    isSelected?: boolean;
    onClick?: (event: React.MouseEvent) => void;
    // NEW: Add an optional color prop to the interface.
    color?: string;
}

/**
 * Renders a list of points as a filled, semi-transparent SVG polygon on the map.
 */
export const ZonePolygon: FC<ZonePolygonProps> = ({
    points,
    isSelected = false,
    onClick,
    // NEW: Destructure the color prop with a fallback.
    color,
}) => {
    // Convert the array of points into an SVG-compatible string format.
    const pointsString = points.map((p) => `${p.x},${p.y}`).join(' ');

    const polygonClassName = `zone-polygon ${isSelected ? 'zone-polygon--selected' : ''}`;

    return (
        <svg
            className="zone-polygon__container"
            // The onClick handler is attached to the SVG container.
            onClick={onClick}
        >
            <polygon
                points={pointsString}
                className={polygonClassName}
                // NEW: Apply the color prop as an inline style for the fill.
                // This allows the color to be dynamically changed from the sidebar.
                style={{ fill: color }}
            />
        </svg>
    );
};
