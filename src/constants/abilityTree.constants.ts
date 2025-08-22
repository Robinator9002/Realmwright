// src/constants/abilityTree.constants.ts

/**
 * Defines constants used across the Ability Tree editor for consistent layout and sizing.
 */

// The fixed height allocated for each tier in the ability tree canvas.
// This value is crucial for calculating node positions and rendering tier lines.
export const TIER_HEIGHT = 180;

// The fixed height of an ability node. This is used for accurate positioning calculations.
export const NODE_HEIGHT = 80; // Based on .ability-node height in _ability-node.css

// The starting X position for newly created nodes.
// This helps in consistent placement of nodes when they are first added to the canvas.
export const NODE_START_X = 200;
