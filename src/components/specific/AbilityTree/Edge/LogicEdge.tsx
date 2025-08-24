// src/components/specific/AbilityTree/Edge/LogicEdge.tsx

/**
 * COMMIT: chore(ability-tree): relocate LogicEdge and finalize refactor
 *
 * This commit moves the `LogicEdge` component to its final location in a new
 * `/Edge` subdirectory and marks the completion of the refactoring plan.
 *
 * Rationale:
 * Separating custom edge components into their own directory, distinct from
 * nodes, provides the highest level of organizational clarity. This file was
 * the last remaining piece of the original structure to be formally moved.
 *
 * With this commit, the entire Ability Tree module now adheres to the new,
 * modular, context-driven architecture. The foundation is solid, scalable,
 * and ready for future feature development.
 */
import type { FC } from 'react';
import { getStraightPath, EdgeLabelRenderer, type EdgeProps } from 'reactflow';

export const LogicEdge: FC<EdgeProps> = ({ id, sourceX, sourceY, targetX, targetY, data }) => {
    // This helper function calculates the SVG path for a straight line.
    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    return (
        <>
            {/* The SVG path for the edge line itself */}
            <path id={id} className="react-flow__edge-path" d={edgePath} />

            {/* This special renderer ensures the label is positioned correctly
                over the edge and pans/zooms with the canvas. */}
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <div className="logic-edge__label">{data.label}</div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
};
