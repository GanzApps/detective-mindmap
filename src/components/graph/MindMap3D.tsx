'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { drawFrame3D } from '@/lib/graph/renderer3d';
import { hitTest3D } from '@/lib/graph/hitTest3d';
import { ENTITY_TYPE_COLOR, type EntityType, type GraphData, getConnectedIds } from '@/lib/graph/graphTypes';
import { type GraphMinimapState } from '@/components/graph/graphMinimapTypes';
import { ENTITY_FILTER_OPTIONS } from '@/store/caseStore';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export interface MindMap3DExportHandle {
  getCanvas: () => HTMLCanvasElement | null;
  redrawForExport: () => void;
  captureDataUrl: () => string | null;
}

const MindMap3D = forwardRef<MindMap3DExportHandle, {
  graph: GraphData;
  selectedNodeId: string | null;
  highlightedNodeIds: string[];
  activeEntityTypes?: EntityType[];
  showNodeLabels?: boolean;
  focusSelectedNeighborhood?: boolean;
  isActive: boolean;
  onSelectNode: (nodeId: string | null) => void;
  onMinimapStateChange?: (state: GraphMinimapState) => void;
}>(function MindMap3D({
  graph,
  selectedNodeId,
  highlightedNodeIds,
  activeEntityTypes = ENTITY_FILTER_OPTIONS,
  showNodeLabels = true,
  focusSelectedNeighborhood = true,
  isActive,
  onSelectNode,
  onMinimapStateChange,
}, ref) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef({ rotX: 0.28, rotY: 0.55, zoom: 1 });
  const viewportRef = useRef({ width: 0, height: 0 });
  const frameRef = useRef<ReturnType<typeof drawFrame3D> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const autoRotateRef = useRef(true);
  const draggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const needsRedrawRef = useRef(true);
  const hoverNodeIdRef = useRef<string | null>(null);
  const selectedNodeIdRef = useRef<string | null>(selectedNodeId);
  const highlightedNodeIdsRef = useRef<string[]>(highlightedNodeIds);
  const activeEntityTypesRef = useRef<EntityType[]>(activeEntityTypes);
  const showNodeLabelsRef = useRef(showNodeLabels);
  const focusSelectedNeighborhoodRef = useRef(focusSelectedNeighborhood);
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(true);

  function emitMinimapState() {
    if (!onMinimapStateChange || !frameRef.current) {
      return;
    }

    const projectedNodes = frameRef.current.projectedNodes;
    const minX = Math.min(...projectedNodes.map((node) => node.sx));
    const maxX = Math.max(...projectedNodes.map((node) => node.sx));
    const minY = Math.min(...projectedNodes.map((node) => node.sy));
    const maxY = Math.max(...projectedNodes.map((node) => node.sy));
    const width = Math.max(maxX - minX, 1);
    const height = Math.max(maxY - minY, 1);
    const zoom = cameraRef.current.zoom;
    const viewportWidth = clamp(0.82 / zoom, 0.2, 0.9);
    const viewportHeight = clamp(0.82 / zoom, 0.2, 0.9);
    const viewportX = clamp(((Math.sin(cameraRef.current.rotY) + 1) / 2) * (1 - viewportWidth), 0, 1 - viewportWidth);
    const viewportY = clamp(((Math.sin(cameraRef.current.rotX) + 1) / 2) * (1 - viewportHeight), 0, 1 - viewportHeight);

    onMinimapStateChange({
      label: '3D',
      points: projectedNodes.map((node) => ({
        id: node.id,
        x: (node.sx - minX) / width,
        y: (node.sy - minY) / height,
        color: ENTITY_TYPE_COLOR[node.node.type],
        active: selectedNodeIdRef.current === node.id,
        dimmed: !activeEntityTypesRef.current.includes(node.node.type),
      })),
      viewport: {
        x: viewportX,
        y: viewportY,
        width: viewportWidth,
        height: viewportHeight,
      },
    });
  }

  function drawCurrentFrame() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context || viewportRef.current.width === 0 || viewportRef.current.height === 0) {
      return;
    }

    frameRef.current = drawFrame3D(
      context,
      graph,
      cameraRef.current,
      viewportRef.current,
      {
        selectedNodeId: selectedNodeIdRef.current,
        hoverNodeId: hoverNodeIdRef.current,
        highlightedNodeIds: highlightedNodeIdsRef.current,
        activeEntityTypes: activeEntityTypesRef.current,
        showLabels: showNodeLabelsRef.current,
        focusSelectedNeighborhood: focusSelectedNeighborhoodRef.current,
      },
    );
    needsRedrawRef.current = false;
    emitMinimapState();
  }

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    redrawForExport: () => {
      drawCurrentFrame();
      updateTooltip();
    },
    captureDataUrl: () => {
      drawCurrentFrame();
      updateTooltip();
      return canvasRef.current?.toDataURL('image/png') ?? null;
    },
  }), [graph]);

  function updateTooltip() {
    const tooltip = tooltipRef.current;
    const frame = frameRef.current;

    if (!tooltip || !frame) {
      return;
    }

    const hovered = hoverNodeIdRef.current
      ? frame.projectedNodeMap[hoverNodeIdRef.current]
      : null;

    if (!hovered) {
      tooltip.style.opacity = '0';
      return;
    }

    const connectionCount = getConnectedIds(graph.edges, hovered.id).size;
    tooltip.style.opacity = '1';
    tooltip.style.left = `${pointerRef.current.x + 14}px`;
    tooltip.style.top = `${pointerRef.current.y - 10}px`;
    tooltip.innerHTML = `<strong style="color:#fff">${hovered.label.replace('\n', ' ')}</strong> <span style="color:rgba(255,255,255,0.35);font-size:11px">${connectionCount} links</span>`;
  }

  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId;
    needsRedrawRef.current = true;
    emitMinimapState();
  }, [selectedNodeId]);

  useEffect(() => {
    highlightedNodeIdsRef.current = highlightedNodeIds;
    needsRedrawRef.current = true;
    emitMinimapState();
  }, [highlightedNodeIds]);

  useEffect(() => {
    activeEntityTypesRef.current = activeEntityTypes;
    needsRedrawRef.current = true;
    emitMinimapState();
  }, [activeEntityTypes]);

  useEffect(() => {
    showNodeLabelsRef.current = showNodeLabels;
    needsRedrawRef.current = true;
  }, [showNodeLabels]);

  useEffect(() => {
    focusSelectedNeighborhoodRef.current = focusSelectedNeighborhood;
    needsRedrawRef.current = true;
    emitMinimapState();
  }, [focusSelectedNeighborhood]);

  useEffect(() => {
    autoRotateRef.current = autoRotateEnabled;
  }, [autoRotateEnabled]);

  useEffect(() => {
    needsRedrawRef.current = true;
  }, [graph]);

  useEffect(() => {
    if (isActive) {
      needsRedrawRef.current = true;
      emitMinimapState();
    }
  }, [isActive]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;

    if (!wrapper || !canvas) {
      return;
    }

    const wrapperElement = wrapper;
    const canvasElement = canvas;

    function resizeCanvas() {
      const width = wrapperElement.clientWidth;
      const height = wrapperElement.clientHeight;
      const devicePixelRatio = window.devicePixelRatio || 1;
      viewportRef.current = { width, height };
      canvasElement.width = width * devicePixelRatio;
      canvasElement.height = height * devicePixelRatio;
      canvasElement.style.width = `${width}px`;
      canvasElement.style.height = `${height}px`;

      const context = canvasElement.getContext('2d');
      if (context) {
        context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      }

      needsRedrawRef.current = true;
    }

    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    resizeObserver.observe(wrapperElement);

    let running = true;

    const loop = () => {
      if (!running) {
        return;
      }

      if (autoRotateRef.current && !draggingRef.current) {
        cameraRef.current.rotY += 0.003;
        drawCurrentFrame();
        updateTooltip();
      } else if (needsRedrawRef.current) {
        drawCurrentFrame();
        updateTooltip();
      }

      animationFrameRef.current = window.requestAnimationFrame(loop);
    };

    drawCurrentFrame();
    updateTooltip();
    animationFrameRef.current = window.requestAnimationFrame(loop);

    return () => {
      running = false;
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [graph, onMinimapStateChange]);

  useEffect(() => {
    function handleMouseUp() {
      draggingRef.current = false;
    }

    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  function updateHover(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    const frame = frameRef.current;

    if (!canvas || !frame) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    pointerRef.current = { x, y };

    const hit = hitTest3D(frame.projectedNodes, x, y);
    hoverNodeIdRef.current = hit?.id ?? null;
    needsRedrawRef.current = true;
    updateTooltip();
  }

  return (
    <section className="rounded-shell-xl border border-shell-border bg-shell-surface p-6 shadow-shell-lg">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-shell-text-muted">
            3D Renderer
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-shell-text-primary">MindMap3D</h2>
        </div>
        <div className="rounded-shell-pill border border-shell-accent/20 bg-shell-accent-muted px-4 py-2 text-sm text-shell-text-primary">
          {highlightedNodeIds.length} highlighted
        </div>
      </div>

      <div
        ref={wrapperRef}
        className="relative h-[620px] overflow-hidden rounded-shell-xl border border-shell-border bg-shell-bg"
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full cursor-grab active:cursor-grabbing"
          onMouseDown={(event) => {
            draggingRef.current = true;
            dragMovedRef.current = false;
            pointerRef.current = { x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY };
          }}
          onMouseMove={(event) => {
            updateHover(event.clientX, event.clientY);

            if (!draggingRef.current) {
              return;
            }

            const deltaX = event.nativeEvent.movementX;
            const deltaY = event.nativeEvent.movementY;

            if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
              dragMovedRef.current = true;
            }

            cameraRef.current.rotY += deltaX * 0.008;
            cameraRef.current.rotX += deltaY * 0.008;
            autoRotateRef.current = false;
            setAutoRotateEnabled(false);
            needsRedrawRef.current = true;
            emitMinimapState();
          }}
          onMouseLeave={() => {
            hoverNodeIdRef.current = null;
            updateTooltip();
            needsRedrawRef.current = true;
          }}
          onClick={(event) => {
            if (dragMovedRef.current) {
              dragMovedRef.current = false;
              return;
            }

            const frame = frameRef.current;
            if (!frame) {
              return;
            }

            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) {
              return;
            }

            const hit = hitTest3D(
              frame.projectedNodes,
              event.clientX - rect.left,
              event.clientY - rect.top,
            );

            if (!hit) {
              onSelectNode(null);
            } else if (selectedNodeIdRef.current === hit.id) {
              onSelectNode(null);
            } else {
              onSelectNode(hit.id);
            }

            autoRotateRef.current = false;
            setAutoRotateEnabled(false);
            needsRedrawRef.current = true;
            emitMinimapState();
          }}
          onWheel={(event) => {
            event.preventDefault();
            cameraRef.current.zoom = clamp(
              cameraRef.current.zoom - event.deltaY * 0.0008,
              0.3,
              3.5,
            );
            needsRedrawRef.current = true;
            emitMinimapState();
          }}
        />
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute opacity-0 rounded-[10px] border border-white/10 bg-[rgba(15,18,30,0.92)] px-3 py-2 text-xs text-slate-100 transition-opacity"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              cameraRef.current = { rotX: 0.28, rotY: 0.55, zoom: 1 };
              hoverNodeIdRef.current = null;
              onSelectNode(null);
              setAutoRotateEnabled(true);
              autoRotateRef.current = true;
              needsRedrawRef.current = true;
              emitMinimapState();
            }}
            className="rounded-shell-lg border border-shell-border bg-shell-surface-raised px-3 py-1.5 text-xs text-shell-text-secondary transition hover:bg-shell-surface hover:text-shell-text-primary"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              setAutoRotateEnabled((current) => !current);
              needsRedrawRef.current = true;
            }}
            className="rounded-shell-lg border border-shell-border bg-shell-surface-raised px-3 py-1.5 text-xs text-shell-text-secondary transition hover:bg-shell-surface hover:text-shell-text-primary"
          >
            {autoRotateEnabled ? 'Pause' : 'Rotate'}
          </button>
        </div>
        <div className="absolute bottom-3 left-3 text-xs text-shell-text-muted">
          Drag to rotate · Scroll to zoom · Click node to highlight
        </div>
      </div>
    </section>
  );
});

export default MindMap3D;
