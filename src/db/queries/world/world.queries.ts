// src/db/queries/world.queries.ts
import { db } from '../../db';
import type { World } from '../../types';

/**
 * Adds a new World to the database.
 * @param world - An object containing the name and description of the new world.
 * @returns The ID of the newly created world.
 */
export async function addWorld(world: { name: string; description: string }): Promise<number> {
    try {
        const newWorld: World = {
            ...world,
            createdAt: new Date(),
        };
        const id = await db.worlds.add(newWorld);
        return id;
    } catch (error) {
        console.error('Failed to add world:', error);
        throw new Error('Could not add the new world to the database.');
    }
}

/**
 * Retrieves all Worlds from the database, sorted by creation date (newest first).
 * @returns A promise that resolves to an array of World objects.
 */
export async function getAllWorlds(): Promise<World[]> {
    try {
        const worlds = await db.worlds.orderBy('createdAt').reverse().toArray();
        return worlds;
    } catch (error) {
        console.error('Failed to get all worlds:', error);
        throw new Error('Could not retrieve worlds from the database.');
    }
}

/**
 * Updates an existing World in the database.
 * @param worldId - The ID of the world to update.
 * @param updates - An object containing the fields to update (e.g., name, description).
 */
export async function updateWorld(
    worldId: number,
    updates: { name: string; description: string },
): Promise<void> {
    try {
        await db.worlds.update(worldId, updates);
    } catch (error) {
        console.error(`Failed to update world ${worldId}:`, error);
        throw new Error('Could not update the world in the database.');
    }
}

/**
 * Deletes a World and all its associated data (Campaigns, Characters) from the database.
 * This is a transactional operation to ensure data integrity.
 * @param worldId - The ID of the world to delete.
 */
export async function deleteWorld(worldId: number): Promise<void> {
    try {
        // Dexie's transaction block. If any operation inside fails, all are rolled back.
        await db.transaction('rw', db.worlds, db.campaigns, db.characters, async () => {
            // 1. Delete all campaigns belonging to this world.
            await db.campaigns.where('worldId').equals(worldId).delete();

            // 2. Delete all characters belonging to this world.
            await db.characters.where('worldId').equals(worldId).delete();

            // 3. Finally, delete the world itself.
            await db.worlds.delete(worldId);
        });
    } catch (error) {
        console.error(`Failed to delete world ${worldId} and its data:`, error);
        throw new Error('Could not delete the world from the database.');
    }
}
