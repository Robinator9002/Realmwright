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

    const handleConfirmLink = (locationId: number) => {
        if (!pendingObjectForLink) return;

        const linkedObject = { ...pendingObjectForLink, locationId };

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
        // If the click is on the canvas itself (not a marker that stopped propagation)
        if (activeTool === 'select') {
            setSelectedObjectId(null); // Deselect any active object
        } else if (activeTool === 'add-location') {
            if (!canvasRef.current) return;

            if (!activeLayerId) {
                showModal({
                    type: 'alert',
                    title: 'No Layer Selected',
                    message: 'Please select a layer in the sidebar before adding a location.',
                });
                return;
            }

            const rect = canvasRef.current.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            const worldX = (clickX - viewport.pan.x) / viewport.zoom;
            const worldY = (clickY - viewport.pan.y) / viewport.zoom;

            const newObject: MapObject = {
                id: crypto.randomUUID(),
                layerId: activeLayerId,
                x: worldX,
                y: worldY,
            };

            setPendingObjectForLink(newObject);
            showModal({
                type: 'link-location',
                onConfirm: handleConfirmLink,
            });
        }
    };

    const getCanvasClassName = () => {
        let className = 'map-canvas';
        if (isPanning) {
            className += ' map-canvas--panning';
        } else if (activeTool === 'pan') {
            className += ' map-canvas--tool-pan';
        } else if (activeTool === 'add-location') {
            className += ' map-canvas--tool-add';
        } else if (activeTool === 'select') {
            className += ' map-canvas--tool-select';
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
                {/* FIX: Use a fallback empty array to prevent crashes on old map data */}
                {(currentMap.layers || [])
                    .filter((layer) => layer.isVisible)
                    .flatMap((layer) =>
                        layer.objects.map((obj) => (
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
                        )),
                    )}
            </div>
            <ViewportControls />
        </div>
    );
};
