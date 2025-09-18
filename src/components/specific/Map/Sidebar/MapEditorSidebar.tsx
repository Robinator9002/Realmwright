// src/components/specific/Map/Sidebar/MapEditorSidebar.tsx

import { useRef, type FC, useEffect } from 'react';
import { Eye, EyeOff, PlusCircle, Trash2 } from 'lucide-react';
import { useMapEditor } from '../../../../context/feature/MapEditorContext';
import { useModal } from '../../../../context/global/ModalContext';
import type { MapLayer } from '../../../../db/types';
// NEW: Import the panel we're about to use
import { SelectedItemPanel } from './SelectedItemPanel';

/**
 * The main sidebar component for the Map Editor.
 * It contains various panels for managing map properties, layers, and selected elements.
 */
export const MapEditorSidebar: FC = () => {
    const { currentMap, updateMap, updateLayers, activeLayerId, setActiveLayerId } = useMapEditor();
    const { showModal } = useModal();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!activeLayerId && currentMap.layers.length > 0) {
            setActiveLayerId(currentMap.layers[currentMap.layers.length - 1].id);
        }
        if (activeLayerId && !currentMap.layers.find((l) => l.id === activeLayerId)) {
            setActiveLayerId(null);
        }
    }, [currentMap.layers, activeLayerId, setActiveLayerId]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const imageDataUrl = loadEvent.target?.result as string;
            updateMap({ imageDataUrl });
        };
        reader.readAsDataURL(file);
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleAddLayer = () => {
        const newLayer: MapLayer = {
            id: crypto.randomUUID(),
            name: `New Layer ${currentMap.layers.length + 1}`,
            type: 'location',
            isVisible: true,
            objects: [],
        };
        const newLayers = [...currentMap.layers, newLayer];
        updateLayers(newLayers);
        setActiveLayerId(newLayer.id);
    };

    const handleDeleteLayer = (layerId: string) => {
        showModal({
            type: 'confirmation',
            title: 'Delete Layer?',
            message:
                'Are you sure you want to delete this layer and all objects on it? This action cannot be undone.',
            isDanger: true,
            onConfirm: () => {
                const newLayers = currentMap.layers.filter((l) => l.id !== layerId);
                updateLayers(newLayers);
            },
        });
    };

    const handleToggleVisibility = (layerId: string) => {
        const newLayers = currentMap.layers.map((l) =>
            l.id === layerId ? { ...l, isVisible: !l.isVisible } : l,
        );
        updateLayers(newLayers);
    };

    return (
        <aside className="map-editor-sidebar">
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
                    <p>Map name: {currentMap.name}</p>
                    <p className="panel__item-description">{currentMap.description}</p>
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
                <div className="panel__header-actions">
                    <h3 className="panel__title" style={{ border: 'none', padding: 0 }}>
                        Layers
                    </h3>
                    <button onClick={handleAddLayer} className="button">
                        <PlusCircle size={16} /> Add Layer
                    </button>
                </div>
                <div className="panel__content">
                    {currentMap.layers.length > 0 ? (
                        <ul className="layer-list">
                            {[...currentMap.layers].reverse().map((layer) => (
                                <li
                                    key={layer.id}
                                    onClick={() => setActiveLayerId(layer.id)}
                                    className={`layer-list__item ${
                                        !layer.isVisible ? 'layer-list__item--hidden' : ''
                                    } ${
                                        activeLayerId === layer.id ? 'layer-list__item--active' : ''
                                    }`}
                                >
                                    <span className="layer-list__item-name">{layer.name}</span>
                                    <div className="layer-list__item-actions">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleVisibility(layer.id);
                                            }}
                                            className="button"
                                            aria-label={
                                                layer.isVisible ? 'Hide layer' : 'Show layer'
                                            }
                                        >
                                            {layer.isVisible ? (
                                                <Eye size={16} />
                                            ) : (
                                                <EyeOff size={16} />
                                            )}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteLayer(layer.id);
                                            }}
                                            className="button"
                                            aria-label="Delete layer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="panel__empty-message">No layers yet. Add one to begin!</p>
                    )}
                </div>
            </div>

            {/* REWORK: Replace the placeholder with our intelligent component */}
            <SelectedItemPanel />
        </aside>
    );
};
