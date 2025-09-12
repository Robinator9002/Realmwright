// src/db/queries/stat.queries.ts
import { db } from '../../db';
import type { StatDefinition } from '../../types';

// A dedicated type for the creation payload to ensure `type` is included.
type CreateStatData = {
    name: string;
    description: string;
    abbreviation: string;
    defaultValue: number;
    worldId: number;
    type: 'primary' | 'derived' | 'resource';
};

/**
 * Adds a new Stat Definition to the database, linked to a specific World.
 * @param statData - An object containing the new stat's details.
 * @returns The ID of the newly created stat definition.
 */
export async function addStatDefinition(statData: CreateStatData): Promise<number> {
    try {
        const newStatDefinition: StatDefinition = {
            ...statData,
            createdAt: new Date(),
        };
        const id = await db.statDefinitions.add(newStatDefinition);
        return id;
    } catch (error) {
        console.error('Failed to add stat definition:', error);
        throw new Error('Could not add the new stat definition to the database.');
    }
}

/**
 * Retrieves all Stat Definitions for a specific World, sorted by name.
 * @param worldId - The ID of the world whose stats are to be fetched.
 * @returns A promise that resolves to an array of StatDefinition objects.
 */
export async function getStatDefinitionsForWorld(worldId: number): Promise<StatDefinition[]> {
    try {
        const stats = await db.statDefinitions.where('worldId').equals(worldId).sortBy('name');
        return stats;
    } catch (error) {
        console.error(`Failed to get stat definitions for world ${worldId}:`, error);
        throw new Error('Could not retrieve stat definitions from the database.');
    }
}

// A dedicated type for all updatable fields of a StatDefinition.
export type UpdateStatPayload = {
    name: string;
    description: string;
    abbreviation: string;
    defaultValue: number;
    type: 'primary' | 'derived' | 'resource';
};

/**
 * Updates an existing Stat Definition in the database.
 * @param statId - The ID of the stat definition to update.
 * @param updates - An object containing the fields to update.
 */
export async function updateStatDefinition(
    statId: number,
    updates: Partial<UpdateStatPayload>,
): Promise<void> {
    try {
        await db.statDefinitions.update(statId, updates);
    } catch (error) {
        console.error(`Failed to update stat definition ${statId}:`, error);
        throw new Error('Could not update the stat definition in the database.');
    }
}

/**
 * Deletes a specific Stat Definition from the database.
 * @param statId - The ID of the stat definition to delete.
 */
export async function deleteStatDefinition(statId: number): Promise<void> {
    try {
        await db.statDefinitions.delete(statId);
    } catch (error) {
        console.error(`Failed to delete stat definition ${statId}:`, error);
        throw new Error('Could not delete the stat definition from the database.');
    }
}
