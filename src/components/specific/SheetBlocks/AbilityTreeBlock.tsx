// src/components/specific/SheetBlocks/AbilityTreeBlock.tsx

/**
 * COMMIT: fix(react-flow): resolve performance and layout bugs in AbilityTreeBlock
 *
 * Rationale:
 * The console was reporting two errors related to this component:
 * 1. A performance warning (Error #002) because the `nodeTypes` object was
 * being recreated on every render.
 * 2. A layout error (Error #004) because the React Flow container had no
 * explicit dimensions, causing it to collapse to zero height.
 *
 * Implementation Details:
 * - The `nodeTypes` constant has been moved outside the component's function
 * scope, ensuring it is defined only once and resolving the performance issue.
 * - The wrapping div for the React Flow component now has the className
 * `ability-tree-block__react-flow-wrapper`, which is styled in the CSS
 * to have a minimum height, fixing the layout rendering bug.
 */
import { useState, useEffect, type FC } from 'react';
import ReactFlow, {
    Background,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorld } from '../../../context/feature/WorldContext';
import { getAbilityTreesForWorld, getAbilitiesForTree } from '../../../db/queries/ability.queries';
import type { AbilityTree, Ability } from '../../../db/types';
import { Settings } from 'lucide-react';
import { AbilityNode } from '../AbilityTree/Node/AbilityNode';

// PERFORMANCE FIX: Define the custom node types outside the component.
// This ensures the object is not recreated on every render.
const nodeTypes = {
    abilityNode: AbilityNode,
};

export interface AbilityTreeBlockProps {
    content: number | undefined;
    onContentChange: (abilityTreeId: number | undefined) => void;
}

/**
 * A sheet block for displaying a selected Ability Tree.
 */
export const AbilityTreeBlock: FC<AbilityTreeBlockProps> = ({ content, onContentChange }) => {
    const { selectedWorld } = useWorld();
    const [allTrees, setAllTrees] = useState<AbilityTree[]>([]);
    const [abilities, setAbilities] = useState<Ability[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfiguring, setIsConfiguring] = useState(false);

    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);

    useEffect(() => {
        if (selectedWorld?.id) {
            getAbilityTreesForWorld(selectedWorld.id).then((trees) => {
                setAllTrees(trees);
                setIsLoading(false);
            });
        }
    }, [selectedWorld]);

    useEffect(() => {
        if (content) {
            getAbilitiesForTree(content).then(setAbilities);
        } else {
            setAbilities([]);
        }
    }, [content]);

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

    const selectedTree = allTrees.find((tree) => tree.id === content);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? parseInt(e.target.value, 10) : undefined;
        onContentChange(id);
        setIsConfiguring(false);
    };

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
                        <option key={tree.id} value={String(tree.id!)}>
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
                    // LAYOUT FIX: Added a wrapper class to give the container dimensions.
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
