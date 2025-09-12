// src/db/queries/world/character.queries.ts

import { db } from '../../db';
import type { Character } from '../../types';

// The creation data now requires a classId.
type CreateCharacterData = {
    name: string;
    description: string;
    type: 'PC' | 'NPC' | 'Enemy';
    worldId: number;
    classId: number;
};

/**
 * Adds a new Character to the database, instantiated from a specific Class blueprint.
 * @param characterData - An object containing the character's details.
 * @returns The ID of the newly created character.
 */
export async function addCharacter(characterData: CreateCharacterData): Promise<number> {
    try {
        // Fetch the class blueprint to use as a template.
        const classBlueprint = await db.characterClasses.get(characterData.classId);
        if (!classBlueprint) {
            throw new Error(`Class with ID ${characterData.classId} not found.`);
        }

        const newCharacter: Character = {
            ...characterData,
            campaignIds: [],
            // The character's initial stats are a copy of the class's base stats.
            stats: { ...classBlueprint.baseStats },
            learnedAbilities: [],
            // Initialize with an empty object for instance-specific data.
            instanceData: {},
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
    instanceData: { [blockId: string]: any };
};

/**
 * Updates an existing Character in the database.
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
