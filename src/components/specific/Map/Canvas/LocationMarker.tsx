// src/components/specific/Map/Canvas/LocationMarker.tsx

import type { FC } from 'react';
import { MapPin } from 'lucide-react';

interface LocationMarkerProps {
    x: number;
    y: number;
    isSelected?: boolean;
}

/**
 * A visual component representing a single location marker (pin) on the map.
 */
export const LocationMarker: FC<LocationMarkerProps> = ({ x, y, isSelected = false }) => {
    const markerClassName = `location-marker ${isSelected ? 'location-marker--selected' : ''}`;

    return (
        <div
            className={markerClassName}
            style={{
                left: `${x}px`,
                top: `${y}px`,
            }}
        >
            <MapPin className="location-marker__icon" />
        </div>
    );
};
