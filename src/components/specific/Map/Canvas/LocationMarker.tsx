// src/components/specific/Map/Canvas/LocationMarker.tsx

import type { FC } from 'react';
import { MapPin } from 'lucide-react';

interface LocationMarkerProps {
    x: number;
    y: number;
    isSelected?: boolean;
    onClick?: (event: React.MouseEvent) => void; // NEW: Add onClick to the props interface
}

/**
 * A visual component representing a single location marker (pin) on the map.
 */
export const LocationMarker: FC<LocationMarkerProps> = ({
    x,
    y,
    isSelected = false,
    onClick, // NEW: Destructure the onClick prop
}) => {
    const markerClassName = `location-marker ${isSelected ? 'location-marker--selected' : ''}`;

    return (
        <div
            className={markerClassName}
            style={{
                left: `${x}px`,
                top: `${y}px`,
            }}
            onClick={onClick} // NEW: Attach the onClick handler
        >
            <MapPin className="location-marker__icon" />
        </div>
    );
};
