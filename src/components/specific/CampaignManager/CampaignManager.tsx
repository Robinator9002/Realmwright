// src/components/specific/CampaignManager/CampaignManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { useWorld } from '../../../context/WorldContext';
import { addCampaign, getCampaignsForWorld } from '../../../db/queries/campaign.queries';
import type { Campaign } from '../../../db/types';

/**
 * A component dedicated to creating and listing campaigns for the currently active world.
 */
export const CampaignManager: FC = () => {
    const { selectedWorld } = useWorld();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [newCampaignName, setNewCampaignName] = useState('');
    const [newCampaignDescription, setNewCampaignDescription] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // We use useCallback to memoize this function, preventing unnecessary re-renders.
    const fetchCampaigns = useCallback(async () => {
        if (!selectedWorld) return;

        try {
            setError(null);
            setIsLoading(true);
            const worldCampaigns = await getCampaignsForWorld(selectedWorld.id!);
            setCampaigns(worldCampaigns);
        } catch (err) {
            setError('Failed to load campaigns.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedWorld]);

    // Fetch campaigns when the component mounts or when the selected world changes.
    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newCampaignName.trim() || !selectedWorld) {
            alert('Campaign name cannot be empty.');
            return;
        }

        try {
            await addCampaign({
                name: newCampaignName,
                description: newCampaignDescription,
                worldId: selectedWorld.id!,
            });
            setNewCampaignName('');
            setNewCampaignDescription('');
            await fetchCampaigns(); // Refresh the list
        } catch (err) {
            setError('Failed to save the new campaign.');
            console.error(err);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg mt-8">
            <h2 className="text-2xl font-semibold mb-4">Campaigns</h2>

            {/* Form for creating a new campaign */}
            <div className="bg-gray-900 p-4 rounded-md mb-6">
                <h3 className="text-xl font-semibold mb-3">Create New Campaign</h3>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label
                                htmlFor="campaignName"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Campaign Name
                            </label>
                            <input
                                id="campaignName"
                                type="text"
                                value={newCampaignName}
                                onChange={(e) => setNewCampaignName(e.target.value)}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                                placeholder="e.g., The Crimson Throne"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="campaignDescription"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Description
                            </label>
                            <input
                                id="campaignDescription"
                                type="text"
                                value={newCampaignDescription}
                                onChange={(e) => setNewCampaignDescription(e.target.value)}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                                placeholder="A short pitch for the campaign."
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold"
                    >
                        Create Campaign
                    </button>
                </form>
            </div>

            {/* List of existing campaigns */}
            <div>
                <h3 className="text-xl font-semibold mb-3">Existing Campaigns</h3>
                {error && <p className="text-red-500">{error}</p>}
                {isLoading ? (
                    <p>Loading campaigns...</p>
                ) : campaigns.length > 0 ? (
                    <ul className="space-y-3">
                        {campaigns.map((campaign) => (
                            <li
                                key={campaign.id}
                                className="bg-gray-700 p-3 rounded-md flex justify-between items-center"
                            >
                                <div>
                                    <h4 className="font-bold">{campaign.name}</h4>
                                    <p className="text-sm text-gray-400">{campaign.description}</p>
                                </div>
                                <span className="text-xs uppercase font-semibold bg-gray-600 px-2 py-1 rounded-full">
                                    {campaign.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">No campaigns created for this world yet.</p>
                )}
            </div>
        </div>
    );
};
