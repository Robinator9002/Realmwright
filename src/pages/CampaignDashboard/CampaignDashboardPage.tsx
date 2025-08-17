// src/pages/CampaignDashboard/CampaignDashboardPage.tsx
import React from 'react';
import type { FC } from 'react';
import { useWorld } from '../../context/WorldContext';
import { CampaignManager } from '../../components/specific/CampaignManager/CampaignManager';

/**
 * The main dashboard for an active world.
 * This page serves as the central hub for managing campaigns, characters, lore, etc.,
 * for the currently selected world.
 */
const CampaignDashboardPage: FC = () => {
    // Consume the WorldContext to get the currently selected world and the function to clear it.
    const { selectedWorld, clearWorld } = useWorld();

    // A safeguard in case this page is rendered without a selected world.
    // Our routing in App.tsx should prevent this, but it's good practice.
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

            {/* Main Content Area */}
            {/*
        Here we render the CampaignManager component.
        This keeps our dashboard page clean and delegates all campaign-related
        functionality to the dedicated component.
      */}
            <CampaignManager />

            {/* In the future, other managers like CharacterManager, LoreManager, etc.,
        will be added here as well.
      */}
        </div>
    );
};

export default CampaignDashboardPage;
