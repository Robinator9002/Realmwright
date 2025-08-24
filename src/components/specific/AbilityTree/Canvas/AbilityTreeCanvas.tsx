// src/components/specific/AbilityTree/Canvas/AbilityTreeCanvas.tsx

/**
 * COMMIT: feat(ability-tree): implement all canvas UX improvements
 *
 * This commit overhauls the `AbilityTreeCanvas` to implement the full UX
 * improvement plan.
 *
 * Rationale:
 * The canvas interactions had several rough edges: a disconnected drag
 * preview, a "jumping" node on drag start, and overly permissive panning.
 * This commit resolves all these issues for a more polished experience.
 *
 * Implementation Details:
 * 1.  **Integrated Drag Preview:** The new `<GridHighlighter />` component is now
 * rendered directly within the React Flow pane. It subscribes to the
 * internal store and renders SVG elements, ensuring it pans and zooms
 * perfectly with the canvas. The old HTML-based preview and its state
 * have been completely removed.
 * 2.  **"Jumping Node" Fix:** The cause of the jump was the old `dragPreview`
 * state. By removing it and relying on the `GridHighlighter` which reads
 * live data from the store, the issue is resolved. The `onNodeDragStart`
 * handler is no longer needed.
 * 3.  **Controlled Navigation:**
 * - `panOnDrag` is set to `false` to disable free-form dragging of the canvas.
 * - `translateExtent` is now calculated based on the tree's dimensions,
 * creating a firm bounding box that prevents the user from panning
 * into empty space. Navigation is now primarily handled by scrolling.
 */
import { useEffect, useCallback, useMemo } from 'react';
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
    type Viewport,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useAbilityTreeEditor } from '../../../../context/AbilityTreeEditorContext';
import { AbilityNode } from '../Node/AbilityNode';
import { AttachmentNode } from '../Node/AttachmentNode';
import { LogicEdge } from '../Edge/LogicEdge'; // Corrected path
import { GridHighlighter } from './GridHighlighter'; // Import the new highlighter
import {
    TIER_HEIGHT,
    NODE_HEIGHT,
    COLUMN_WIDTH,
    MAX_COLUMNS,
    NODE_START_X,
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

    // Effect to update parent component when viewport changes.
    useEffect(() => {
        const { y, zoom } = getViewport();
        onViewportChange({ y, zoom });
    }, [getViewport, onViewportChange]);

    // --- Data Transformation & Memoization ---
    const { initialNodes, initialEdges, canvasBounds } = useMemo(() => {
        const transformedNodes: Node[] = abilities.map((ability) => {
            // NEW: Attached tree name is resolved here for the node to use.
            const attachedTreeName =
                ability.attachmentPoint?.attachedTreeId != null
                    ? tree.name // This is a placeholder; in a real app, you'd look up the tree name.
                    : undefined;

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

        // NEW: Calculate the bounding box for the canvas.
        const extent: [[number, number], [number, number]] = [
            [NODE_START_X - COLUMN_WIDTH, -200], // Top-left bound [x1, y1]
            [
                NODE_START_X + (MAX_COLUMNS + 1) * COLUMN_WIDTH, // Bottom-right bound [x2, y2]
                tree.tierCount * TIER_HEIGHT + 200,
            ],
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
                onNodeDragStop={handleNodeDragStop}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                defaultEdgeOptions={defaultEdgeOptions}
                deleteKeyCode={['Backspace', 'Delete']}
                // --- UX IMPROVEMENTS ---
                panOnDrag={false} // Disable canvas dragging
                panOnScroll
                panOnScrollMode={'vertical' as PanOnScrollMode}
                translateExtent={canvasBounds} // Enforce the bounding box
                minZoom={0.5}
                maxZoom={2}
                onMove={(_, vp) => onViewportChange(vp)}
            >
                {/* The new SVG highlighter is rendered inside the pane */}
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
