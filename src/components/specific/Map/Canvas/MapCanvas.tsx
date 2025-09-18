// src/components/specific/Map/Canvas/MapCanvas.tsx

import { type FC, useRef, useState } from 'react';
import { useMapEditor } from '../../../../context/feature/MapEditorContext';
import { ViewportControls } from './ViewportControls';

const ZOOM_SENSITIVITY = 0.001;
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.1;

/**
 * The core visual component for the map editor. It renders the map content
 * (image or blank canvas) and handles all viewport interactions like panning and zooming.
 */
export const MapCanvas: FC = () => {
    const { currentMap, viewport, setViewport } = useMapEditor();
    const [isPanning, setIsPanning] = useState(false);
    // Use a ref to store the starting position of a pan action to avoid re-renders
    const panStartRef = useRef({ x: 0, y: 0 });

    const hasImage = !!currentMap.imageDataUrl;

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const newZoom = viewport.zoom - e.deltaY * ZOOM_SENSITIVITY;
        // Clamp the zoom to our defined min/max values to prevent excessive zooming
        const clampedZoom = Math.max(MIN_ZOOM, Math.min(newZoom, MAX_ZOOM));
        setViewport((v) => ({ ...v, zoom: clampedZoom }));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // We only want to pan with the primary mouse button (left-click)
        if (e.button !== 0) return;
        setIsPanning(true);
        panStartRef.current = {
            x: e.clientX - viewport.pan.x,
            y: e.clientY - viewport.pan.y,
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPanning) return;
        const newX = e.clientX - panStartRef.current.x;
        const newY = e.clientY - panStartRef.current.y;
        setViewport((v) => ({ ...v, pan: { x: newX, y: newY } }));
    };

    // Stop panning when the mouse button is released or it leaves the canvas area
    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const canvasContainerClassName = `map-canvas ${isPanning ? 'map-canvas--panning' : ''}`;

    const canvasContentClassName = `map-canvas__content ${
        !hasImage ? 'map-canvas__content--blank' : ''
    }`;

    // Apply the transform using the viewport state from the context
    const canvasContentStyle = {
        backgroundImage: hasImage ? `url(${currentMap.imageDataUrl})` : 'none',
        transform: `translate(${viewport.pan.x}px, ${viewport.pan.y}px) scale(${viewport.zoom})`,
    };

    return (
        <div
            className={canvasContainerClassName}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div className={canvasContentClassName} style={canvasContentStyle} />
            <ViewportControls />
        </div>
    );
};
