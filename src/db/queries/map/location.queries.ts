// src/db/queries/map/location.queries.ts

import { db } from '../../db';
import type { Location } from '../../types';

export type LocationCreationData = Omit<Location, 'id' | 'createdAt'>;

export async function addLocation(locationData: LocationCreationData): Promise<number> {
    try {
        const newLocation: Location = {
            ...locationData,
            createdAt: new Date(),
        };
        const id = await db.locations.add(newLocation);
        return id;
    } catch (error) {
        console.error('Failed to add location:', error);
        throw new Error('Could not add the new location.');
    }
}

export async function getLocationsForWorld(worldId: number): Promise<Location[]> {
    try {
        const locations = await db.locations.where({ worldId }).toArray();
        return locations;
    } catch (error) {
        console.error('Failed to get locations for world:', error);
        throw new Error('Could not retrieve locations.');
    }
}

// NEW: Add a function to get a single location by its ID
export async function getLocationById(locationId: number): Promise<Location | undefined> {
    try {
        const location = await db.locations.get(locationId);
        return location;
    } catch (error) {
        console.error(`Failed to get location ${locationId}:`, error);
        throw new Error('Could not retrieve the location.');
    }
}

export async function updateLocation(
    locationId: number,
    updates: Partial<Location>,
): Promise<void> {
    try {
        await db.locations.update(locationId, updates);
    } catch (error) {
        console.error(`Failed to update location ${locationId}:`, error);
        throw new Error('Could not update the location.');
    }
}

export async function deleteLocation(locationId: number): Promise<void> {
    try {
        // In the future, we may need to also find and unlink all map objects
        // that point to this locationId. For now, a simple delete is fine.
        await db.locations.delete(locationId);
    } catch (error) {
        console.error(`Failed to delete location ${locationId}:`, error);
        throw new Error('Could not delete the location.');
    }
}
