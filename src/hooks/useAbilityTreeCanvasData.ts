// src/hooks/useAbilityTreeCanvasData.ts

/**
 * COMMIT: feat(ability-tree): extract useAbilityTreeCanvasData hook
 *
 * Rationale:
 * As the first step in refactoring the monolithic AbilityTreeCanvas, this
 * commit extracts all the complex data transformation logic into a dedicated
 * custom hook.
 *
 * Implementation Details:
 * - This hook encapsulates the `useMemo` block that was previously in the
 * main canvas component.
 * - It accepts the raw `abilities` and `currentTree` data as arguments.
 * - It is solely responsible for transforming this data into the node and
 * edge arrays required by React Flow, and for calculating the canvas's
 * draggable boundaries.
 * - This change significantly simplifies the main canvas component by
 * separating data processing from rendering concerns.
 */
import { useMemo } from 'react';
import { type Node, type Edge } from 'reactflow';
import type { Ability, AbilityTree } from '../db/types';
import { TIER_HEIGHT, COLUMN_WIDTH, NODE_START_X } from '../constants/abilityTree.constants';

const MAX_PAN_COLUMNS = 20;

export const useAbilityTreeCanvasData = (abilities: Ability[], currentTree: AbilityTree) => {
    return useMemo(() => {
        const transformedNodes: Node[] = abilities.map((ability) => ({
            id: String(ability.id!),
            position: { x: ability.x ?? 0, y: ability.y ?? 0 },
            data: { ...ability, label: ability.name },
            type: ability.attachmentPoint ? 'attachmentNode' : 'abilityNode',
        }));

        const transformedEdges: Edge[] = [];
        abilities.forEach((ability) => {
            ability.prerequisites?.forEach((group, groupIndex) => {
                group.abilityIds.forEach((prereqId, prereqIndex) => {
                    transformedEdges.push({
                        id: `e-${prereqId}-${ability.id}-${groupIndex}-${prereqIndex}`,
                        source: String(prereqId),
                        target: String(ability.id!),
                        data: { label: group.type },
                    });
                });
            });
        });

        const canvasBounds: [[number, number], [number, number]] = [
            [NODE_START_X - COLUMN_WIDTH * 2, -200],
            [
                NODE_START_X + MAX_PAN_COLUMNS * COLUMN_WIDTH,
                currentTree.tierCount * TIER_HEIGHT + 200,
            ],
        ];

        return {
            initialNodes: transformedNodes,
            initialEdges: transformedEdges,
            canvasBounds,
        };
    }, [abilities, currentTree.tierCount]);
};
