// src/components/specific/SheetBlocks/AbilityTreeBlock.tsx
import { useState, useEffect, type FC } from 'react';
import ReactFlow, {
    Background,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorld } from '../../../context/WorldContext';
import { getAbilityTreesForWorld, getAbilitiesForTree } from '../../../db/queries/ability.queries';
import type { AbilityTree, Ability } from '../../../db/types';
import { Settings } from 'lucide-react';
import { AbilityNode } from '../AbilityTree/AbilityNode';

// Define the custom node types for React Flow
const nodeTypes = {
    abilityNode: AbilityNode,
};

export interface AbilityTreeBlockProps {
    content: number | undefined;
    onContentChange: (abilityTreeId: number | undefined) => void;
}

/**
 * A sheet block for displaying a selected Ability Tree.
 * Includes a configuration mode and a read-only visual render of the tree.
 */
export const AbilityTreeBlock: FC<AbilityTreeBlockProps> = ({ content, onContentChange }) => {
    const { selectedWorld } = useWorld();
    const [allTrees, setAllTrees] = useState<AbilityTree[]>([]);
    const [abilities, setAbilities] = useState<Ability[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfiguring, setIsConfiguring] = useState(false);

    // States for React Flow
    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);

    // Effect to fetch the list of all available trees
    useEffect(() => {
        if (selectedWorld?.id) {
            getAbilityTreesForWorld(selectedWorld.id).then((trees) => {
                setAllTrees(trees);
                setIsLoading(false);
            });
        }
    }, [selectedWorld]);

    // Effect to fetch the abilities for the currently selected tree
    useEffect(() => {
        if (content) {
            getAbilitiesForTree(content).then(setAbilities);
        } else {
            setAbilities([]); // Clear abilities if no tree is selected
        }
    }, [content]);

    // Effect to transform the fetched abilities into nodes and edges for React Flow
    useEffect(() => {
        const initialNodes: Node[] = [];
        const initialEdges: Edge[] = [];

        for (const ability of abilities) {
            initialNodes.push({
                id: String(ability.id!),
                position: { x: ability.x ?? 0, y: ability.y ?? 0 },
                data: { label: ability.name, description: ability.description },
                type: 'abilityNode',
            });

            if (ability.prerequisites?.abilityIds) {
                for (const prereqId of ability.prerequisites.abilityIds) {
                    initialEdges.push({
                        id: `e-${prereqId}-${ability.id}`,
                        source: String(prereqId),
                        target: String(ability.id!),
                        animated: true,
                    });
                }
            }
        }
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [abilities, setNodes, setEdges]);

    const selectedTree = allTrees.find((tree) => tree.id === content);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? parseInt(e.target.value, 10) : undefined;
        onContentChange(id);
        setIsConfiguring(false);
    };

    // --- Render Logic ---

    if (isLoading) {
        return <p>Loading ability trees...</p>;
    }

    if (isConfiguring) {
        return (
            <div className="ability-tree-block__config">
                <label htmlFor="tree-select" className="form__label">
                    Select Ability Tree
                </label>
                <select
                    id="tree-select"
                    className="form__select"
                    value={content ?? ''}
                    onChange={handleSelectChange}
                >
                    <option value="">-- None --</option>
                    {allTrees.map((tree) => (
                        <option key={tree.id} value={tree.id}>
                            {tree.name}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    return (
        <div className="ability-tree-block">
            <div className="ability-tree-block__header">
                <h4 className="ability-tree-block__title">
                    {selectedTree ? selectedTree.name : 'No Tree Selected'}
                </h4>
                <button
                    onClick={() => setIsConfiguring(true)}
                    className="ability-tree-block__config-button"
                    title="Configure Block"
                >
                    <Settings size={16} />
                </button>
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
                    <p className="placeholder-text">
                        Click the gear icon to select an ability tree to display.
                    </p>
                )}
            </div>
        </div>
    );
};
