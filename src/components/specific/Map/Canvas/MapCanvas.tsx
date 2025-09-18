// src/components/specific/Map/Canvas/MapCanvas.tsx

import { type FC, useRef, useState } from 'react';
import { useMapEditor } from '../../../../context/feature/MapEditorContext';
import { ViewportControls } from './ViewportControls';
import { Toolbar } from './Toolbar';
import { LocationMarker } from './LocationMarker';
import type { MapObject } from '../../../../db/types';
import { useModal } from '../../../../context/global/ModalContext';

const ZOOM_SENSITIVITY = 0.001;
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.1;

export const MapCanvas: FC = () => {
    const { currentMap, viewport, setViewport, activeTool, activeLayerId, updateLayers } =
        useMapEditor();
    const { showModal } = useModal();

    const [isPanning, setIsPanning] = useState(false);
    const panStartRef = useRef({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);

    const hasImage = !!currentMap.imageDataUrl;

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const newZoom = viewport.zoom - e.deltaY * ZOOM_SENSITIVITY;
        const clampedZoom = Math.max(MIN_ZOOM, Math.min(newZoom, MAX_ZOOM));
        setViewport((v) => ({ ...v, zoom: clampedZoom }));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (activeTool !== 'pan' || e.button !== 0) return;
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

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        // Only proceed if the correct tool is active
        if (activeTool !== 'add-location' || !canvasRef.current) return;

        // Check if a layer is selected
        if (!activeLayerId) {
            showModal('alert', {
                title: 'No Layer Selected',
                message: 'Please select a layer in the sidebar before adding a location.',
            });
            return;
        }

        // --- Coordinate Transformation ---
        const rect = canvasRef.current.getBoundingClientRect();
        // 1. Get click position relative to the canvas element
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        // 2. Reverse the pan and zoom transforms to get the "world" coordinates
        const worldX = (clickX - viewport.pan.x) / viewport.zoom;
        const worldY = (clickY - viewport.pan.y) / viewport.zoom;

        const newObject: MapObject = {
            id: crypto.randomUUID(),
            layerId: activeLayerId,
            x: worldX,
            y: worldY,
        };

        // --- Update State ---
        const newLayers = currentMap.layers.map((layer) => {
            if (layer.id === activeLayerId) {
                return { ...layer, objects: [...layer.objects, newObject] };
            }
            return layer;
        });

        updateLayers(newLayers);
    };

    const getCanvasClassName = () => {
        let className = 'map-canvas';
        if (isPanning) {
            className += ' map-canvas--panning';
        } else if (activeTool === 'pan') {
            className += ' map-canvas--tool-pan';
        } else if (activeTool === 'add-location') {
            className += ' map-canvas--tool-add';
        }
        return className;
    };

    const canvasContentClassName = `map-canvas__content ${
        !hasImage ? 'map-canvas__content--blank' : ''
    }`;

    const canvasContentStyle = {
        backgroundImage: hasImage ? `url(${currentMap.imageDataUrl})` : 'none',
        transform: `translate(${viewport.pan.x}px, ${viewport.pan.y}px) scale(${viewport.zoom})`,
    };

    return (
        <div
            ref={canvasRef}
            className={getCanvasClassName()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleCanvasClick}
            onMouseLeave={handleMouseUp}
        >
            <Toolbar />
            <div className={canvasContentClassName} style={canvasContentStyle}>
                {/* Render objects from all visible layers */}
                {currentMap.layers
                    .filter((layer) => layer.isVisible)
                    .map((layer) =>
                        layer.objects.map((obj) => <LocationMarker key={obj.id} {...obj} />),
                    )}
            </div>
            <ViewportControls />
        </div>
    );
};
