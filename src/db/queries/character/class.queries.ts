// src/db/queries/class.queries.ts

/**
 * COMMIT: feat(class-sheet): add getClassById query function
 *
 * Rationale:
 * The main App component needs a way to fetch the specific CharacterClass
 * data for the ClassSheetEditor. This commit adds the necessary query
 * function to retrieve a single class by its primary key.
 *
 * Implementation Details:
 * - Created and exported a new async function `getClassById`.
 * - This function uses `db.characterClasses.get(classId)` for efficient,
 * direct lookup of a class record.
 */
import { db } from '../../db';
import type { CharacterClass, SheetPage } from '../../types';

/**
 * Adds a new, empty Character Class to the database.
 * It's initialized with a default, empty character sheet.
 * @param classData - An object containing the new class's basic details.
 * @returns The ID of the newly created class.
 */
export async function addClass(classData: {
    name: string;
    description: string;
    worldId: number;
}): Promise<number> {
    try {
        const newClass: CharacterClass = {
            ...classData,
            baseStats: {},
            // Initialize with a single, empty "Main" page.
            characterSheet: [
                {
                    id: crypto.randomUUID(),
                    name: 'Main Page',
                    blocks: [],
                },
            ],
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
 * NEW: Retrieves a single Character Class by its unique ID.
 * @param classId - The ID of the class to fetch.
 * @returns A promise that resolves to the CharacterClass object or undefined if not found.
 */
export async function getClassById(classId: number): Promise<CharacterClass | undefined> {
    try {
        const characterClass = await db.characterClasses.get(classId);
        return characterClass;
    } catch (error) {
        console.error(`Failed to get class with ID ${classId}:`, error);
        throw new Error('Could not retrieve the character class from the database.');
    }
}

/**
 * A dedicated type for all updatable fields of a Character Class.
 */
export type UpdateClassPayload = {
    name: string;
    description: string;
    baseStats: { [statId: number]: number };
    characterSheet: SheetPage[];
};

/**
 * Updates an existing Character Class in the database.
 * @param classId - The ID of the class to update.
 * @param updates - An object containing the fields to update.
 */
export async function updateClass(
    classId: number,
    updates: Partial<UpdateClassPayload>,
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
 */
export async function deleteClass(classId: number): Promise<void> {
    try {
        await db.characterClasses.delete(classId);
    } catch (error) {
        console.error(`Failed to delete character class ${classId}:`, error);
        throw new Error('Could not delete the character class from the database.');
    }
}
