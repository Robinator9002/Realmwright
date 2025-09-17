// src/db/queries/map/quest.queries.ts

import { db } from '../../db';
import type { Quest } from '../../types';

// Omit 'id' and 'createdAt' for creation.
type QuestCreationData = Omit<Quest, 'id' | 'createdAt'>;

/**
 * Adds a new Quest to the database.
 * @param questData - The data for the new quest.
 * @returns The ID of the newly created quest.
 */
export async function addQuest(questData: QuestCreationData): Promise<number> {
    try {
        const newQuest: Omit<Quest, 'id'> = {
            ...questData,
            createdAt: new Date(),
        };
        const id = await db.quests.add(newQuest as Quest);
        return id;
    } catch (error) {
        console.error('Failed to add quest:', error);
        throw new Error('Could not add the new quest to the database.');
    }
}

/**
 * Retrieves all Quests for a given World.
 * @param worldId - The ID of the world.
 * @returns A promise that resolves to an array of Quest objects.
 */
export async function getQuestsForWorld(worldId: number): Promise<Quest[]> {
    try {
        return await db.quests.where('worldId').equals(worldId).toArray();
    } catch (error) {
        console.error(`Failed to get quests for world ${worldId}:`, error);
        throw new Error('Could not retrieve quests from the database.');
    }
}

/**
 * Updates an existing Quest in the database.
 * @param questId - The ID of the quest to update.
 * @param updates - An object containing the fields to update.
 */
export async function updateQuest(questId: number, updates: Partial<Quest>): Promise<void> {
    try {
        await db.quests.update(questId, updates);
    } catch (error) {
        console.error(`Failed to update quest ${questId}:`, error);
        throw new Error('Could not update the quest in the database.');
    }
}

/**
 * Deletes a Quest from the database.
 * @param questId - The ID of the quest to delete.
 */
export async function deleteQuest(questId: number): Promise<void> {
    try {
        await db.quests.delete(questId);
    } catch (error) {
        console.error(`Failed to delete quest ${questId}:`, error);
        throw new Error('Could not delete the quest from the database.');
    }
}
