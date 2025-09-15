// src/db/queries/character/stat.queries.ts

/**
 * COMMIT: feat(db): create dedicated query file for stat definitions
 *
 * Rationale:
 * A refactoring oversight led to stat-related queries being mixed with or
 * incorrectly imported from other query files (like ability.queries). This
 * commit creates a dedicated, canonical location for all database queries
 * related to StatDefinitions.
 *
 * Implementation Details:
 * - Created a new file, `stat.queries.ts`.
 * - Added and exported the `getStatDefinitionsForWorld` function, which was
 * previously used in multiple components but lacked a central, logical home.
 * - This improves code organization and separation of concerns within the
 * database layer.
 */
import { db } from '../../db';
import type { StatDefinition } from '../../types';

/**
 * Retrieves all Stat Definitions for a specific World, sorted by name.
 * @param worldId The ID of the world to retrieve stat definitions for.
 * @returns A promise that resolves to an array of StatDefinition objects.
 */
export async function getStatDefinitionsForWorld(worldId: number): Promise<StatDefinition[]> {
    try {
        const definitions = await db.statDefinitions
            .where('worldId')
            .equals(worldId)
            .sortBy('name');
        return definitions;
    } catch (error) {
        console.error(`Failed to get stat definitions for world ${worldId}:`, error);
        throw new Error('Could not retrieve stat definitions from the database.');
    }
}
