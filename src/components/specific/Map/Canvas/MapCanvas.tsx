// src/components/specific/Map/Canvas/MapCanvas.tsx

import { type FC, useRef, useState, useEffect } from 'react';
import { useMapEditor } from '../../../../context/feature/MapEditorContext';
import { ViewportControls } from './ViewportControls';
import { Toolbar } from './Toolbar';
import { LocationMarker } from './LocationMarker';
import type { MapObject, Point } from '../../../../db/types';
import { useModal } from '../../../../context/global/ModalContext';

const ZOOM_SENSITIVITY = 0.001;
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.1;

export const MapCanvas: FC = () => {
    const {
        currentMap,
        viewport,
        setViewport,
        activeTool,
        activeLayerId,
        updateLayers,
        selectedObjectId,
        setSelectedObjectId,
    } = useMapEditor();
    const { showModal } = useModal();

    const [isPanning, setIsPanning] = useState(false);
    const panStartRef = useRef({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);

    const [pendingObjectForLink, setPendingObjectForLink] = useState<MapObject | null>(null);

    // --- Zone Drawing State ---
    const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
    const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 });
    // --- End Zone Drawing State ---

    const hasImage = !!currentMap.imageDataUrl;

    // This function finalizes the polygon and adds it to the map state.
    const completeDrawing = () => {
        if (drawingPoints.length < 3) {
            setDrawingPoints([]); // Not enough points for a shape, just cancel.
            return;
        }

        const newZoneObject: MapObject = {
            id: crypto.randomUUID(),
            layerId: activeLayerId!,
            points: [...drawingPoints],
        };

        const newLayers = currentMap.layers.map((layer) => {
            if (layer.id === activeLayerId) {
                return { ...layer, objects: [...layer.objects, newZoneObject] };
            }
            return layer;
        });
        updateLayers(newLayers);

        setDrawingPoints([]); // Reset for the next drawing.
    };

    // Listen for the 'Enter' key to complete the drawing.
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && activeTool === 'draw-zone' && drawingPoints.length > 0) {
                completeDrawing();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [activeTool, drawingPoints, completeDrawing]);

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
        if (isPanning) {
            const newX = e.clientX - panStartRef.current.x;
            const newY = e.clientY - panStartRef.current.y;
            setViewport((v) => ({ ...v, pan: { x: newX, y: newY } }));
        }

        // Track mouse position in world coordinates for drawing feedback.
        if (activeTool === 'draw-zone' && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const clientX = e.clientX - rect.left;
            const clientY = e.clientY - rect.top;
            const worldX = (clientX - viewport.pan.x) / viewport.zoom;
            const worldY = (clientY - viewport.pan.y) / viewport.zoom;
            setMousePosition({ x: worldX, y: worldY });
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleConfirmLink = (locationId: number) => {
        if (!pendingObjectForLink) return;

        // Ensure the object has x and y, as it's a marker.
        const linkedObject = {
            ...pendingObjectForLink,
            x: pendingObjectForLink.x!,
            y: pendingObjectForLink.y!,
            locationId,
        };

        const newLayers = currentMap.layers.map((layer) => {
            if (layer.id === linkedObject.layerId) {
                return { ...layer, objects: [...layer.objects, linkedObject] };
            }
            return layer;
        });
        updateLayers(newLayers);

        setPendingObjectForLink(null);
    };

    const handleMarkerClick = (objectId: string) => {
        if (activeTool === 'select') {
            setSelectedObjectId(objectId);
        }
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (activeTool === 'select') {
            setSelectedObjectId(null);
        } else if (activeTool === 'add-location') {
            if (!canvasRef.current || !activeLayerId) {
                showModal({
                    type: 'alert',
                    title: 'No Layer Selected',
                    message: 'Please select a layer in the sidebar before adding a location.',
                });
                return;
            }

            const rect = canvasRef.current.getBoundingClientRect();
            const worldX = (e.clientX - rect.left - viewport.pan.x) / viewport.zoom;
            const worldY = (e.clientY - rect.top - viewport.pan.y) / viewport.zoom;

            const newObject: MapObject = {
                id: crypto.randomUUID(),
                layerId: activeLayerId,
                x: worldX,
                y: worldY,
            };

            setPendingObjectForLink(newObject);
            showModal({ type: 'link-location', onConfirm: handleConfirmLink });
        } else if (activeTool === 'draw-zone') {
            if (!canvasRef.current || !activeLayerId) {
                showModal({
                    type: 'alert',
                    title: 'No Layer Selected',
                    message: 'Please select a layer in the sidebar before drawing a zone.',
                });
                return;
            }
            const rect = canvasRef.current.getBoundingClientRect();
            const worldX = (e.clientX - rect.left - viewport.pan.x) / viewport.zoom;
            const worldY = (e.clientY - rect.top - viewport.pan.y) / viewport.zoom;

            setDrawingPoints((prev) => [...prev, { x: worldX, y: worldY }]);
        }
    };

    const handleDoubleClick = () => {
        if (activeTool === 'draw-zone') {
            completeDrawing();
        }
    };

    const getCanvasClassName = () => {
        let className = 'map-canvas';
        if (isPanning) className += ' map-canvas--panning';
        else if (activeTool === 'pan') className += ' map-canvas--tool-pan';
        else if (activeTool === 'add-location') className += ' map-canvas--tool-add';
        else if (activeTool === 'select') className += ' map-canvas--tool-select';
        // Add a new cursor style for drawing.
        else if (activeTool === 'draw-zone') className += ' map-canvas--tool-draw';
        return className;
    };

    const canvasContentClassName = `map-canvas__content ${
        !hasImage ? 'map-canvas__content--blank' : ''
    }`;

    const canvasContentStyle = {
        backgroundImage: hasImage ? `url(${currentMap.imageDataUrl})` : 'none',
        transform: `translate(${viewport.pan.x}px, ${viewport.pan.y}px) scale(${viewport.zoom})`,
    };

    // Convert points array to SVG polygon string
    const pointsToString = (points: Point[]) => {
        return points.map((p) => `${p.x},${p.y}`).join(' ');
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
            onDoubleClick={handleDoubleClick}
        >
            <Toolbar />
            <div className={canvasContentClassName} style={canvasContentStyle}>
                {(currentMap.layers || [])
                    .filter((layer) => layer.isVisible)
                    .flatMap((layer) =>
                        layer.objects.map((obj) => {
                            // Render markers if they have x/y coordinates
                            if (obj.x !== undefined && obj.y !== undefined) {
                                return (
                                    <LocationMarker
                                        key={obj.id}
                                        x={obj.x}
                                        y={obj.y}
                                        isSelected={selectedObjectId === obj.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMarkerClick(obj.id);
                                        }}
                                    />
                                );
                            }
                            // We will render zones (polygons) here in the next step.
                            return null;
                        }),
                    )}

                {/* --- Visual Feedback for Drawing --- */}
                {activeTool === 'draw-zone' && drawingPoints.length > 0 && (
                    <svg className="map-canvas__overlay-svg">
                        {/* Line from last point to current mouse position */}
                        <line
                            x1={drawingPoints[drawingPoints.length - 1].x}
                            y1={drawingPoints[drawingPoints.length - 1].y}
                            x2={mousePosition.x}
                            y2={mousePosition.y}
                            className="map-canvas__drawing-line"
                        />
                        {/* The polygon being drawn */}
                        <polyline
                            points={pointsToString(drawingPoints)}
                            className="map-canvas__drawing-line"
                        />
                        {/* Dots for each vertex */}
                        {drawingPoints.map((p, i) => (
                            <circle
                                key={i}
                                cx={p.x}
                                cy={p.y}
                                r={4 / viewport.zoom} // Make radius scale inversely with zoom
                                className="map-canvas__drawing-vertex"
                            />
                        ))}
                    </svg>
                )}
                {/* --- End Visual Feedback --- */}
            </div>
            <ViewportControls />
        </div>
    );
};
