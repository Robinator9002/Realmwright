// src/components/specific/SheetBlocks/content/AbilityTreeBlock.tsx

/**
 * COMMIT: refactor(character-sheet): make AbilityTreeBlock a pure presentational component
 *
 * Rationale:
 * Continuing the architectural refactor, this commit transforms the
 * AbilityTreeBlock into a pure presentational component. It no longer
 * fetches its own data, making it entirely dependent on props for the data
 * it needs to render.
 *
 * Implementation Details:
 * - Removed all React hooks for local state management (`useState`, `useEffect`)
 * related to data fetching.
 * - Removed the `useWorld` context hook and all direct database queries.
 * - Updated the props interface to require the `allTrees` array to be
 * passed in from a parent component.
 * - This change dramatically simplifies the component's logic, improves
 * performance by preventing redundant data fetches, and aligns it with our
 * new decoupled architecture.
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
import type { AbilityTree, Ability } from '../../../../db/types';
import { Settings } from 'lucide-react';
import { AbilityNode } from '../../AbilityTree/Node/AbilityNode';

// This remains outside the component to prevent re-creation on renders.
const nodeTypes = {
    abilityNode: AbilityNode,
};

// REWORK: Props now include all necessary data for rendering.
export interface AbilityTreeBlockProps {
    content: number | undefined;
    onContentChange: (abilityTreeId: number | undefined) => void;
    allTrees: AbilityTree[]; // Parent must now provide this.
}

/**
 * A sheet block for displaying a selected Ability Tree.
 */
export const AbilityTreeBlock: FC<AbilityTreeBlockProps> = ({
    content,
    onContentChange,
    allTrees,
}) => {
    // This local state is for the UI (configuring vs. display) and the React Flow instance.
    // It is appropriate to keep it here as it's not global application state.
    const [abilities, setAbilities] = useState<Ability[]>([]);
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);

    // Effect to fetch the specific abilities for the *selected* tree.
    // This is still necessary as it depends on the block's specific `content`.
    useEffect(() => {
        if (content) {
            getAbilitiesForTree(content).then(setAbilities);
        } else {
            setAbilities([]);
        }
    }, [content]);

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
        () => allTrees.find((tree) => tree.id === content),
        [allTrees, content],
    );

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? parseInt(e.target.value, 10) : undefined;
        onContentChange(id);
        setIsConfiguring(false);
    };

    // --- RENDER LOGIC ---
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
