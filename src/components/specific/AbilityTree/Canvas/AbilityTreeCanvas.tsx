// src/components/specific/AbilityTree/Canvas/AbilityTreeCanvas.tsx

/**
 * COMMIT: fix(ability-tree): resolve all typing and import errors in canvas
 *
 * This commit addresses a series of TypeScript errors that arose from the
 * previous refactoring efforts.
 *
 * Rationale:
 * The previous version had incorrect import paths after the directory
 * restructuring, was missing key type imports from React, and had a type
 * mismatch on the `onNodeDragStop` handler due to an incorrect function
 * signature.
 *
 * Implementation Details:
 * 1.  **Imports Corrected:**
 * - Added `type FC` to the React import.
 * - Corrected the relative paths for `AbilityNode`, `AttachmentNode`, and
 * `LogicEdge` to reflect the final directory structure.
 * - Removed the unused `NODE_HEIGHT` constant import.
 * 2.  **`onNodeDragStop` Handler Fixed:**
 * - Created a new `onNodeDragStop` handler inside the component that
 * correctly matches the signature expected by React Flow:
 * `(event, node) => void`.
 * - This new handler performs the final snapping calculation to determine the
 * `closestTier` and the final `snappedPosition`.
 * - It then calls the `handleNodeDragStop` function from the context, passing
 * the correctly formatted data. This properly bridges the gap between
 * React Flow's event signature and our context's action signature.
 */
import { useEffect, useCallback, useMemo, type FC } from 'react'; // Added FC
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
    type Edge,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    type Node,
    type NodeMouseHandler,
    type PanOnScrollMode,
    useReactFlow,
    type NodeDragHandler, // Import NodeDragHandler for correct typing
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useAbilityTreeEditor } from '../../../../context/AbilityTreeEditorContext';
// Corrected import paths
import { AbilityNode } from '../Node/AbilityNode';
import { AttachmentNode } from '../Node/AttachmentNode';
import { LogicEdge } from '../Edge/LogicEdge';
import { GridHighlighter } from './GridHighlighter';
import {
    TIER_HEIGHT,
    COLUMN_WIDTH, // NODE_HEIGHT removed as it's not used here
    MAX_COLUMNS,
    NODE_START_X,
    NODE_HEIGHT, // Re-added for snapping calculation
} from '../../../../constants/abilityTree.constants';

// --- Component Setup ---
const nodeTypes = { abilityNode: AbilityNode, attachmentNode: AttachmentNode };
const edgeTypes = { logicEdge: LogicEdge };
const defaultEdgeOptions = { type: 'logicEdge', style: { strokeWidth: 2 } };

interface AbilityTreeCanvasProps {
    onViewportChange: (viewport: { y: number; zoom: number }) => void;
}

