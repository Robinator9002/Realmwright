// src/db/queries/character.queries.ts
import { db } from '../db';
import type { Character } from '../types';

// Define a type for the data needed to create a new character.
// This makes our function signature cleaner and more explicit.
type CreateCharacterData = {
    name: string;
    description: string;
    type: 'PC' | 'NPC' | 'Enemy';
    worldId: number;
};

/**
 * Adds a new Character to the database, linked to a specific World.
 * @param characterData - An object containing the character's details.
 * @returns The ID of the newly created character.
 */
export async function addCharacter(characterData: CreateCharacterData): Promise<number> {
    try {
        const newCharacter: Character = {
            ...characterData,
            campaignIds: [], // Characters start with no assigned campaigns
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

/**
 * NEW: Updates an existing Character in the database.
 * @param characterId - The ID of the character to update.
 * @param updates - An object containing the fields to update. Currently supports name and description.
 */
export async function updateCharacter(
    characterId: number,
    updates: { name: string; description: string },
): Promise<void> {
    try {
        await db.characters.update(characterId, updates);
    } catch (error) {
        console.error(`Failed to update character ${characterId}:`, error);
        throw new Error('Could not update the character in the database.');
    }
}

/**
 * NEW: Deletes a specific Character from the database.
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
