// src/components/specific/AbilityTree/Canvas/AbilityTreeCanvas.tsx

/**
 * COMMIT: feat(ability-tree): implement final interaction polish and bugfixes
 *
 * This commit implements the remaining items from the advanced interaction
 * polish plan, addressing connection highlighting and node snapping/selection.
 *
 * Rationale:
 * The canvas interactions, while functional, lacked the final layer of polish
 * expected from a high-quality tool. This commit rectifies those issues.
 *
 * Implementation Details:
 * 1.  **Connection Highlighting:**
 * - `onConnectStart` and `onConnectEnd` handlers are now used to toggle a
 * CSS class (`connection-in-progress`) on the React Flow wrapper element.
 * - This class, combined with the new CSS, causes all valid target handles
 * to light up when a connection is being dragged.
 * 2.  **Accidental Drag Prevention:**
 * - The `nodeDragThreshold` prop has been added to the `<ReactFlow>`
 * component with a value of `1`. This requires the user to drag the mouse
 * at least 1 pixel before a drag event is initiated, effectively
 * distinguishing a click from a drag and fixing the "jump on click" bug.
 * 3.  **Corrected Horizontal Snapping:**
 * - The snapping calculation in `onNodeDragStop` has been rewritten. It now
 * correctly calculates the distance to the center of each column and snaps
 * the node to the column with the minimum distance, ensuring predictable
 * and accurate horizontal placement.
 */
import { useEffect, useCallback, useMemo, useRef, type FC } from 'react';
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
    type NodeDragHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useAbilityTreeEditor } from '../../../../context/AbilityTreeEditorContext';
import { AbilityNode } from '../Node/AbilityNode';
import { AttachmentNode } from '../Node/AttachmentNode';
import { LogicEdge } from '../Edge/LogicEdge';
import { GridHighlighter } from './GridHighlighter';
import {
    TIER_HEIGHT,
    COLUMN_WIDTH,
    MAX_COLUMNS,
    NODE_START_X,
    NODE_HEIGHT,
} from '../../../../constants/abilityTree.constants';

const nodeTypes = { abilityNode: AbilityNode, attachmentNode: AttachmentNode };
const edgeTypes = { logicEdge: LogicEdge };
const defaultEdgeOptions = { type: 'logicEdge', style: { strokeWidth: 2 } };

interface AbilityTreeCanvasProps {
    onViewportChange: (viewport: { y: number; zoom: number }) => void;
}

export const AbilityTreeCanvas: FC<AbilityTreeCanvasProps> = ({ onViewportChange }) => {
    const {
        abilities,
        tree,
        handleNodeDragStop,
        handleDelete,
        setSelectedNode,
        setPendingConnection,
    } = useAbilityTreeEditor();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { getViewport } = useReactFlow();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const { y, zoom } = getViewport();
        onViewportChange({ y, zoom });
    }, [getViewport, onViewportChange]);

    const { initialNodes, initialEdges, canvasBounds } = useMemo(() => {
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

    const onNodeDragStop: NodeDragHandler = useCallback(
        (_, node) => {
            const nodeCenterY = node.position.y + NODE_HEIGHT / 2;
            const closestTier = Math.max(1, Math.floor(nodeCenterY / TIER_HEIGHT) + 1);
            const snappedY = TIER_HEIGHT * closestTier - TIER_HEIGHT / 2 - NODE_HEIGHT / 2;

            // --- CORRECTED SNAPPING LOGIC ---
            const nodeCenterX = node.position.x + NODE_HEIGHT / 2;
            const relativeX = nodeCenterX - NODE_START_X;
            const closestColIndex = Math.round(relativeX / COLUMN_WIDTH);
            const snappedX = NODE_START_X + closestColIndex * COLUMN_WIDTH - NODE_HEIGHT / 2;

            const snappedNode = { ...node, position: { x: snappedX, y: snappedY } };
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

    const onConnectStart = useCallback(() => {
        reactFlowWrapper.current?.classList.add('connection-in-progress');
    }, []);

    const onConnectEnd = useCallback(() => {
        reactFlowWrapper.current?.classList.remove('connection-in-progress');
    }, []);

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
        <div className="ability-editor-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onNodeDragStop={onNodeDragStop}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                defaultEdgeOptions={defaultEdgeOptions}
                deleteKeyCode={['Backspace', 'Delete']}
                panOnDrag={false}
                panOnScroll
                panOnScrollMode={'vertical' as PanOnScrollMode}
                translateExtent={canvasBounds}
                nodeDragThreshold={1}
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
