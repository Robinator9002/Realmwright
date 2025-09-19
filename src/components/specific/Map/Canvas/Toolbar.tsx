// src/components/specific/Map/Canvas/Toolbar.tsx

import type { FC } from 'react';
// Import a new icon for our drawing tool.
import { Move, MousePointerClick, MapPin, SquarePen } from 'lucide-react';
import { useMapEditor, type Tool } from '../../../../context/feature/MapEditorContext';

/**
 * A floating UI component with buttons to switch between editor tools.
 */
export const Toolbar: FC = () => {
    const { activeTool, setActiveTool } = useMapEditor();

    // Add the new 'draw-zone' tool to the list of available tools.
    const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
        { id: 'pan', label: 'Pan Tool', icon: <Move size={18} /> },
        { id: 'select', label: 'Select Tool', icon: <MousePointerClick size={18} /> },
        { id: 'add-location', label: 'Add Location', icon: <MapPin size={18} /> },
        { id: 'draw-zone', label: 'Draw Zone', icon: <SquarePen size={18} /> },
    ];

    return (
        <div className="toolbar">
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`button toolbar__button ${
                        activeTool === tool.id ? 'toolbar__button--active' : ''
                    }`}
                    aria-label={tool.label}
                    title={tool.label}
                >
                    {tool.icon}
                </button>
            ))}
        </div>
    );
};
