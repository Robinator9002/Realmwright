// src/pages/WorldManager/WorldManagerPage.tsx
import React, { useState, useEffect } from 'react';
import { addWorld, getAllWorlds } from '../../db/queries';
import type { World } from '../../db/types';

/**
 * The main page for creating, viewing, and selecting Worlds.
 * This component handles user input for new worlds and displays the list of existing ones.
 */
const WorldManagerPage: React.FC = () => {
    // State for the list of worlds fetched from the database
    const [worlds, setWorlds] = useState<World[]>([]);
    // State for the input fields of the "Create New World" form
    const [newWorldName, setNewWorldName] = useState('');
    const [newWorldDescription, setNewWorldDescription] = useState('');
    // State to manage loading and error messages
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Function to fetch all worlds from the database and update the state
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

    // useEffect hook to run the fetchWorlds function once when the component mounts
    useEffect(() => {
        fetchWorlds();
    }, []); // The empty dependency array ensures this runs only once on mount

    // Handler for the form submission
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); // Prevent the default browser form submission
        if (!newWorldName.trim()) {
            alert('World name cannot be empty.'); // Simple validation
            return;
        }

        try {
            await addWorld({ name: newWorldName, description: newWorldDescription });
            // Reset form fields
            setNewWorldName('');
            setNewWorldDescription('');
            // Refresh the list of worlds to show the new one
            await fetchWorlds();
        } catch (err) {
            setError('Failed to save the new world.');
            console.error(err);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">Realmwright</h1>

            {/* Form for creating a new world */}
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
                <h2 className="text-2xl font-semibold mb-4">Create a New World</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="worldName"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            World Name
                        </label>
                        <input
                            id="worldName"
                            type="text"
                            value={newWorldName}
                            onChange={(e) => setNewWorldName(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="e.g., The Broken Lands of Eldoria"
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="worldDescription"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Description
                        </label>
                        <textarea
                            id="worldDescription"
                            value={newWorldDescription}
                            onChange={(e) => setNewWorldDescription(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            rows={3}
                            placeholder="A brief summary of your world's core concept..."
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold"
                    >
                        Create World
                    </button>
                </form>
            </div>

            {/* Section for displaying existing worlds */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Your Worlds</h2>
                {error && <p className="text-red-500">{error}</p>}
                {isLoading ? (
                    <p>Loading worlds...</p>
                ) : worlds.length > 0 ? (
                    <ul className="space-y-4">
                        {worlds.map((world) => (
                            <li key={world.id} className="bg-gray-800 p-4 rounded-lg">
                                <h3 className="text-xl font-bold">{world.name}</h3>
                                <p className="text-gray-400">{world.description}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">
                        You haven't created any worlds yet. Start by creating one above!
                    </p>
                )}
            </div>
        </div>
    );
};

export default WorldManagerPage;
