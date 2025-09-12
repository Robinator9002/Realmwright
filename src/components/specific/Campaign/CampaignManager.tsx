// src/components/specific/CampaignManager/CampaignManager.tsx
import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { Settings } from 'lucide-react';
import { useWorld } from '../../../context/feature/WorldContext';
import { useModal } from '../../../context/global/ModalContext';
import {
    addCampaign,
    getCampaignsForWorld,
    updateCampaign,
    deleteCampaign,
} from '../../../db/queries/world/campaign.queries';
// REFACTOR: We no longer need to import World here.
import type { Campaign } from '../../../db/types';
import { ManageModal } from '../../modal/ManageModal';

// REFACTOR: This local type alias is no longer necessary.
// type ManageableItem = World | Campaign;

export const CampaignManager: FC = () => {
    const { selectedWorld } = useWorld();
    const { showModal } = useModal();

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [newCampaignName, setNewCampaignName] = useState('');
    const [newCampaignDescription, setNewCampaignDescription] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [managingCampaign, setManagingCampaign] = useState<Campaign | null>(null);
    const isManageModalOpen = !!managingCampaign;

    const fetchCampaigns = useCallback(async () => {
        if (!selectedWorld) return;
        try {
            setError(null);
            setIsLoading(true);
            const worldCampaigns = await getCampaignsForWorld(selectedWorld.id!);
            setCampaigns(worldCampaigns);
        } catch (err) {
            setError('Failed to load campaigns.');
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
            showModal('alert', {
                title: 'Invalid Input',
                message: 'Campaign name cannot be empty.',
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
        }
    };

    // --- Handlers for the ManageModal ---

    // REFACTOR: The `updatedItem` is now correctly typed as `Campaign` thanks to the generic modal.
    // We can safely remove the type assertion `as Campaign`.
    const handleSaveCampaign = async (updatedCampaign: Campaign) => {
        try {
            await updateCampaign(updatedCampaign.id!, {
                name: updatedCampaign.name,
                description: updatedCampaign.description,
            });
            await fetchCampaigns();
        } catch (err) {
            setError('Failed to update the campaign.');
        }
    };

    const handleDeleteCampaign = (campaignId: number) => {
        setManagingCampaign(null);
        showModal('confirmation', {
            title: 'Delete Campaign?',
            message: `Are you sure you want to delete this campaign? This action is permanent.`,
            onConfirm: async () => {
                try {
                    await deleteCampaign(campaignId);
                    await fetchCampaigns();
                } catch (err) {
                    setError('Failed to delete the campaign.');
                }
            },
        });
    };

    return (
        <>
            <div className="panel">
                <h2 className="panel__title">Campaigns</h2>

                <div className="panel__form-section">
                    {/* Form content remains unchanged */}
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
                                    <div className="panel__item-actions">
                                        <button
                                            onClick={() => setManagingCampaign(campaign)}
                                            className="button"
                                        >
                                            <Settings size={16} /> Manage
                                        </button>
                                        <span className="status-badge">{campaign.status}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="panel__empty-message">
                            No campaigns created for this world yet.
                        </p>
                    )}
                </div>
            </div>

            {/* REFACTOR: We now explicitly pass the generic type and the new itemType prop. */}
            <ManageModal<Campaign>
                isOpen={isManageModalOpen}
                onClose={() => setManagingCampaign(null)}
                item={managingCampaign}
                onSave={handleSaveCampaign}
                onDelete={handleDeleteCampaign}
                itemType="Campaign"
            />
        </>
    );
};
