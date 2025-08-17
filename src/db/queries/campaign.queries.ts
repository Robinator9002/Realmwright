// src/db/queries/campaign.queries.ts
import { db } from '../db';
import type { Campaign } from '../types';

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
            status: 'planned', // Default status for new campaigns
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
        // Use the 'where' clause on the 'worldId' index for an efficient query.
        const campaigns = await db.campaigns.where('worldId').equals(worldId).sortBy('name');
        return campaigns;
    } catch (error) {
        console.error(`Failed to get campaigns for world ${worldId}:`, error);
        throw new Error('Could not retrieve campaigns from the database.');
    }
}
