// src/pages/CampaignDashboard/CampaignDashboardPage.tsx
import type { FC } from 'react';
import { useWorld } from '../../context/WorldContext';
import { CampaignManager } from '../../components/specific/CampaignManager/CampaignManager';
import { CharacterManager } from '../../components/specific/CharacterManager/CharacterManager';

/**
 * The main dashboard for an active world.
 * This page serves as the central hub for managing campaigns, characters, lore, etc.,
 * for the currently selected world.
 */
const CampaignDashboardPage: FC = () => {
    const { selectedWorld, clearWorld } = useWorld();

    if (!selectedWorld) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">Error: No World Selected</h1>
                    <p className="mt-2 text-gray-400">
                        Please return to the world manager and select a world.
                    </p>
                    <button
                        onClick={clearWorld}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold">{selectedWorld.name}</h1>
                    <p className="text-lg text-gray-400 mt-1">{selectedWorld.description}</p>
                </div>
                <button
                    onClick={clearWorld}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md font-semibold"
                >
                    &larr; Exit World
                </button>
            </div>

            {/* Main Content Area - A grid layout for our manager components */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CampaignManager />
                <CharacterManager />
            </div>

            {/* In the future, other managers like LoreManager, etc., will be added here. */}
        </div>
    );
};

export default CampaignDashboardPage;
