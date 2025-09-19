// src/components/specific/Map/Canvas/QuestMarker.tsx

import type { FC } from 'react';
import { ScrollText } from 'lucide-react';

interface QuestMarkerProps {
    x: number;
    y: number;
    isSelected?: boolean;
    onClick?: (event: React.MouseEvent) => void;
}

/**
 * A visual component representing a single quest marker (scroll icon) on the map.
 */
export const QuestMarker: FC<QuestMarkerProps> = ({ x, y, isSelected = false, onClick }) => {
    // We use a BEM-style class naming convention. The block is 'quest-marker'.
    const markerClassName = `quest-marker ${isSelected ? 'quest-marker--selected' : ''}`;

    return (
        <div
            className={markerClassName}
            style={{
                // Position the marker absolutely on the canvas.
                left: `${x}px`,
                top: `${y}px`,
            }}
            onClick={onClick}
        >
            <ScrollText className="quest-marker__icon" />
        </div>
    );
};
