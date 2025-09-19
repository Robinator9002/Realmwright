// src/components/specific/Map/Sidebar/SelectedItemPanel.tsx

import { useState, useEffect, type FC } from 'react';
import { useMapEditor } from '../../../../context/feature/MapEditorContext';
import { getLocationById } from '../../../../db/queries/map/location.queries';
import type { Location, MapObject } from '../../../../db/types';
import { Trash2 } from 'lucide-react';
import { useModal } from '../../../../context/global/ModalContext';

/**
 * A panel that displays the details of the currently selected map object
 * and provides context-specific editing tools.
 */
export const SelectedItemPanel: FC = () => {
    const { selectedObjectId, setSelectedObjectId, currentMap, updateLayers } = useMapEditor();
    const { showModal } = useModal();

    const [selectedObject, setSelectedObject] = useState<MapObject | null>(null);

    // --- State for Marker Details ---
    const [locationDetails, setLocationDetails] = useState<Location | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- State for Zone Editing ---
    const [zoneName, setZoneName] = useState('');
    const [zoneColor, setZoneColor] = useState('#3b82f6'); // Default to accent color

    // Effect to find the selected object whenever the ID changes
    useEffect(() => {
        if (!selectedObjectId) {
            setSelectedObject(null);
            return;
        }
        for (const layer of currentMap.layers) {
            const found = layer.objects.find((obj) => obj.id === selectedObjectId);
            if (found) {
                setSelectedObject(found);
                return;
            }
        }
        setSelectedObject(null);
    }, [selectedObjectId, currentMap.layers]);

    // Effect to fetch linked data or set local form state based on the object type
    useEffect(() => {
        // Reset linked data on object change
        setLocationDetails(null);

        if (!selectedObject) return;

        // If it's a marker with a locationId, fetch the location details
        if (selectedObject.locationId) {
            const fetchLocationDetails = async () => {
                setIsLoading(true);
                const details = await getLocationById(selectedObject.locationId!);
                setLocationDetails(details || null);
                setIsLoading(false);
            };
            fetchLocationDetails();
        }

        // If it's a zone (has points), populate the form state
        if (selectedObject.points) {
            setZoneName(selectedObject.name || '');
            setZoneColor(selectedObject.color || '#3b82f6');
        }
    }, [selectedObject]);

    // Debounced effect to update the zone object in the database
    useEffect(() => {
        if (!selectedObject || !selectedObject.points) return;

        const handler = setTimeout(() => {
            // Avoid updating if the values haven't changed
            if (zoneName === selectedObject.name && zoneColor === selectedObject.color) {
                return;
            }

            const updatedObject = { ...selectedObject, name: zoneName, color: zoneColor };
            const newLayers = currentMap.layers.map((layer) => ({
                ...layer,
                objects: layer.objects.map((obj) =>
                    obj.id === selectedObjectId ? updatedObject : obj,
                ),
            }));
            updateLayers(newLayers);
        }, 500); // 500ms debounce delay

        return () => {
            clearTimeout(handler);
        };
    }, [zoneName, zoneColor, selectedObject, selectedObjectId, currentMap.layers, updateLayers]);

    const handleDeleteObject = () => {
        if (!selectedObjectId) return;

        showModal({
            type: 'confirmation',
            title: 'Delete Object?',
            message: 'Are you sure you want to permanently remove this object from the map?',
            isDanger: true,
            onConfirm: () => {
                const newLayers = currentMap.layers.map((layer) => ({
                    ...layer,
                    objects: layer.objects.filter((obj) => obj.id !== selectedObjectId),
                }));
                updateLayers(newLayers);
                setSelectedObjectId(null);
            },
        });
    };

    const renderMarkerDetails = () => {
        if (isLoading) return <p>Loading details...</p>;
        if (!locationDetails) {
            return <p className="panel__empty-message">No location data linked to this marker.</p>;
        }
        return (
            <div className="selected-item-panel">
                <h4 className="selected-item-panel__title">{locationDetails.name}</h4>
                <p className="selected-item-panel__description">{locationDetails.description}</p>
            </div>
        );
    };

    const renderZoneEditor = () => {
        return (
            <form className="form" onSubmit={(e) => e.preventDefault()}>
                <div className="form__group">
                    <label htmlFor="zoneName" className="form__label">
                        Zone Name
                    </label>
                    <input
                        id="zoneName"
                        type="text"
                        value={zoneName}
                        onChange={(e) => setZoneName(e.target.value)}
                        className="form__input"
                        placeholder="e.g., The Shadowfen"
                    />
                </div>
                <div className="form__group">
                    <label htmlFor="zoneColor" className="form__label">
                        Zone Color
                    </label>
                    <input
                        id="zoneColor"
                        type="color"
                        value={zoneColor}
                        onChange={(e) => setZoneColor(e.target.value)}
                        className="form__input"
                    />
                </div>
            </form>
        );
    };

    const renderContent = () => {
        if (!selectedObject) {
            return (
                <p className="panel__empty-message">Click an item on the map to see its details.</p>
            );
        }

        const isZone = !!selectedObject.points;

        return (
            <>
                {isZone ? renderZoneEditor() : renderMarkerDetails()}
                <div className="selected-item-panel__actions">
                    <button onClick={handleDeleteObject} className="button button--danger">
                        <Trash2 size={16} /> Delete {isZone ? 'Zone' : 'Marker'}
                    </button>
                </div>
            </>
        );
    };

    return (
        <div className="panel">
            <h3 className="panel__title">Selected Item</h3>
            <div className="panel__content">{renderContent()}</div>
        </div>
    );
};
