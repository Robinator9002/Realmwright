// src/components/specific/AbilityTree/LogicEdge.tsx
import type { FC } from 'react';
import { getStraightPath, EdgeLabelRenderer, type EdgeProps } from 'reactflow';

/**
 * A custom edge component for React Flow that displays a label (e.g., "AND", "OR")
 * at the midpoint of a straight connection line.
 */
export const LogicEdge: FC<EdgeProps> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data, // We will pass the label text via the 'data' prop
}) => {
    // getStraightPath is a helper from React Flow that calculates the SVG path for a straight line
    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    return (
        <>
            {/* The base path for the edge */}
            <path id={id} className="react-flow__edge-path" d={edgePath} />

            {/* EdgeLabelRenderer is a special component that handles positioning the label correctly */}
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    {/* The label itself, styled via CSS */}
                    <div className="logic-edge__label">{data.label}</div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
};
