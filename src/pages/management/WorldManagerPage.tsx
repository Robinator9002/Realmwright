// src/pages/management/WorldManagerPage.tsx

import { useState, useEffect } from 'react';
import { addWorld, getAllWorlds, updateWorld, deleteWorld } from '../../db/queries/world.queries';
import { useWorld } from '../../context/WorldContext';
import { useView } from '../../context/ViewContext';
import { useModal } from '../../context/ModalContext';
import type { World } from '../../db/types';
import { ManageModal } from '../../components/modal/ManageModal';
import { Settings } from 'lucide-react';

const WorldManagerPage = () => {
    const { selectWorld } = useWorld();
    const { setCurrentView } = useView();
    const { showModal } = useModal();

    const [worlds, setWorlds] = useState<World[]>([]);
    const [newWorldName, setNewWorldName] = useState('');
    const [newWorldDescription, setNewWorldDescription] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [managingWorld, setManagingWorld] = useState<World | null>(null);
    const isManageModalOpen = !!managingWorld;

    const fetchWorlds = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const allWorlds = await getAllWorlds();
            setWorlds(allWorlds);
        } catch (err) {
            setError('Failed to load worlds from the database.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorlds();
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newWorldName.trim()) {
            showModal('alert', { title: 'Invalid Input', message: 'World name cannot be empty.' });
            return;
        }
        try {
            await addWorld({ name: newWorldName, description: newWorldDescription });
            setNewWorldName('');
            setNewWorldDescription('');
            await fetchWorlds();
        } catch (err) {
            setError('Failed to save the new world.');
        }
    };

    const handleEnterWorld = (world: World) => {
        selectWorld(world);
        setCurrentView('world_dashboard');
    };

    // This function's signature `(updatedItem: World)` now perfectly matches
    // the generic `onSave` prop from our updated ManageModal. No changes needed.
    const handleSaveWorld = async (updatedItem: World) => {
        try {
            await updateWorld(updatedItem.id!, {
                name: updatedItem.name,
                description: updatedItem.description,
            });
            await fetchWorlds();
        } catch (err) {
            setError('Failed to update the world.');
        }
    };

    const handleDeleteWorld = (worldId: number) => {
        setManagingWorld(null);
        showModal('confirmation', {
            title: 'Delete World?',
            message: `Are you sure you want to delete this world? This action is permanent and will also delete all associated campaigns and characters.`,
            onConfirm: async () => {
                try {
                    await deleteWorld(worldId);
                    await fetchWorlds(); // Refresh the list
                } catch (err) {
                    setError('Failed to delete the world.');
                }
            },
        });
    };

    return (
        <>
            <div className="world-manager">
                <div className="world-manager__form-container">
                    <h2 className="world-manager__form-title">Create a New World</h2>
                    <form onSubmit={handleSubmit} className="form">
                        {/* Form content remains unchanged */}
                        <div className="form__group">
                            <label htmlFor="worldName" className="form__label">
                                World Name
                            </label>
                            <input
                                id="worldName"
                                type="text"
                                value={newWorldName}
                                onChange={(e) => setNewWorldName(e.target.value)}
                                className="form__input"
                                placeholder="e.g., The Broken Lands of Eldoria"
                            />
                        </div>
                        <div className="form__group">
                            <label htmlFor="worldDescription" className="form__label">
                                Description
                            </label>
                            <textarea
                                id="worldDescription"
                                value={newWorldDescription}
                                onChange={(e) => setNewWorldDescription(e.target.value)}
                                className="form__textarea"
                                rows={3}
                                placeholder="A brief summary of your world's core concept..."
                            />
                        </div>
                        <button type="submit" className="button button--primary">
                            Create World
                        </button>
                    </form>
                </div>

                <div className="world-manager__list-container">
                    <h2 className="world-manager__list-title">Your Worlds</h2>
                    {error && <p className="error-message">{error}</p>}
                    {isLoading ? (
                        <p>Loading worlds...</p>
                    ) : worlds.length > 0 ? (
                        <ul className="world-manager__list">
                            {worlds.map((world) => (
                                <li key={world.id} className="world-manager__list-item">
                                    <div className="world-manager__item-details">
                                        <h3 className="world-manager__item-title">{world.name}</h3>
                                        <p className="world-manager__item-description">
                                            {world.description}
                                        </p>
                                    </div>
                                    <div className="world-manager__item-actions">
                                        <button
                                            onClick={() => setManagingWorld(world)}
                                            className="button"
                                        >
                                            <Settings size={16} /> Manage
                                        </button>
                                        <button
                                            onClick={() => handleEnterWorld(world)}
                                            className="button button--success"
                                        >
                                            Enter World &rarr;
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="world-manager__empty-message">
                            You haven't created any worlds yet.
                        </p>
                    )}
                </div>
            </div>

            {/* REFACTOR: We now explicitly pass the generic type and the new itemType prop. */}
            <ManageModal<World>
                isOpen={isManageModalOpen}
                onClose={() => setManagingWorld(null)}
                item={managingWorld}
                onSave={handleSaveWorld}
                onDelete={handleDeleteWorld}
                itemType="World"
            />
        </>
    );
};

export default WorldManagerPage;
