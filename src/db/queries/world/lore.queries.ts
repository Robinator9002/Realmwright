// src/db/queries/lore.queries.ts
import { db } from '../../db';
import type { LoreEntry } from '../../types';

/**
 * Adds a new Lore Entry to the database, linked to a specific World.
 * @param loreData - An object containing the new lore entry's details.
 * @returns The ID of the newly created lore entry.
 */
export async function addLoreEntry(loreData: {
    name: string;
    description: string;
    category: string;
    content: string;
    worldId: number;
}): Promise<number> {
    try {
        const newLoreEntry: LoreEntry = {
            ...loreData,
            createdAt: new Date(),
        };
        const id = await db.lore.add(newLoreEntry);
        return id;
    } catch (error) {
        console.error('Failed to add lore entry:', error);
        throw new Error('Could not add the new lore entry to the database.');
    }
}

/**
 * Retrieves all Lore Entries for a specific World, sorted by name (title).
 * @param worldId - The ID of the world whose lore is to be fetched.
 * @returns A promise that resolves to an array of LoreEntry objects.
 */
export async function getLoreForWorld(worldId: number): Promise<LoreEntry[]> {
    try {
        const entries = await db.lore.where('worldId').equals(worldId).sortBy('name');
        return entries;
    } catch (error) {
        console.error(`Failed to get lore for world ${worldId}:`, error);
        throw new Error('Could not retrieve lore entries from the database.');
    }
}

/**
 * Updates an existing Lore Entry in the database.
 * @param loreId - The ID of the lore entry to update.
 * @param updates - An object containing the fields to update.
 */
export async function updateLoreEntry(
    loreId: number,
    updates: { name: string; description: string; category: string; content: string },
): Promise<void> {
    try {
        await db.lore.update(loreId, updates);
    } catch (error) {
        console.error(`Failed to update lore entry ${loreId}:`, error);
        throw new Error('Could not update the lore entry in the database.');
    }
}

/**
 * Deletes a specific Lore Entry from the database.
 * @param loreId - The ID of the lore entry to delete.
 */
export async function deleteLoreEntry(loreId: number): Promise<void> {
    try {
        await db.lore.delete(loreId);
    } catch (error) {
        console.error(`Failed to delete lore entry ${loreId}:`, error);
        throw new Error('Could not delete the lore entry from the database.');
    }
}
