// src/components/specific/SheetBlocks/content/AbilityTreeBlock.tsx

import { useState, useEffect, useMemo, type FC } from 'react';
import ReactFlow, {
    Background,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useClassSheetStore } from '../../../../stores/classSheetEditor.store';
import { getAbilitiesForTree } from '../../../../db/queries/character/ability.queries';
import type { SheetBlock, Ability } from '../../../../db/types';
import { AbilityNode } from '../../AbilityTree/Node/AbilityNode';

const nodeTypes = {
    abilityNode: AbilityNode,
};

export interface AbilityTreeBlockProps {
    block: SheetBlock;
}

/**
 * A sheet block for displaying a selected Ability Tree.
 */
export const AbilityTreeBlock: FC<AbilityTreeBlockProps> = ({ block }) => {
    const { allAbilityTrees } = useClassSheetStore((state) => ({
        allAbilityTrees: state.allAbilityTrees,
    }));

    const [abilities, setAbilities] = useState<Ability[]>([]);
    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);
    const selectedTreeId = block.config?.treeId;

    useEffect(() => {
        if (selectedTreeId) {
            getAbilitiesForTree(selectedTreeId).then(setAbilities);
        } else {
            setAbilities([]);
        }
    }, [selectedTreeId]);

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

    const selectedTree = useMemo(
        () => allAbilityTrees.find((tree) => tree.id === selectedTreeId),
        [allAbilityTrees, selectedTreeId],
    );

    return (
        <div className="ability-tree-block">
            <div className="ability-tree-block__header">
                <h4 className="ability-tree-block__title">
                    {selectedTree ? selectedTree.name : 'No Tree Selected'}
                </h4>
            </div>
            <div className="ability-tree-block__content">
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
                    // REWORK: Use the standard small empty message class for consistency.
                    <p className="panel__empty-message--small">
                        Select this block and use the properties sidebar to choose an ability tree
                        to display.
                    </p>
                )}
            </div>
        </div>
    );
};
