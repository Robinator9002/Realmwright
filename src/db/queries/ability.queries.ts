// src/db/queries/ability.queries.ts
import { db } from '../db';
import type { Ability, AbilityTree, Prerequisite } from '../types';

// --- AbilityTree Queries ---

/**
 * Adds a new Ability Tree to the database, linked to a specific World.
 * @param treeData - An object containing the new tree's details.
 * @returns The ID of the newly created ability tree.
 */
export async function addAbilityTree(treeData: {
    name: string;
    description: string;
    worldId: number;
}): Promise<number> {
    try {
        const newAbilityTree: AbilityTree = {
            ...treeData,
            createdAt: new Date(),
        };
        const id = await db.abilityTrees.add(newAbilityTree);
        return id;
    } catch (error) {
        console.error('Failed to add ability tree:', error);
        throw new Error('Could not add the new ability tree to the database.');
    }
}

/**
 * Retrieves all Ability Trees for a specific World, sorted by name.
 * @param worldId - The ID of the world whose trees are to be fetched.
 * @returns A promise that resolves to an array of AbilityTree objects.
 */
export async function getAbilityTreesForWorld(worldId: number): Promise<AbilityTree[]> {
    try {
        const trees = await db.abilityTrees.where('worldId').equals(worldId).sortBy('name');
        return trees;
    } catch (error) {
        console.error(`Failed to get ability trees for world ${worldId}:`, error);
        throw new Error('Could not retrieve ability trees from the database.');
    }
}

/**
 * Updates an existing Ability Tree in the database.
 * @param treeId - The ID of the ability tree to update.
 * @param updates - An object containing the fields to update.
 */
export async function updateAbilityTree(
    treeId: number,
    updates: { name: string; description: string },
): Promise<void> {
    try {
        await db.abilityTrees.update(treeId, updates);
    } catch (error) {
        console.error(`Failed to update ability tree ${treeId}:`, error);
        throw new Error('Could not update the ability tree in the database.');
    }
}

/**
 * Deletes an Ability Tree and all Abilities within it.
 * This is a transactional operation to ensure data integrity.
 * @param treeId - The ID of the ability tree to delete.
 */
export async function deleteAbilityTree(treeId: number): Promise<void> {
    try {
        await db.transaction('rw', db.abilityTrees, db.abilities, async () => {
            // 1. Delete all abilities belonging to this tree.
            await db.abilities.where('abilityTreeId').equals(treeId).delete();
            // 2. Delete the tree itself.
            await db.abilityTrees.delete(treeId);
        });
    } catch (error) {
        console.error(`Failed to delete ability tree ${treeId}:`, error);
        throw new Error('Could not delete the ability tree from the database.');
    }
}

// --- Ability Queries ---

/**
 * Adds a new Ability to a specific Ability Tree.
 * @param abilityData - An object containing the new ability's details.
 * @returns The ID of the newly created ability.
 */
export async function addAbility(abilityData: {
    name: string;
    description: string;
    prerequisites: Prerequisite;
    worldId: number;
    abilityTreeId: number;
}): Promise<number> {
    try {
        const newAbility: Ability = {
            ...abilityData,
            createdAt: new Date(),
        };
        const id = await db.abilities.add(newAbility);
        return id;
    } catch (error) {
        console.error('Failed to add ability:', error);
        throw new Error('Could not add the new ability to the database.');
    }
}

/**
 * Retrieves all Abilities for a specific Ability Tree, sorted by name.
 * @param abilityTreeId - The ID of the tree whose abilities are to be fetched.
 * @returns A promise that resolves to an array of Ability objects.
 */
export async function getAbilitiesForTree(abilityTreeId: number): Promise<Ability[]> {
    try {
        const abilities = await db.abilities
            .where('abilityTreeId')
            .equals(abilityTreeId)
            .sortBy('name');
        return abilities;
    } catch (error) {
        console.error(`Failed to get abilities for tree ${abilityTreeId}:`, error);
        throw new Error('Could not retrieve abilities from the database.');
    }
}

/**
 * Updates an existing Ability in the database.
 * @param abilityId - The ID of the ability to update.
 * @param updates - An object containing the fields to update.
 */
export async function updateAbility(
    abilityId: number,
    updates: { name: string; description: string; prerequisites: Prerequisite },
): Promise<void> {
    try {
        await db.abilities.update(abilityId, updates);
    } catch (error) {
        console.error(`Failed to update ability ${abilityId}:`, error);
        throw new Error('Could not update the ability in the database.');
    }
}

/**
 * Deletes a specific Ability from the database.
 * @param abilityId - The ID of the ability to delete.
 */
export async function deleteAbility(abilityId: number): Promise<void> {
    try {
        await db.abilities.delete(abilityId);
    } catch (error) {
        console.error(`Failed to delete ability ${abilityId}:`, error);
        throw new Error('Could not delete the ability from the database.');
    }
}
