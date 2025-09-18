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

// REWORK: Upgrade to a robust transactional delete
export async function deleteLocation(locationId: number): Promise<void> {
    try {
        await db.transaction('rw', db.locations, db.maps, async () => {
            // 1. Find the location to get its worldId
            const locationToDelete = await db.locations.get(locationId);
            if (!locationToDelete) return;

            // 2. Find all maps in the same world
            const worldMaps = await db.maps.where({ worldId: locationToDelete.worldId }).toArray();

            // 3. For each map, remove any objects linked to the location
            for (const map of worldMaps) {
                let wasModified = false;
                const newLayers = map.layers.map((layer) => {
                    const originalObjectCount = layer.objects.length;
                    const filteredObjects = layer.objects.filter(
                        (obj) => obj.locationId !== locationId,
                    );

                    if (filteredObjects.length < originalObjectCount) {
                        wasModified = true;
                    }

                    return { ...layer, objects: filteredObjects };
                });

                // 4. If the map was changed, update it in the database
                if (wasModified) {
                    await db.maps.update(map.id!, { layers: newLayers });
                }
            }

            // 5. Finally, delete the location itself
            await db.locations.delete(locationId);
        });
    } catch (error) {
        console.error(`Failed to delete location ${locationId} and unlink markers:`, error);
        throw new Error('Could not delete the location.');
    }
}
