// src/components/specific/AbilityTree/Edge/LogicEdge.tsx

/**
 * COMMIT: fix(ability-tree): ensure edge label click is always interactive
 *
 * This commit resolves the bug where clicking on an edge's label did not
 * open the edit modal.
 *
 * Rationale:
 * The React Flow `EdgeLabelRenderer` can sometimes prevent click events from
 * propagating to the main edge component. This meant our `onEdgeClick` handler
 * in the canvas was never firing when the user clicked the label.
 *
 * Implementation Details:
 * - The component now consumes the `useAbilityTreeEditor` context.
 * - An `onClick` handler has been added directly to the label's `<div>`.
 * - This handler bypasses React Flow's event system and directly calls the
 * `setSelectedEdge` function from our context, passing in its own props
 * (which represent the full edge object).
 * - This ensures that clicking the label reliably triggers the desired state
 * change, causing the edit modal to appear.
 */
import type { FC } from 'react';
import { getStraightPath, EdgeLabelRenderer, type EdgeProps } from 'reactflow';
import { useAbilityTreeEditor } from '../../../../context/feature/AbilityTreeEditorContext';

export const LogicEdge: FC<EdgeProps> = (props) => {
    const { id, sourceX, sourceY, targetX, targetY, data } = props;
    // Get the state setter directly from our application's context.
    const { setSelectedEdge } = useAbilityTreeEditor();

    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    const handleEdgeClick = () => {
        // When the label is clicked, we manually set this edge as the selected
        // one in our global context.
        setSelectedEdge(props);
    };

    return (
        <>
            <path id={id} className="react-flow__edge-path" d={edgePath} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <div className="logic-edge__label" onClick={handleEdgeClick}>
                        {data.label}
                    </div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
};