export const AbilityTreeCanvas: FC<AbilityTreeCanvasProps> = ({ onViewportChange }) => {
    // --- Context Consumption ---
    const {
        abilities,
        tree,
        handleNodeDragStop,
        handleDelete,
        setSelectedNode,
        setPendingConnection,
    } = useAbilityTreeEditor();

    // --- React Flow State ---
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { getViewport } = useReactFlow();

    useEffect(() => {
        const { y, zoom } = getViewport();
        onViewportChange({ y, zoom });
    }, [getViewport, onViewportChange]);

    // --- Data Transformation & Memoization ---
    const { initialNodes, initialEdges, canvasBounds } = useMemo(() => {
        const transformedNodes: Node[] = abilities.map((ability) => {
            const attachedTreeName =
                ability.attachmentPoint?.attachedTreeId != null ? tree.name : undefined;

            return {
                id: String(ability.id!),
                position: { x: ability.x ?? 0, y: ability.y ?? 0 },
                data: { ...ability, label: ability.name, attachedTreeName },
                type: ability.attachmentPoint ? 'attachmentNode' : 'abilityNode',
            };
        });

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

        const extent: [[number, number], [number, number]] = [
            [NODE_START_X - COLUMN_WIDTH, -200],
            [NODE_START_X + (MAX_COLUMNS + 1) * COLUMN_WIDTH, tree.tierCount * TIER_HEIGHT + 200],
        ];

        return {
            initialNodes: transformedNodes,
            initialEdges: transformedEdges,
            canvasBounds: extent,
        };
    }, [abilities, tree]);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    // --- Event Handlers ---
    const handleNodesChange: OnNodesChange = (changes) => {
        const deletedNodeChanges = changes.filter((c) => c.type === 'remove');
        if (deletedNodeChanges.length > 0) {
            const deletedNodes = nodes.filter((node) =>
                deletedNodeChanges.some((change) => change.id === node.id),
            );
            handleDelete(deletedNodes, []);
        }
        onNodesChange(changes);
    };

    const handleEdgesChange: OnEdgesChange = (changes) => {
        const deletedEdgeChanges = changes.filter((c) => c.type === 'remove');
        if (deletedEdgeChanges.length > 0) {
            const deletedEdges = edges.filter((edge) =>
                deletedEdgeChanges.some((change) => change.id === edge.id),
            );
            handleDelete([], deletedEdges);
        }
        onEdgesChange(changes);
    };

    // NEW: Properly typed handler that matches React Flow's expected signature.
    const onNodeDragStop: NodeDragHandler = useCallback(
        (_, node) => {
            // Perform the final snapping calculation here.
            const nodeCenterY = node.position.y + NODE_HEIGHT / 2;
            const closestTier = Math.max(1, Math.floor(nodeCenterY / TIER_HEIGHT) + 1);
            const snappedY = TIER_HEIGHT * closestTier - TIER_HEIGHT / 2 - NODE_HEIGHT / 2;

            const nodeCenterX = node.position.x + NODE_HEIGHT / 2;
            const relativeCenterX = nodeCenterX - NODE_START_X;
            const closestColIndex = Math.max(0, Math.round(relativeCenterX / COLUMN_WIDTH));
            const snappedX =
                NODE_START_X + closestColIndex * COLUMN_WIDTH + COLUMN_WIDTH / 2 - NODE_HEIGHT / 2;

            const snappedNode = { ...node, position: { x: snappedX, y: snappedY } };

            // Now, call the handler from the context with the correct arguments.
            handleNodeDragStop(snappedNode, closestTier);
        },
        [handleNodeDragStop],
    );

    const onConnect: OnConnect = useCallback(
        (connection) => {
            setPendingConnection(connection);
        },
        [setPendingConnection],
    );

    const onNodeClick: NodeMouseHandler = useCallback(
        (_, node) => {
            setSelectedNode(node);
        },
        [setSelectedNode],
    );

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, [setSelectedNode]);

    return (
        <div className="ability-editor-wrapper">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onNodeDragStop={onNodeDragStop} // Use the new, correctly typed handler
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                defaultEdgeOptions={defaultEdgeOptions}
                deleteKeyCode={['Backspace', 'Delete']}
                panOnDrag={false}
                panOnScroll
                panOnScrollMode={'vertical' as PanOnScrollMode}
                translateExtent={canvasBounds}
                minZoom={0.5}
                maxZoom={2}
                onMove={(_, vp) => onViewportChange(vp)}
            >
                <GridHighlighter />
                <Background
                    variant={BackgroundVariant.Lines}
                    gap={48}
                    color="var(--color-border)"
                />
                <svg className="ability-editor-canvas__grid-lines">
                    {Array.from({ length: tree.tierCount }, (_, i) => (
                        <line
                            key={`tier-line-${i}`}
                            x1="0"
                            y1={TIER_HEIGHT * (i + 1)}
                            x2="100%"
                            y2={TIER_HEIGHT * (i + 1)}
                            className="tier-line"
                        />
                    ))}
                    {Array.from({ length: MAX_COLUMNS + 1 }, (_, i) => (
                        <line
                            key={`col-line-${i}`}
                            x1={NODE_START_X + COLUMN_WIDTH * i}
                            y1="0"
                            x2={NODE_START_X + COLUMN_WIDTH * i}
                            y2="100%"
                            className="column-line"
                        />
                    ))}
                </svg>
                <Controls />
            </ReactFlow>
        </div>
    );
};
