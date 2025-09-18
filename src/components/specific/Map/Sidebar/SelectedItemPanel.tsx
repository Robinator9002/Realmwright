// src/components/specific/Map/Sidebar/SelectedItemPanel.tsx

import { useState, useEffect, type FC } from 'react';
import { useMapEditor } from '../../../../context/feature/MapEditorContext';
import { getLocationById } from '../../../../db/queries/map/location.queries';
import type { Location, MapObject } from '../../../../db/types';
import { Trash2 } from 'lucide-react';

/**
 * A panel that displays the details of the currently selected map object.
 */
export const SelectedItemPanel: FC = () => {
    const { selectedObjectId, currentMap } = useMapEditor();
    const [selectedObject, setSelectedObject] = useState<MapObject | null>(null);
    const [locationDetails, setLocationDetails] = useState<Location | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Find the full MapObject from the ID
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
            setSelectedObject(null); // Not found
        };
        findObject();
    }, [selectedObjectId, currentMap.layers]);

    useEffect(() => {
        // Fetch the associated Location data when the object changes
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
                        <button className="button button--danger">
                            <Trash2 size={16} /> Delete Marker
                        </button>
                    </div>
                </div>
            );
        }

        // This case handles a selected object that somehow has no linked location data
        return <p className="panel__empty-message">No location data linked to this marker.</p>;
    };

    return (
        <div className="panel">
            <h3 className="panel__title">Selected Item</h3>
            <div className="panel__content">{renderContent()}</div>
        </div>
    );
};
