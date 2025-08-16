// src/db/queries.ts
import { db } from './db';
import type { World } from './types';

/**
 * Contains all functions for interacting with the Realmwright database.
 * This provides a clean, typed API for our React components to use,
 * abstracting away the direct Dexie.js calls.
 */

// --- World Queries ---

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
        // The db.table.add() method returns the primary key of the new record.
        const id = await db.worlds.add(newWorld);
        return id;
    } catch (error) {
        console.error('Failed to add world:', error);
        // Re-throw the error to be handled by the calling UI component.
        throw new Error('Could not add the new world to the database.');
    }
}

/**
 * Retrieves all Worlds from the database, sorted by creation date (newest first).
 * @returns A promise that resolves to an array of World objects.
 */
export async function getAllWorlds(): Promise<World[]> {
    try {
        // The toArray() method executes the query and returns all matching records.
        const worlds = await db.worlds.orderBy('createdAt').reverse().toArray();
        return worlds;
    } catch (error) {
        console.error('Failed to get all worlds:', error);
        throw new Error('Could not retrieve worlds from the database.');
    }
}

// We will add more query functions for Campaigns, Characters, etc., here.
