// src/components/specific/Map/MapManager.tsx

import { useState, useEffect, useCallback, type FC } from 'react';
import { Settings, PlusCircle, Trash2, Edit } from 'lucide-react';
import { useWorld } from '../../../context/feature/WorldContext';
import { useModal } from '../../../context/global/ModalContext';
import { useView } from '../../../context/global/ViewContext';
import { getMapsForWorld, deleteMap, addMap, updateMap } from '../../../db/queries/map/map.queries';
import type { Map } from '../../../db/types';
import { ManageMapModal, type MapSaveData } from './ManageMapModal';

export const MapManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();
    const { setCurrentView, setEditingMapId } = useView();

    const [maps, setMaps] = useState<Map[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [managingMap, setManagingMap] = useState<Map | null>(null);
    const isManageModalOpen = !!managingMap;

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

    const handleOpenCreateModal = () => {
        setManagingMap({} as Map);
    };

    const handleOpenEditModal = (map: Map) => {
        setManagingMap(map);
    };

    const handleOpenEditor = (map: Map) => {
        if (map.id) {
            setEditingMapId(map.id);
            setCurrentView('map_editor');
        }
    };

    const handleSaveMap = async (saveData: MapSaveData) => {
        if (!selectedWorld?.id) return;
        try {
            if (managingMap && managingMap.id) {
                await updateMap(managingMap.id, saveData);
            } else {
                // REWORK: Add the required `layers` property on creation
                await addMap({
                    ...saveData,
                    worldId: selectedWorld.id,
                    imageDataUrl: '',
                    gridSize: { width: 1000, height: 1000 },
                    layers: [], // Ensure new maps start with an empty layers array
                });
            }
            await fetchMaps();
        } catch (err) {
            setError('Failed to save map.');
        }
    };

    const handleDeleteMap = (map: Map) => {
        // REWORK: Update showModal to use the new payload object format
        showModal({
            type: 'confirmation',
            title: `Delete ${map.name}?`,
            message:
                'Are you sure you want to delete this map and all its data? This action is permanent.',
            isDanger: true,
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
                                            onClick={() => handleOpenEditModal(map)}
                                            className="button"
                                        >
                                            <Settings size={16} /> Details
                                        </button>
                                        <button
                                            onClick={() => handleOpenEditor(map)}
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
                        <p className="panel__empty-message">No maps defined for this world yet.</p>
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
