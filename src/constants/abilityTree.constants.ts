// src/constants/abilityTree.constants.ts

/**
 * Defines constants used across the Ability Tree editor for consistent layout and sizing.
 */

// The fixed height allocated for each tier in the ability tree canvas.
// This value is crucial for calculating node positions and rendering tier lines.
export const TIER_HEIGHT = 180;

// The fixed height of an ability node. This is used for accurate positioning calculations.
export const NODE_HEIGHT = 80;

// The fixed width allocated for each column/horizontal slot in the ability tree canvas.
// This will be used for drawing vertical grid lines and potentially for horizontal snapping.
export const COLUMN_WIDTH = 150;

// The maximum number of columns visible/draggable on the canvas.
// Used to define the horizontal boundaries for node dragging and canvas panning.
export const MAX_COLUMNS = 10;

// The starting X position for newly created nodes.
// This helps in consistent placement of nodes when they are first added to the canvas.
export const NODE_START_X = 200;

// Minimum zoom level for the React Flow canvas.
export const MIN_ZOOM = 0.5; // Allow zooming out to half size

// Maximum zoom level for the React Flow canvas.
export const MAX_ZOOM = 2; // Allow zooming in to double size

// Minimum Y pan value for the React Flow canvas.
// Prevents panning too far up, ensuring the top tiers are always accessible.
export const MIN_Y_PAN = -100; // Allow a little buffer above the first tier

// Maximum Y pan value for the React Flow canvas.
// Prevents panning too far down, keeping the view focused on relevant content.
// This will be dynamically calculated based on tierCount, but a base value is good.
export const MAX_Y_PAN_BUFFER = 200; // Additional buffer below the last tier
