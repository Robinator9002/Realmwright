// src/components/specific/Map/Sidebar/MapEditorSidebar.tsx

import { useRef, type FC } from 'react';
// NEW: Import the context hook to get the current map and the update function
import { useMapEditor } from '../../../../context/feature/MapEditorContext';

/**
 * The main sidebar component for the Map Editor.
 * It contains various panels for managing map properties, layers, and selected elements.
 */
export const MapEditorSidebar: FC = () => {
    // NEW: Get the map and the update function from our context
    const { currentMap, updateMap } = useMapEditor();

    // NEW: Create a ref for our hidden file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    // NEW: Handler for when the user selects an image file
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Use FileReader to convert the image to a base64 data URL
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const imageDataUrl = loadEvent.target?.result as string;
            // Call the update function from our context to save the new image
            updateMap({ imageDataUrl });
        };
        reader.readAsDataURL(file);
    };

    // NEW: Handler to trigger the hidden file input
    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <aside className="map-editor-sidebar">
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/png, image/jpeg, image/webp"
                style={{ display: 'none' }}
            />

            <div className="panel">
                <h3 className="panel__title">Map Details</h3>
                <div className="panel__content">
                    {/* These details are now coming from the context */}
                    <p>Map name: {currentMap.name}</p>
                    <p className="panel__item-description">{currentMap.description}</p>
                    {/* This button now triggers our upload handler */}
                    <button
                        className="button button--primary"
                        style={{ width: '100%' }}
                        onClick={handleUploadButtonClick}
                    >
                        {currentMap.imageDataUrl ? 'Change Image' : 'Upload Image'}
                    </button>
                </div>
            </div>
            <div className="panel">
                <h3 className="panel__title">Layers</h3>
                <div className="panel__content">
                    <p className="panel__empty-message">Layer controls will appear here.</p>
                </div>
            </div>
            <div className="panel">
                <h3 className="panel__title">Selected Item</h3>
                <div className="panel__content">
                    <p className="panel__empty-message">
                        Click an item on the map to see its details.
                    </p>
                </div>
            </div>
        </aside>
    );
};
