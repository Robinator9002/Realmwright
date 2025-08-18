// src/db/queries/character.queries.ts
import { db } from '../db';
import type { Character } from '../types';
// NEW: We need to get the stat definitions to create a new character.
import { getStatDefinitionsForWorld } from './rule.queries';

// This type remains the same, as stats are added automatically.
type CreateCharacterData = {
    name: string;
    description: string;
    type: 'PC' | 'NPC' | 'Enemy';
    worldId: number;
};

/**
 * Adds a new Character to the database, linked to a specific World.
 * REFACTOR: This function is now "stat-aware". It fetches all stat definitions
 * for the world and populates the new character's stat block with default values.
 * @param characterData - An object containing the character's details.
 * @returns The ID of the newly created character.
 */
export async function addCharacter(characterData: CreateCharacterData): Promise<number> {
    try {
        // 1. Fetch all stat definitions for the current world.
        const statDefinitions = await getStatDefinitionsForWorld(characterData.worldId);

        // 2. Create the initial stat block from the definitions.
        const initialStats: { [statId: number]: number } = {};
        for (const stat of statDefinitions) {
            // The key is the stat's ID, the value is its default.
            initialStats[stat.id!] = stat.defaultValue;
        }

        // 3. Create the new character object with the generated stat block.
        const newCharacter: Character = {
            ...characterData,
            campaignIds: [],
            stats: initialStats, // Add the populated stats object.
            createdAt: new Date(),
        };

        const id = await db.characters.add(newCharacter);
        return id;
    } catch (error) {
        console.error('Failed to add character:', error);
        throw new Error('Could not add the new character to the database.');
    }
}

/**
 * Retrieves all Characters for a specific World, sorted by name.
 * @param worldId - The ID of the world whose characters are to be fetched.
 * @returns A promise that resolves to an array of Character objects.
 */
export async function getCharactersForWorld(worldId: number): Promise<Character[]> {
    try {
        const characters = await db.characters.where('worldId').equals(worldId).sortBy('name');
        return characters;
    } catch (error) {
        console.error(`Failed to get characters for world ${worldId}:`, error);
        throw new Error('Could not retrieve characters from the database.');
    }
}

// NEW: A type for the updatable fields of a character.
type UpdateCharacterPayload = {
    name: string;
    description: string;
    type: 'PC' | 'NPC' | 'Enemy';
    stats: { [statId: number]: number };
};

/**
 * REFACTOR: Updates an existing Character in the database. Now supports updating stats.
 * @param characterId - The ID of the character to update.
 * @param updates - An object containing the fields to update.
 */
export async function updateCharacter(
    characterId: number,
    updates: UpdateCharacterPayload,
): Promise<void> {
    try {
        await db.characters.update(characterId, updates);
    } catch (error) {
        console.error(`Failed to update character ${characterId}:`, error);
        throw new Error('Could not update the character in the database.');
    }
}

/**
 * Deletes a specific Character from the database.
 * @param characterId - The ID of the character to delete.
 */
export async function deleteCharacter(characterId: number): Promise<void> {
    try {
        await db.characters.delete(characterId);
    } catch (error) {
        console.error(`Failed to delete character ${characterId}:`, error);
        throw new Error('Could not delete the character from the database.');
    }
}
