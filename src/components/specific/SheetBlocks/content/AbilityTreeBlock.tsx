// src/components/specific/SheetBlocks/content/AbilityTreeBlock.tsx

/**
 * COMMIT: refactor(sheet-block): align AbilityTreeBlock with new config system
 *
 * Rationale:
 * The component's logic was outdated. It was using its own local state to
 * manage which tree to display (`isConfiguring`) and relied on the deprecated
 * `content` prop. This change refactors the block to be a purely
 * presentational component that is configured externally via the new
 * `block.config` property.
 *
 * Implementation Details:
 * - The component's props interface has been changed to accept the full
 * `block` object instead of separate `content` and `onContentChange` props.
 * - Removed all internal state and event handlers related to the old settings UI.
 * - The component now derives the `treeId` from `block.config.treeId`.
 * - The internal header and settings button have been removed, as this "chrome"
 * is now provided by the universal `SheetBlockWrapper`.
 */
import { useState, useEffect, useMemo, type FC } from 'react';
import ReactFlow, {
    Background,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getAbilitiesForTree } from '../../../../db/queries/character/ability.queries';
import type { AbilityTree, Ability, SheetBlock } from '../../../../db/types';
import { AbilityNode } from '../../AbilityTree/Node/AbilityNode';

// This remains outside the component to prevent re-creation on renders.
const nodeTypes = {
    abilityNode: AbilityNode,
};

// REWORK: Props are now simpler, taking the block object and the list of trees.
export interface AbilityTreeBlockProps {
    block: SheetBlock;
    allTrees: AbilityTree[];
}

/**
 * A sheet block for displaying a selected Ability Tree.
 */
export const AbilityTreeBlock: FC<AbilityTreeBlockProps> = ({ block, allTrees }) => {
    // This local state is for the React Flow instance and is appropriate to keep here.
    const [abilities, setAbilities] = useState<Ability[]>([]);
    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);

    // REWORK: The tree to display is now determined by the block's config property.
    const treeId = block.config?.treeId;

    // Effect to fetch the specific abilities for the *selected* tree.
    useEffect(() => {
        if (treeId) {
            getAbilitiesForTree(treeId).then(setAbilities);
        } else {
            setAbilities([]);
        }
    }, [treeId]);

    // Effect to transform the fetched abilities into nodes and edges for React Flow.
    useEffect(() => {
        const initialNodes: Node[] = abilities.map((ability) => ({
            id: String(ability.id!),
            position: { x: ability.x ?? 0, y: ability.y ?? 0 },
            data: {
                label: ability.name,
                description: ability.description,
                iconUrl: ability.iconUrl,
            },
            type: 'abilityNode',
        }));

        const initialEdges: Edge[] = [];
        abilities.forEach((ability) => {
            ability.prerequisites?.forEach((group) => {
                group.abilityIds.forEach((prereqId) => {
                    initialEdges.push({
                        id: `e-${prereqId}-${ability.id}`,
                        source: String(prereqId),
                        target: String(ability.id!),
                    });
                });
            });
        });

        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [abilities, setNodes, setEdges]);

    // Derived state: find the full tree object from the provided props.
    const selectedTree = useMemo(
        () => allTrees.find((tree) => tree.id === treeId),
        [allTrees, treeId],
    );

    // --- RENDER LOGIC ---
    // The configuration UI has been removed and is now handled by the properties sidebar.
    return (
        <div className="ability-tree-block">
            {selectedTree ? (
                <div className="ability-tree-block__react-flow-wrapper">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        fitView
                        nodesDraggable={false}
                        nodesConnectable={false}
                        panOnDrag={false}
                        zoomOnScroll={false}
                        zoomOnDoubleClick={false}
                        preventScrolling={false}
                    >
                        <Background />
                    </ReactFlow>
                </div>
            ) : (
                <p className="panel__empty-message--small">
                    No ability tree selected. Use the properties panel to choose one.
                </p>
            )}
        </div>
    );
};
