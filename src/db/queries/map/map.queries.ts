// src/db/queries/map/map.queries.ts

import { db } from '../../db';
import type { Map } from '../../types';

// Omit 'id' and 'createdAt' for creation, as they are auto-generated.
type MapCreationData = Omit<Map, 'id' | 'createdAt'>;

/**
 * Adds a new Map to the database.
 * @param mapData - The data for the new map.
 * @returns The ID of the newly created map.
 */
export async function addMap(mapData: MapCreationData): Promise<number> {
    try {
        const newMap: Omit<Map, 'id'> = {
            ...mapData,
            createdAt: new Date(),
        };
        const id = await db.maps.add(newMap as Map);
        return id;
    } catch (error) {
        console.error('Failed to add map:', error);
        throw new Error('Could not add the new map to the database.');
    }
}

/**
 * Retrieves all Maps for a given World.
 * @param worldId - The ID of the world.
 * @returns A promise that resolves to an array of Map objects.
 */
export async function getMapsForWorld(worldId: number): Promise<Map[]> {
    try {
        return await db.maps.where('worldId').equals(worldId).toArray();
    } catch (error) {
        console.error(`Failed to get maps for world ${worldId}:`, error);
        throw new Error('Could not retrieve maps from the database.');
    }
}

/**
 * Updates an existing Map in the database.
 * @param mapId - The ID of the map to update.
 * @param updates - An object containing the fields to update.
 */
export async function updateMap(mapId: number, updates: Partial<Map>): Promise<void> {
    try {
        await db.maps.update(mapId, updates);
    } catch (error) {
        console.error(`Failed to update map ${mapId}:`, error);
        throw new Error('Could not update the map in the database.');
    }
}

/**
 * Deletes a Map from the database.
 * NOTE: This currently does not handle un-linking associated locations.
 * That logic will be added when the editor is built.
 * @param mapId - The ID of the map to delete.
 */
export async function deleteMap(mapId: number): Promise<void> {
    try {
        await db.maps.delete(mapId);
    } catch (error) {
        console.error(`Failed to delete map ${mapId}:`, error);
        throw new Error('Could not delete the map from the database.');
    }
}

/**
 * Retrieves a single Map by its ID.
 * @param mapId - The ID of the map to retrieve.
 * @returns A promise that resolves to the Map object, or undefined if not found.
 */
export async function getMapById(mapId: number): Promise<Map | undefined> {
    try {
        const map = await db.maps.get(mapId);
        return map;
    } catch (error) {
        console.error(`Failed to get map ${mapId}:`, error);
        throw new Error('Could not retrieve the map from the database.');
    }
}
