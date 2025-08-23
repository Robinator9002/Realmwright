// src/components/specific/AbilityTree/Canvas/AbilityTreeCanvas.tsx

/**
 * COMMIT: refactor(ability-tree): refactor canvas to use context and DragPreview
 *
 * This commit refactors the main `AbilityTreeCanvas` component to align with
 * the new modular architecture.
 *
 * Rationale:
 * The canvas was previously receiving a large number of props and was also
 * responsible for rendering drag preview visuals. This refactor decouples it
 * from its parent and simplifies its rendering logic.
 *
 * Implementation Details:
 * - The component's props interface is now minimal, only accepting callbacks
 * for events that the parent page needs to know about (like viewport changes).
 * - It consumes the `useAbilityTreeEditor` hook to get all data (`abilities`,
 * `tree`) and event handlers (`handleNodeDragStop`, `setSelectedNode`, etc.).
 * - It now renders the new `DragPreview` component, passing it the local
 * `dragPreview` state.
 * - The logic for calculating nodes and edges from the `abilities` data is
 * memoized with `useMemo` for performance.
 * - The component is now a self-sufficient unit, focused on managing the
 * React Flow instance.
 */
import { useEffect, useCallback, useMemo, useState, type FC } from 'react';
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
    type NodeDragHandler,
    type NodeMouseHandler,
    type PanOnScrollMode,
    useReactFlow,
    type Viewport,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useAbilityTreeEditor } from '../../../../context/AbilityTreeEditorContext';
import { AbilityNode } from '../Node/AbilityNode';
import { LogicEdge } from '../Sidebar/LogicEdge';
import { AttachmentNode } from '../Node/AttachmentNode';
import { DragPreview, initialDragPreviewState } from './DragPreview';
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
    const { setViewport, getViewport } = useReactFlow();

    // --- Local UI State ---
    const [dragPreview, setDragPreview] = useState(initialDragPreviewState);

    // Effect to update parent component when viewport changes.
    useEffect(() => {
        const { y, zoom } = getViewport();
        onViewportChange({ y, zoom });
    }, [getViewport, onViewportChange]);

    // --- Data Transformation ---
    // Memoize the transformation of abilities into nodes and edges for performance.
    const { initialNodes, initialEdges } = useMemo(() => {
        const transformedNodes: Node[] = abilities.map((ability) => ({
            id: String(ability.id!),
            position: { x: ability.x ?? 0, y: ability.y ?? 0 },
            data: { ...ability, label: ability.name },
            type: ability.attachmentPoint ? 'attachmentNode' : 'abilityNode',
        }));

        const transformedEdges: Edge[] = [];
        abilities.forEach((ability) => {
            ability.prerequisites?.forEach((group) => {
                group.abilityIds.forEach((prereqId) => {
                    transformedEdges.push({
                        id: `e-${prereqId}-${ability.id}`,
                        source: String(prereqId),
                        target: String(ability.id!),
                        data: { label: group.type },
                    });
                });
            });
        });

        return { initialNodes: transformedNodes, initialEdges: transformedEdges };
    }, [abilities]);

    // Effect to update React Flow state when the source data changes.
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

    const handleNodeDragStart = () => setDragPreview((prev) => ({ ...prev, visible: true }));

    const handleNodeDrag: NodeDragHandler = useCallback((_, node) => {
        const nodeCenterY = node.position.y + NODE_HEIGHT / 2;
        const closestTier = Math.max(1, Math.floor(nodeCenterY / TIER_HEIGHT) + 1);
        const snappedY = TIER_HEIGHT * closestTier - TIER_HEIGHT / 2 - NODE_HEIGHT / 2;

        const nodeCenterX = node.position.x + NODE_HEIGHT / 2;
        const relativeCenterX = nodeCenterX - NODE_START_X;
        const closestCol = Math.round(relativeCenterX / COLUMN_WIDTH);
        const snappedX =
            NODE_START_X + closestCol * COLUMN_WIDTH + COLUMN_WIDTH / 2 - NODE_HEIGHT / 2;

        setDragPreview({
            snappedX,
            snappedY,
            targetCenterX: snappedX + NODE_HEIGHT / 2,
            targetCenterY: snappedY + NODE_HEIGHT / 2,
            tierHighlightY: (closestTier - 1) * TIER_HEIGHT,
            visible: true,
        });
    }, []);

    const onNodeDragStop: NodeDragHandler = useCallback(
        (_, node) => {
            const { snappedX, snappedY } = dragPreview;
            setDragPreview(initialDragPreviewState);

            const nodeCenterY = snappedY + NODE_HEIGHT / 2;
            const closestTier = Math.max(1, Math.floor(nodeCenterY / TIER_HEIGHT) + 1);

            setNodes((nds) =>
                nds.map((n) =>
                    n.id === node.id ? { ...n, position: { x: snappedX, y: snappedY } } : n,
                ),
            );
            handleNodeDragStop({ ...node, position: { x: snappedX, y: snappedY } }, closestTier);
        },
        [dragPreview, handleNodeDragStop, setNodes],
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
                onNodeDragStart={handleNodeDragStart}
                onNodeDrag={handleNodeDrag}
                onNodeDragStop={onNodeDragStop}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                defaultEdgeOptions={defaultEdgeOptions}
                deleteKeyCode={['Backspace', 'Delete']}
                panOnScroll
                panOnScrollMode={'vertical' as PanOnScrollMode}
                minZoom={0.5}
                maxZoom={2}
                onMove={(_, vp) => onViewportChange(vp)}
            >
                <DragPreview dragPreviewState={dragPreview} />
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
