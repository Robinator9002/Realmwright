// src/components/specific/AbilityTree/Canvas/AbilityTreeCanvas.tsx

/**
 * COMMIT: refactor(ability-tree): simplify AbilityTreeCanvas into a container
 *
 * Rationale:
 * To complete its refactoring, the AbilityTreeCanvas has been transformed
 * into a lean container component. It now delegates all complex data
 * processing, event handling, and SVG rendering to specialized hooks and
 * sub-components.
 *
 * Implementation Details:
 * - All data transformation logic has been moved to the
 * `useAbilityTreeCanvasData` hook.
 * - All event handling logic has been moved to the
 * `useAbilityTreeCanvasEvents` hook.
 * - All SVG overlay rendering has been moved to the `CanvasGridLines` and
 * `NodeDragHighlighter` components.
 * - The main component is now solely responsible for orchestrating these
 * modules, resulting in a file that is under 100 lines, significantly
 * more readable, and easier to maintain.
 */
import { useEffect, useRef, type FC } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
    useStore,
    useViewport,
    type Node,
    type PanOnScrollMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useAbilityTreeEditor } from '../../../../context/feature/AbilityTreeEditorContext';
import { AbilityNode } from '../Node/AbilityNode';
import { AttachmentNode } from '../Node/AttachmentNode';
import { LogicEdge } from '../Edge/LogicEdge';
import { useAbilityTreeCanvasData } from '../../../../hooks/useAbilityTreeCanvasData';
import { useAbilityTreeCanvasEvents } from '../../../../hooks/useAbilityTreeCanvasEvents';
import { CanvasGridLines } from './overlays/CanvasGridLines';
import { NodeDragHighlighter } from './overlays/NodeDragHighlighter';

const nodeTypes = { abilityNode: AbilityNode, attachmentNode: AttachmentNode };
const edgeTypes = { logicEdge: LogicEdge };
const defaultEdgeOptions = { type: 'logicEdge', style: { strokeWidth: 2 } };
const PAN_ON_DRAG_ZOOM_THRESHOLD = 0.8;

const draggingNodeSelector = (state: { nodeInternals: Map<string, Node> }): Node | undefined =>
    Array.from(state.nodeInternals.values()).find((n) => n.dragging);

interface AbilityTreeCanvasProps {
    onViewportChange: (viewport: { y: number; zoom: number }) => void;
}

export const AbilityTreeCanvas: FC<AbilityTreeCanvasProps> = ({ onViewportChange }) => {
    const context = useAbilityTreeEditor();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const reactFlowWrapperRef = useRef<HTMLDivElement>(null);
    const draggingNode = useStore(draggingNodeSelector);
    const { y, zoom } = useViewport();

    useEffect(() => {
        onViewportChange({ y, zoom });
    }, [y, zoom, onViewportChange]);

    const { initialNodes, initialEdges, canvasBounds } = useAbilityTreeCanvasData(
        context.abilities,
        context.currentTree,
    );

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const eventHandlers = useAbilityTreeCanvasEvents({
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        ...context,
        reactFlowWrapperRef,
    });

    return (
        <div className="ability-editor-wrapper" ref={reactFlowWrapperRef}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={eventHandlers.handleNodesChange}
                onEdgesChange={eventHandlers.handleEdgesChange}
                onNodeDragStop={eventHandlers.onNodeDragStop}
                onConnect={eventHandlers.onConnect}
                onConnectStart={eventHandlers.onConnectStart}
                onConnectEnd={eventHandlers.onConnectEnd}
                onNodeClick={eventHandlers.onNodeClick}
                onEdgeClick={eventHandlers.onEdgeClick}
                onPaneClick={eventHandlers.onPaneClick}
                defaultEdgeOptions={defaultEdgeOptions}
                deleteKeyCode={['Backspace', 'Delete']}
                panOnDrag={zoom >= PAN_ON_DRAG_ZOOM_THRESHOLD}
                panOnScroll
                panOnScrollMode={'vertical' as PanOnScrollMode}
                translateExtent={canvasBounds}
                nodeDragThreshold={1}
                minZoom={0.5}
                maxZoom={2}
            >
                <Background
                    variant={BackgroundVariant.Lines}
                    gap={48}
                    color="var(--color-border)"
                />
                <CanvasGridLines
                    tierCount={context.currentTree.tierCount}
                    x={useViewport().x}
                    y={y}
                    zoom={zoom}
                />
                <NodeDragHighlighter
                    draggingNode={draggingNode}
                    zoom={zoom}
                    x={useViewport().x}
                    y={y}
                />
                <Controls />
            </ReactFlow>
        </div>
    );
};
