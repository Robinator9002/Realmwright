// src/components/specific/Map/MapManager.tsx

import { useState, useEffect, useCallback, type FC } from 'react';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { useWorld } from '../../../context/feature/WorldContext';
import { useModal } from '../../../context/global/ModalContext';
import { useView } from '../../../context/global/ViewContext';
import { getMapsForWorld, deleteMap, addMap, updateMap } from '../../../db/queries/map/map.queries';
import type { Map } from '../../../db/types';
import { ManageMapModal, type MapSaveData } from './ManageMapModal';

export const MapManager: FC = () => {
    // --- HOOKS ---
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();
    const { setCurrentView, setEditingMapId } = useView();

    // --- STATE ---
    const [maps, setMaps] = useState<Map[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for the "Manage Details" modal.
    const [managingMap, setManagingMap] = useState<Map | null>(null);
    const isManageModalOpen = !!managingMap;

    // --- DATA FETCHING ---
    const fetchMaps = useCallback(async () => {
        if (!selectedWorld?.id) return;
        try {
            setError(null);
            setIsLoading(true);
            const worldMaps = await getMapsForWorld(selectedWorld.id);
            setMaps(worldMaps);
        } catch (err) {
            setError('Failed to load maps.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedWorld]);

    useEffect(() => {
        fetchMaps();
    }, [fetchMaps]);

    // --- EVENT HANDLERS ---
    const handleOpenCreateModal = () => {
        setManagingMap({} as Map); // Open modal with a placeholder for creation
    };

    const handleOpenEditDetailsModal = (map: Map) => {
        setManagingMap(map);
    };

    const handleOpenMapEditor = (map: Map) => {
        if (map.id) {
            setEditingMapId(map.id);
            setCurrentView('map_editor');
        }
    };

    const handleSaveMap = async (saveData: MapSaveData) => {
        if (!selectedWorld?.id) return;
        try {
            if (managingMap && managingMap.id) {
                // Update existing map's name and description
                await updateMap(managingMap.id, {
                    name: saveData.name,
                    description: saveData.description,
                });
            } else {
                // Create new map with default values for required fields
                await addMap({
                    ...saveData,
                    worldId: selectedWorld.id,
                    imageDataUrl: '', // Default empty image
                    gridSize: { width: 100, height: 100 }, // Default grid size
                });
            }
            await fetchMaps();
        } catch (err) {
            setError('Failed to save map.');
        }
    };

    const handleDeleteMap = (map: Map) => {
        showModal('confirmation', {
            title: `Delete ${map.name}?`,
            message: 'Are you sure you want to delete this map? This cannot be undone.',
            onConfirm: async () => {
                try {
                    await deleteMap(map.id!);
                    await fetchMaps();
                } catch (err) {
                    setError('Failed to delete the map.');
                }
            },
        });
    };

    // --- JSX ---
    return (
        <>
            <div className="panel">
                <div className="panel__header-actions">
                    <h2 className="panel__title" style={{ border: 'none', padding: 0 }}>
                        World Maps
                    </h2>
                    <button onClick={handleOpenCreateModal} className="button button--primary">
                        <PlusCircle size={16} /> Create New Map
                    </button>
                </div>

                <div className="panel__list-section">
                    {error && <p className="error-message">{error}</p>}
                    {isLoading ? (
                        <p>Loading maps...</p>
                    ) : maps.length > 0 ? (
                        <ul className="panel__list">
                            {maps.map((map) => (
                                <li key={map.id} className="panel__list-item">
                                    <div className="panel__item-details">
                                        <h4 className="panel__item-title">{map.name}</h4>
                                        <p className="panel__item-description">{map.description}</p>
                                    </div>
                                    <div className="panel__item-actions">
                                        <button
                                            onClick={() => handleOpenEditDetailsModal(map)}
                                            className="button"
                                        >
                                            Details
                                        </button>
                                        <button
                                            onClick={() => handleOpenMapEditor(map)}
                                            className="button button--primary"
                                        >
                                            <Edit size={16} /> Open Editor
                                        </button>
                                        <button
                                            onClick={() => handleDeleteMap(map)}
                                            className="button button--danger"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="panel__empty-message">No maps created for this world yet.</p>
                    )}
                </div>
            </div>

            <ManageMapModal
                isOpen={isManageModalOpen}
                onClose={() => setManagingMap(null)}
                mapToEdit={managingMap}
                onSave={handleSaveMap}
            />
        </>
    );
};
