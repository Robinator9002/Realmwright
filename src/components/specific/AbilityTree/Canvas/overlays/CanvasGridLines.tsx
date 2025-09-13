// src/components/specific/AbilityTree/Canvas/overlays/CanvasGridLines.tsx

/**
 * COMMIT: feat(ability-tree): extract CanvasGridLines component
 *
 * Rationale:
 * As part of the AbilityTreeCanvas refactor, the presentational logic for
 * rendering the SVG background grid (tier and column lines) has been
- * extracted into this dedicated component.
 *
 * Implementation Details:
 * - This component receives the tier count and the current viewport transform
 * (x, y, zoom) as props.
 * - It is solely responsible for rendering the <g> and <line> SVG elements
 * that constitute the canvas grid.
 * - This change simplifies the JSX of the main canvas component and isolates
 * a piece of complex, purely visual logic.
 */
import type { FC } from 'react';
import {
    TIER_HEIGHT,
    COLUMN_WIDTH,
    NODE_START_X,
} from '../../../../../constants/abilityTree.constants';

const GRID_SPAN = 100000; // A large number to ensure lines cover the viewport

interface CanvasGridLinesProps {
    tierCount: number;
    x: number;
    y: number;
    zoom: number;
}

export const CanvasGridLines: FC<CanvasGridLinesProps> = ({ tierCount, x, y, zoom }) => {
    return (
        <svg
            style={{ position: 'absolute', zIndex: -1, width: '100%', height: '100%' }}
            aria-hidden="true"
        >
            <g transform={`translate(${x}, ${y}) scale(${zoom})`}>
                {/* Render horizontal tier lines */}
                {Array.from({ length: tierCount }, (_, i) => (
                    <line
                        key={`tier-line-${i}`}
                        x1={-GRID_SPAN / 2}
                        y1={TIER_HEIGHT * (i + 1)}
                        x2={GRID_SPAN / 2}
                        y2={TIER_HEIGHT * (i + 1)}
                        className="tier-line"
                    />
                ))}
                {/* Render vertical column lines */}
                {Array.from({ length: 50 }, (_, i) => (
                    <line
                        key={`col-line-${i}`}
                        x1={NODE_START_X + COLUMN_WIDTH * (i - 25)}
                        y1={-GRID_SPAN / 2}
                        x2={NODE_START_X + COLUMN_WIDTH * (i - 25)}
                        y2={GRID_SPAN / 2}
                        className="column-line"
                    />
                ))}
            </g>
        </svg>
    );
};
