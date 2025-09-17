// src/db/queries/map/location.queries.ts

import { db } from '../../db';
import type { Location } from '../../types';

// Omit 'id' and 'createdAt' for creation.
type LocationCreationData = Omit<Location, 'id' | 'createdAt'>;

/**
 * Adds a new Location to the database.
 * @param locationData - The data for the new location.
 * @returns The ID of the newly created location.
 */
export async function addLocation(locationData: LocationCreationData): Promise<number> {
    try {
        const newLocation: Omit<Location, 'id'> = {
            ...locationData,
            createdAt: new Date(),
        };
        const id = await db.locations.add(newLocation as Location);
        return id;
    } catch (error) {
        console.error('Failed to add location:', error);
        throw new Error('Could not add the new location to the database.');
    }
}

/**
 * Retrieves all Locations for a given World.
 * @param worldId - The ID of the world.
 * @returns A promise that resolves to an array of Location objects.
 */
export async function getLocationsForWorld(worldId: number): Promise<Location[]> {
    try {
        return await db.locations.where('worldId').equals(worldId).toArray();
    } catch (error) {
        console.error(`Failed to get locations for world ${worldId}:`, error);
        throw new Error('Could not retrieve locations from the database.');
    }
}

/**
 * Updates an existing Location in the database.
 * @param locationId - The ID of the location to update.
 * @param updates - An object containing the fields to update.
 */
export async function updateLocation(
    locationId: number,
    updates: Partial<Location>,
): Promise<void> {
    try {
        await db.locations.update(locationId, updates);
    } catch (error) {
        console.error(`Failed to update location ${locationId}:`, error);
        throw new Error('Could not update the location in the database.');
    }
}

/**
 * Deletes a Location from the database.
 * @param locationId - The ID of the location to delete.
 */
export async function deleteLocation(locationId: number): Promise<void> {
    try {
        await db.locations.delete(locationId);
    } catch (error) {
        console.error(`Failed to delete location ${locationId}:`, error);
        throw new Error('Could not delete the location from the database.');
    }
}
