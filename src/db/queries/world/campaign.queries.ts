// src/db/queries/world/campaign.queries.ts

import { db } from '../../db';
import type { Campaign } from '../../types';

/**
 * Adds a new Campaign to the database, linked to a specific World.
 * @param campaign - An object containing the campaign details.
 * @returns The ID of the newly created campaign.
 */
export async function addCampaign(campaign: {
    name: string;
    description: string;
    worldId: number;
}): Promise<number> {
    try {
        const newCampaign: Campaign = {
            ...campaign,
            status: 'planned',
            createdAt: new Date(),
        };
        const id = await db.campaigns.add(newCampaign);
        return id;
    } catch (error) {
        console.error('Failed to add campaign:', error);
        throw new Error('Could not add the new campaign to the database.');
    }
}

/**
 * Retrieves all Campaigns for a specific World, sorted by name.
 * @param worldId - The ID of the world whose campaigns are to be fetched.
 * @returns A promise that resolves to an array of Campaign objects.
 */
export async function getCampaignsForWorld(worldId: number): Promise<Campaign[]> {
    try {
        const campaigns = await db.campaigns.where('worldId').equals(worldId).sortBy('name');
        return campaigns;
    } catch (error) {
        console.error(`Failed to get campaigns for world ${worldId}:`, error);
        throw new Error('Could not retrieve campaigns from the database.');
    }
}

/**
 * Updates an existing Campaign in the database.
 * @param campaignId - The ID of the campaign to update.
 * @param updates - An object containing the fields to update (e.g., name, description).
 */
export async function updateCampaign(
    campaignId: number,
    updates: { name: string; description: string },
): Promise<void> {
    try {
        await db.campaigns.update(campaignId, updates);
    } catch (error) {
        console.error(`Failed to update campaign ${campaignId}:`, error);
        throw new Error('Could not update the campaign in the database.');
    }
}

/**
 * Deletes a specific Campaign from the database.
 * @param campaignId - The ID of the campaign to delete.
 */
export async function deleteCampaign(campaignId: number): Promise<void> {
    try {
        await db.campaigns.delete(campaignId);
    } catch (error) {
        console.error(`Failed to delete campaign ${campaignId}:`, error);
        throw new Error('Could not delete the campaign from the database.');
    }
}
