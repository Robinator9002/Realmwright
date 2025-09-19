// src/components/specific/Location/LocationManager.tsx

import { useState, useEffect, useCallback, type FC } from 'react';
import { Settings, PlusCircle, Trash2 } from 'lucide-react';
import { useWorld } from '../../../context/feature/WorldContext';
import { useModal } from '../../../context/global/ModalContext';
import {
    getLocationsForWorld,
    deleteLocation,
    addLocation,
    updateLocation,
} from '../../../db/queries/map/location.queries';
import type { Location } from '../../../db/types';
import { ManageLocationModal, type LocationSaveData } from './ManageLocationModal';

/**
 * COMMIT: feat(location): implement full CRUD functionality for LocationManager
 *
 * Rationale:
 * This commit replaces the placeholder LocationManager with a fully featured
 * component for creating, reading, updating, and deleting Location entries.
 *
 * Implementation Details:
 * - Adopted the proven architectural pattern from MapManager for state
 * management, data fetching, and user interactions.
 * - Implemented state for the location list, loading status, and errors.
 * - Created a `fetchLocations` function that retrieves all locations
 * associated with the currently selected world.
 * - Integrated the new `ManageLocationModal` to handle the creation and
 * editing of location data.
 * - Wired up the `deleteLocation` query, protecting it with a confirmation
 * modal to prevent accidental data loss.
 * - The UI now displays a dynamic list of locations or an empty state
 * message, providing a complete user experience for location management.
 */
export const LocationManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();

    // State to hold the list of locations for the current world.
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State to manage the create/edit modal. When an object is present,
    // the modal will open. `{} as Location` is a trick for creation mode.
    const [managingLocation, setManagingLocation] = useState<Location | null>(null);
    const isManageModalOpen = !!managingLocation;

    // Fetches locations from the database for the selected world.
    // useCallback ensures the function reference is stable unless a dependency changes.
    const fetchLocations = useCallback(async () => {
        if (!selectedWorld?.id) return;
        try {
            setError(null);
            setIsLoading(true);
            const worldLocations = await getLocationsForWorld(selectedWorld.id);
            setLocations(worldLocations);
        } catch (err) {
            setError('Failed to load locations.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedWorld]);

    // Re-fetch locations whenever the selected world changes.
    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    const handleOpenCreateModal = () => {
        setManagingLocation({} as Location);
    };

    const handleOpenEditModal = (location: Location) => {
        setManagingLocation(location);
    };

    // Handles both creating new locations and updating existing ones.
    const handleSaveLocation = async (saveData: LocationSaveData) => {
        if (!selectedWorld?.id) return;
        try {
            // If the location object has an ID, we're editing.
            if (managingLocation && managingLocation.id) {
                await updateLocation(managingLocation.id, saveData);
            } else {
                // Otherwise, we're creating a new one.
                await addLocation({
                    ...saveData,
                    worldId: selectedWorld.id,
                });
            }
            await fetchLocations(); // Refresh the list after saving.
        } catch (err) {
            setError('Failed to save location.');
        }
    };

    const handleDeleteLocation = (location: Location) => {
        showModal({
            type: 'confirmation',
            title: `Delete ${location.name}?`,
            message:
                'Are you sure you want to delete this location? This will also remove any markers linked to it on all maps. This action is permanent.',
            isDanger: true,

            onConfirm: async () => {
                try {
                    await deleteLocation(location.id!);
                    await fetchLocations(); // Refresh the list.
                } catch (err) {
                    setError('Failed to delete the location.');
                }
            },
        });
    };

    return (
        <>
            <div className="panel">
                <div className="panel__header-actions">
                    <h2 className="panel__title" style={{ border: 'none', padding: 0 }}>
                        World Locations
                    </h2>
                    <button onClick={handleOpenCreateModal} className="button button--primary">
                        <PlusCircle size={16} /> Create New Location
                    </button>
                </div>

                <div className="panel__list-section">
                    {error && <p className="error-message">{error}</p>}
                    {isLoading ? (
                        <p>Loading locations...</p>
                    ) : locations.length > 0 ? (
                        <ul className="panel__list">
                            {locations.map((location) => (
                                <li key={location.id} className="panel__list-item">
                                    <div className="panel__item-details">
                                        <h4 className="panel__item-title">{location.name}</h4>
                                        <p className="panel__item-description">
                                            {location.description}
                                        </p>
                                    </div>
                                    <div className="panel__item-actions">
                                        <button
                                            onClick={() => handleOpenEditModal(location)}
                                            className="button"
                                        >
                                            <Settings size={16} /> Details
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLocation(location)}
                                            className="button button--danger"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="panel__empty-message">
                            No locations defined for this world yet.
                        </p>
                    )}
                </div>
            </div>

            <ManageLocationModal
                isOpen={isManageModalOpen}
                onClose={() => setManagingLocation(null)}
                locationToEdit={managingLocation}
                onSave={handleSaveLocation}
            />
        </>
    );
};
