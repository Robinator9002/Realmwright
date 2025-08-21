// src/db/queries/ability.queries.ts
import { db } from '../db';
import type { Ability, AbilityTree, PrerequisiteGroup } from '../types';

// --- AbilityTree Queries ---

type CreateAbilityTreeData = {
    name: string;
    description: string;
    worldId: number;
    tierCount?: number;
};

export async function addAbilityTree(treeData: CreateAbilityTreeData): Promise<number> {
    try {
        const newAbilityTree: AbilityTree = {
            ...treeData,
            tierCount: treeData.tierCount || 5,
            createdAt: new Date(),
        };
        const id = await db.abilityTrees.add(newAbilityTree);
        return id;
    } catch (error) {
        console.error('Failed to add ability tree:', error);
        throw new Error('Could not add the new ability tree to the database.');
    }
}

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
 * NEW: A query to retrieve a single ability tree by its primary key.
 * This is essential for loading the specific tree into the editor page.
 */
export async function getAbilityTreeById(treeId: number): Promise<AbilityTree | undefined> {
    try {
        const tree = await db.abilityTrees.get(treeId);
        return tree;
    } catch (error) {
        console.error(`Failed to get ability tree ${treeId}:`, error);
        throw new Error('Could not retrieve the ability tree from the database.');
    }
}

export type UpdateAbilityTreePayload = {
    name: string;
    description: string;
    tierCount: number;
};

export async function updateAbilityTree(
    treeId: number,
    updates: Partial<UpdateAbilityTreePayload>,
): Promise<void> {
    try {
        await db.abilityTrees.update(treeId, updates);
    } catch (error) {
        console.error(`Failed to update ability tree ${treeId}:`, error);
        throw new Error('Could not update the ability tree in the database.');
    }
}

export async function deleteAbilityTree(treeId: number): Promise<void> {
    try {
        await db.transaction('rw', db.abilityTrees, db.abilities, async () => {
            await db.abilities.where('abilityTreeId').equals(treeId).delete();
            await db.abilityTrees.delete(treeId);
        });
    } catch (error) {
        console.error(`Failed to delete ability tree ${treeId}:`, error);
        throw new Error('Could not delete the ability tree from the database.');
    }
}

// --- Ability Queries ---

type CreateAbilityData = {
    name: string;
    description: string;
    worldId: number;
    abilityTreeId: number;
    tier: number;
    iconUrl?: string;
};

export async function addAbility(abilityData: CreateAbilityData): Promise<number> {
    try {
        const newAbility: Ability = {
            ...abilityData,
            prerequisites: [], // Always start with no prerequisites
            iconUrl: abilityData.iconUrl || '',
            createdAt: new Date(),
        };
        const id = await db.abilities.add(newAbility);
        return id;
    } catch (error) {
        console.error('Failed to add ability:', error);
        throw new Error('Could not add the new ability to the database.');
    }
}

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

export type UpdateAbilityPayload = {
    name: string;
    description: string;
    prerequisites: PrerequisiteGroup[];
    x: number;
    y: number;
    tier: number;
    iconUrl: string;
};

export async function updateAbility(
    abilityId: number,
    updates: Partial<UpdateAbilityPayload>,
): Promise<void> {
    try {
        await db.abilities.update(abilityId, updates);
    } catch (error) {
        console.error(`Failed to update ability ${abilityId}:`, error);
        throw new Error('Could not update the ability in the database.');
    }
}

export async function deleteAbility(abilityId: number): Promise<void> {
    try {
        await db.abilities.delete(abilityId);
    } catch (error) {
        console.error(`Failed to delete ability ${abilityId}:`, error);
        throw new Error('Could not delete the ability from the database.');
    }
}
