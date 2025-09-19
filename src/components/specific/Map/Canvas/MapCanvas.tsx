// src/components/specific/Map/Canvas/MapCanvas.tsx

import { type FC, useRef, useState, useEffect } from 'react';
import { useMapEditor } from '../../../../context/feature/MapEditorContext.tsx';
import { ViewportControls } from './ViewportControls.tsx';
import { Toolbar } from './Toolbar.tsx';
import { LocationMarker } from './LocationMarker.tsx';
// Import the new component to render our zones.
import { ZonePolygon } from './ZonePolygon.tsx';
import type { MapObject, Point } from '../../../../db/types.ts';
import { useModal } from '../../../../context/global/ModalContext.tsx';

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

    const completeDrawing = () => {
        if (drawingPoints.length < 3) {
            setDrawingPoints([]);
            return;
        }

        const newZoneObject: MapObject = {
            id: crypto.randomUUID(),
            layerId: activeLayerId!,
            points: [...drawingPoints],
            // Zones don't have a single x/y, so we omit them.
        };

        const newLayers = currentMap.layers.map((layer) => {
            if (layer.id === activeLayerId) {
                return { ...layer, objects: [...layer.objects, newZoneObject] };
            }
            return layer;
        });
        updateLayers(newLayers);
        setDrawingPoints([]);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && activeTool === 'draw-zone' && drawingPoints.length > 0) {
                completeDrawing();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
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
        panStartRef.current = { x: e.clientX - viewport.pan.x, y: e.clientY - viewport.pan.y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            const newX = e.clientX - panStartRef.current.x;
            const newY = e.clientY - panStartRef.current.y;
            setViewport((v) => ({ ...v, pan: { x: newX, y: newY } }));
        }
        if (activeTool === 'draw-zone' && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const clientX = e.clientX - rect.left;
            const clientY = e.clientY - rect.top;
            const worldX = (clientX - viewport.pan.x) / viewport.zoom;
            const worldY = (clientY - viewport.pan.y) / viewport.zoom;
            setMousePosition({ x: worldX, y: worldY });
        }
    };

    const handleMouseUp = () => setIsPanning(false);

    const handleConfirmLink = (locationId: number) => {
        if (!pendingObjectForLink) return;
        const linkedObject: MapObject = {
            ...pendingObjectForLink,
            x: pendingObjectForLink.x!,
            y: pendingObjectForLink.y!,
            locationId,
        };
        const newLayers = currentMap.layers.map((layer) =>
            layer.id === linkedObject.layerId
                ? { ...layer, objects: [...layer.objects, linkedObject] }
                : layer,
        );
        updateLayers(newLayers);
        setPendingObjectForLink(null);
    };

    // Generic click handler for any map object (marker or zone).
    const handleObjectClick = (objectId: string) => {
        if (activeTool === 'select') {
            setSelectedObjectId(objectId);
        }
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (activeTool === 'select') {
            setSelectedObjectId(null);
            return;
        }

        if (!canvasRef.current || !activeLayerId) {
            showModal({
                type: 'alert',
                title: 'No Layer Selected',
                message: 'Please select a layer in the sidebar before adding an object.',
            });
            return;
        }

        const rect = canvasRef.current.getBoundingClientRect();
        const worldX = (e.clientX - rect.left - viewport.pan.x) / viewport.zoom;
        const worldY = (e.clientY - rect.top - viewport.pan.y) / viewport.zoom;

        if (activeTool === 'add-location') {
            const newObject: MapObject = {
                id: crypto.randomUUID(),
                layerId: activeLayerId,
                x: worldX,
                y: worldY,
            };
            setPendingObjectForLink(newObject);
            showModal({ type: 'link-location', onConfirm: handleConfirmLink });
        } else if (activeTool === 'draw-zone') {
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
    const pointsToString = (points: Point[]) => points.map((p) => `${p.x},${p.y}`).join(' ');

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
                            // If the object has points, it's a zone. Render it.
                            if (obj.points && obj.points.length > 0) {
                                return (
                                    <ZonePolygon
                                        key={obj.id}
                                        points={obj.points}
                                        isSelected={selectedObjectId === obj.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleObjectClick(obj.id);
                                        }}
                                    />
                                );
                            }
                            // If it has x/y, it's a marker. Render it.
                            if (obj.x !== undefined && obj.y !== undefined) {
                                return (
                                    <LocationMarker
                                        key={obj.id}
                                        x={obj.x}
                                        y={obj.y}
                                        isSelected={selectedObjectId === obj.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleObjectClick(obj.id);
                                        }}
                                    />
                                );
                            }
                            // Otherwise, it's malformed or a new type. Ignore for now.
                            return null;
                        }),
                    )}

                {activeTool === 'draw-zone' && drawingPoints.length > 0 && (
                    <svg className="map-canvas__overlay-svg">
                        <line
                            x1={drawingPoints[drawingPoints.length - 1].x}
                            y1={drawingPoints[drawingPoints.length - 1].y}
                            x2={mousePosition.x}
                            y2={mousePosition.y}
                            className="map-canvas__drawing-line"
                        />
                        <polyline
                            points={pointsToString(drawingPoints)}
                            className="map-canvas__drawing-line"
                        />
                        {drawingPoints.map((p, i) => (
                            <circle
                                key={i}
                                cx={p.x}
                                cy={p.y}
                                r={4 / viewport.zoom}
                                className="map-canvas__drawing-vertex"
                            />
                        ))}
                    </svg>
                )}
            </div>
            <ViewportControls />
        </div>
    );
};
