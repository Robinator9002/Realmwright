// src/pages/WorldManager/WorldManagerPage.tsx
import { useState, useEffect } from 'react';
import { addWorld, getAllWorlds } from '../../db/queries/world.queries';
import { useWorld } from '../../context/WorldContext';
import { useView } from '../../context/ViewContext';
import type { World } from '../../db/types';

const WorldManagerPage = () => {
    const { selectWorld } = useWorld();
    const { setCurrentView } = useView();

    const [worlds, setWorlds] = useState<World[]>([]);
    const [newWorldName, setNewWorldName] = useState('');
    const [newWorldDescription, setNewWorldDescription] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            alert('World name cannot be empty.');
            return;
        }

        try {
            await addWorld({ name: newWorldName, description: newWorldDescription });
            setNewWorldName('');
            setNewWorldDescription('');
            await fetchWorlds();
        } catch (err) {
            setError('Failed to save the new world.');
            console.error(err);
        }
    };

    const handleEnterWorld = (world: World) => {
        selectWorld(world);
        setCurrentView('world_dashboard');
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            {/* Form for creating a new world */}
            <div className="bg-panel-bg border border-border p-6 rounded-lg mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Create a New World</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="worldName"
                            className="block text-sm font-medium text-foreground/80 mb-1"
                        >
                            World Name
                        </label>
                        <input
                            id="worldName"
                            type="text"
                            value={newWorldName}
                            onChange={(e) => setNewWorldName(e.target.value)}
                            className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-accent focus:outline-none"
                            placeholder="e.g., The Broken Lands of Eldoria"
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="worldDescription"
                            className="block text-sm font-medium text-foreground/80 mb-1"
                        >
                            Description
                        </label>
                        <textarea
                            id="worldDescription"
                            value={newWorldDescription}
                            onChange={(e) => setNewWorldDescription(e.target.value)}
                            className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-accent focus:outline-none"
                            rows={3}
                            placeholder="A brief summary of your world's core concept..."
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-accent hover:opacity-90 rounded-md font-semibold text-white"
                    >
                        Create World
                    </button>
                </form>
            </div>

            {/* List of existing worlds */}
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Worlds</h2>
                {error && <p className="text-red-500">{error}</p>}
                {isLoading ? (
                    <p>Loading worlds...</p>
                ) : worlds.length > 0 ? (
                    <ul className="space-y-4">
                        {worlds.map((world) => (
                            <li
                                key={world.id}
                                className="bg-panel-bg border border-border p-4 rounded-lg flex justify-between items-center"
                            >
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">
                                        {world.name}
                                    </h3>
                                    <p className="text-foreground/70">{world.description}</p>
                                </div>
                                <button
                                    onClick={() => handleEnterWorld(world)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md font-semibold text-white"
                                >
                                    Enter World &rarr;
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-foreground/70">
                        You haven't created any worlds yet. Start by creating one above!
                    </p>
                )}
            </div>
        </div>
    );
};

export default WorldManagerPage;
