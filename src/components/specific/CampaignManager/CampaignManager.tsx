// src/components/specific/CampaignManager/CampaignManager.tsx
import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { useWorld } from '../../../context/WorldContext';
import { useModal } from '../../../context/ModalContext'; // 1. Import the hook
import { addCampaign, getCampaignsForWorld } from '../../../db/queries/campaign.queries';
import type { Campaign } from '../../../db/types';

/**
 * A component dedicated to creating and listing campaigns for the currently active world.
 */
export const CampaignManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal(); // 2. Get the showModal function
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [newCampaignName, setNewCampaignName] = useState('');
    const [newCampaignDescription, setNewCampaignDescription] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newCampaignName.trim() || !selectedWorld) {
            // 3. Replace the alert with our new modal system
            showModal('alert', {
                title: 'Invalid Input',
                message: 'Campaign name cannot be empty. Please provide a name for your campaign.',
            });
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
            await fetchCampaigns();
        } catch (err) {
            setError('Failed to save the new campaign.');
            console.error(err);
        }
    };

    return (
        <div className="panel">
            <h2 className="panel__title">Campaigns</h2>

            <div className="panel__form-section">
                <h3 className="panel__form-title">Create New Campaign</h3>
                <form onSubmit={handleSubmit} className="form">
                    <div className="form__group">
                        <label htmlFor="campaignName" className="form__label">
                            Campaign Name
                        </label>
                        <input
                            id="campaignName"
                            type="text"
                            value={newCampaignName}
                            onChange={(e) => setNewCampaignName(e.target.value)}
                            className="form__input"
                            placeholder="e.g., The Crimson Throne"
                        />
                    </div>
                    <div className="form__group">
                        <label htmlFor="campaignDescription" className="form__label">
                            Description
                        </label>
                        <input
                            id="campaignDescription"
                            type="text"
                            value={newCampaignDescription}
                            onChange={(e) => setNewCampaignDescription(e.target.value)}
                            className="form__input"
                            placeholder="A short pitch for the campaign."
                        />
                    </div>
                    <button type="submit" className="button button--primary">
                        Create Campaign
                    </button>
                </form>
            </div>

            <div className="panel__list-section">
                <h3 className="panel__list-title">Existing Campaigns</h3>
                {error && <p className="error-message">{error}</p>}
                {isLoading ? (
                    <p>Loading campaigns...</p>
                ) : campaigns.length > 0 ? (
                    <ul className="panel__list">
                        {campaigns.map((campaign) => (
                            <li key={campaign.id} className="panel__list-item">
                                <div className="panel__item-details">
                                    <h4 className="panel__item-title">{campaign.name}</h4>
                                    <p className="panel__item-description">
                                        {campaign.description}
                                    </p>
                                </div>
                                <span className="status-badge">{campaign.status}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="panel__empty-message">No campaigns created for this world yet.</p>
                )}
            </div>
        </div>
    );
};
