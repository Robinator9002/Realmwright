// src/db/queries/class.queries.ts
import { db } from '../db';
import type { CharacterClass } from '../types';

/**
 * Adds a new Character Class to the database, linked to a specific World.
 * @param classData - An object containing the new class's details.
 * @returns The ID of the newly created class.
 */
export async function addClass(classData: {
    name: string;
    description: string;
    baseStats: { [statId: number]: number };
    abilityTreeIds: number[];
    worldId: number;
}): Promise<number> {
    try {
        const newClass: CharacterClass = {
            ...classData,
            createdAt: new Date(),
        };
        const id = await db.characterClasses.add(newClass);
        return id;
    } catch (error) {
        console.error('Failed to add character class:', error);
        throw new Error('Could not add the new character class to the database.');
    }
}

/**
 * Retrieves all Character Classes for a specific World, sorted by name.
 * @param worldId - The ID of the world whose classes are to be fetched.
 * @returns A promise that resolves to an array of CharacterClass objects.
 */
export async function getClassesForWorld(worldId: number): Promise<CharacterClass[]> {
    try {
        const classes = await db.characterClasses.where('worldId').equals(worldId).sortBy('name');
        return classes;
    } catch (error) {
        console.error(`Failed to get classes for world ${worldId}:`, error);
        throw new Error('Could not retrieve character classes from the database.');
    }
}

/**
 * Updates an existing Character Class in the database.
 * @param classId - The ID of the class to update.
 * @param updates - An object containing the fields to update.
 */
export async function updateClass(
    classId: number,
    updates: {
        name: string;
        description: string;
        baseStats: { [statId: number]: number };
        abilityTreeIds: number[];
    },
): Promise<void> {
    try {
        await db.characterClasses.update(classId, updates);
    } catch (error) {
        console.error(`Failed to update character class ${classId}:`, error);
        throw new Error('Could not update the character class in the database.');
    }
}

/**
 * Deletes a specific Character Class from the database.
 * Note: This does not currently delete characters of this class.
 * That logic would need to be handled at the application level.
 * @param classId - The ID of the class to delete.
 */
export async function deleteClass(classId: number): Promise<void> {
    try {
        await db.characterClasses.delete(classId);
    } catch (error) {
        console.error(`Failed to delete character class ${classId}:`, error);
        throw new Error('Could not delete the character class from the database.');
    }
}
