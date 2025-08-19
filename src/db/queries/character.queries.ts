// src/db/queries/character.queries.ts
import { db } from '../db';
import type { Character } from '../types';
import { getStatDefinitionsForWorld } from './rule.queries';

// The creation data now includes the optional classId.
type CreateCharacterData = {
    name: string;
    description: string;
    type: 'PC' | 'NPC' | 'Enemy';
    worldId: number;
    classId?: number; // NEW: Allow specifying a class on creation.
};

/**
 * Adds a new Character to the database, linked to a specific World.
 * @param characterData - An object containing the character's details.
 * @returns The ID of the newly created character.
 */
export async function addCharacter(characterData: CreateCharacterData): Promise<number> {
    try {
        const statDefinitions = await getStatDefinitionsForWorld(characterData.worldId);
        const initialStats: { [statId: number]: number } = {};
        for (const stat of statDefinitions) {
            initialStats[stat.id!] = stat.defaultValue;
        }

        const newCharacter: Character = {
            ...characterData,
            campaignIds: [],
            stats: initialStats,
            learnedAbilities: [],
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
 * (This function remains unchanged)
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

// A dedicated type for all updatable fields of a character.
export type UpdateCharacterPayload = {
    name: string;
    description: string;
    type: 'PC' | 'NPC' | 'Enemy';
    stats: { [statId: number]: number };
    learnedAbilities: number[];
    classId?: number; // NEW: Allow updating the class.
};

/**
 * Updates an existing Character in the database.
 * The `updates` parameter is a Partial, allowing for flexible updates.
 * @param characterId - The ID of the character to update.
 * @param updates - An object containing the fields to update.
 */
export async function updateCharacter(
    characterId: number,
    updates: Partial<UpdateCharacterPayload>,
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
 * (This function remains unchanged)
 */
export async function deleteCharacter(characterId: number): Promise<void> {
    try {
        await db.characters.delete(characterId);
    } catch (error) {
        console.error(`Failed to delete character ${characterId}:`, error);
        throw new Error('Could not delete the character from the database.');
    }
}
