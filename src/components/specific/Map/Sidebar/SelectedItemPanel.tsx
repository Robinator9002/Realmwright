// src/components/specific/Map/Sidebar/SelectedItemPanel.tsx

import { useState, useEffect, type FC } from 'react';
import { useMapEditor } from '../../../../context/feature/MapEditorContext';
import { getLocationById } from '../../../../db/queries/map/location.queries';
import type { Location, MapObject } from '../../../../db/types';
import { Trash2 } from 'lucide-react';
import { useModal } from '../../../../context/global/ModalContext';

/**
 * A panel that displays the details of the currently selected map object.
 */
export const SelectedItemPanel: FC = () => {
    const { selectedObjectId, setSelectedObjectId, currentMap, updateLayers } = useMapEditor();
    const { showModal } = useModal();

    const [selectedObject, setSelectedObject] = useState<MapObject | null>(null);
    const [locationDetails, setLocationDetails] = useState<Location | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const findObject = () => {
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
        };
        findObject();
    }, [selectedObjectId, currentMap.layers]);

    useEffect(() => {
        const fetchLocationDetails = async () => {
            if (!selectedObject || !selectedObject.locationId) {
                setLocationDetails(null);
                return;
            }
            setIsLoading(true);
            const details = await getLocationById(selectedObject.locationId);
            setLocationDetails(details || null);
            setIsLoading(false);
        };
        fetchLocationDetails();
    }, [selectedObject]);

    const handleDeleteMarker = () => {
        if (!selectedObjectId) return;

        showModal({
            type: 'confirmation',
            title: 'Delete Marker?',
            message: 'Are you sure you want to permanently remove this marker from the map?',
            isDanger: true,
            onConfirm: () => {
                // Create a new layers array with the object removed
                const newLayers = currentMap.layers.map((layer) => ({
                    ...layer,
                    objects: layer.objects.filter((obj) => obj.id !== selectedObjectId),
                }));
                // Update the state
                updateLayers(newLayers);
                // Clear the selection
                setSelectedObjectId(null);
            },
        });
    };

    const renderContent = () => {
        if (!selectedObject) {
            return (
                <p className="panel__empty-message">Click an item on the map to see its details.</p>
            );
        }

        if (isLoading) {
            return <p>Loading details...</p>;
        }

        if (locationDetails) {
            return (
                <div className="selected-item-panel">
                    <h4 className="selected-item-panel__title">{locationDetails.name}</h4>
                    <p className="selected-item-panel__description">
                        {locationDetails.description}
                    </p>
                    <div className="selected-item-panel__actions">
                        <button onClick={handleDeleteMarker} className="button button--danger">
                            <Trash2 size={16} /> Delete Marker
                        </button>
                    </div>
                </div>
            );
        }

        return <p className="panel__empty-message">No location data linked to this marker.</p>;
    };

    return (
        <div className="panel">
            <h3 className="panel__title">Selected Item</h3>
            <div className="panel__content">{renderContent()}</div>
        </div>
    );
};
