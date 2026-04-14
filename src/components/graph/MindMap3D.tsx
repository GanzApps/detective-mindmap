'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { drawFrame3D } from '@/lib/graph/renderer3d';
import { getSearchMatches } from '@/lib/graph/forceSimulation';
import { hitTest3D } from '@/lib/graph/hitTest3d';
import { ENTITY_TYPE_COLOR, type EntityType, type GraphData, getConnectedIds } from '@/lib/graph/graphTypes';
import { type GraphMinimapState } from '@/components/graph/graphMinimapTypes';
import { ENTITY_FILTER_OPTIONS } from '@/store/caseStore';
import { type SharedNodePosition } from '@/lib/graph/projection3d';

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
  searchQuery: string;
  committedSearchNodeId: string | null;
  nodePositions: Record<string, SharedNodePosition>;
  showNodeLabels?: boolean;
  focusSelectedNeighborhood?: boolean;
  isActive: boolean;
  onSearchQueryChange: (value: string) => void;
  onCommitSearchSelection: (nodeId: string) => void;
  onUpdateNodePosition: (nodeId: string, position: SharedNodePosition) => void;
  onSelectNode: (nodeId: string | null) => void;
  onMinimapStateChange?: (state: GraphMinimapState) => void;
}>(function MindMap3D({
  graph,
  selectedNodeId,
  highlightedNodeIds,
  activeEntityTypes = ENTITY_FILTER_OPTIONS,
  searchQuery,
  committedSearchNodeId,
  nodePositions,
  showNodeLabels = true,
  focusSelectedNeighborhood = true,
  isActive,
  onSearchQueryChange,
  onCommitSearchSelection,
  onUpdateNodePosition,
  onSelectNode,
  onMinimapStateChange,
}, ref) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef({ rotX: 0.28, rotY: 0.55, zoom: 1, offsetX: 0, offsetY: 0 });
  const viewportRef = useRef({ width: 0, height: 0 });
  const frameRef = useRef<ReturnType<typeof drawFrame3D> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const resizeCanvasRef = useRef<(() => void) | null>(null);
  const autoRotateRef = useRef(true);
  const draggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const dragModeRef = useRef<'rotate' | 'pan' | 'node' | null>(null);
  const draggedNodeIdRef = useRef<string | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const needsRedrawRef = useRef(true);
  const hoverNodeIdRef = useRef<string | null>(null);
  const selectedNodeIdRef = useRef<string | null>(selectedNodeId);
  const highlightedNodeIdsRef = useRef<string[]>(highlightedNodeIds);
  const activeEntityTypesRef = useRef<EntityType[]>(activeEntityTypes);
  const showNodeLabelsRef = useRef(showNodeLabels);
  const focusSelectedNeighborhoodRef = useRef(focusSelectedNeighborhood);
  const nodePositionsRef = useRef(nodePositions);
  const dragPositionOverridesRef = useRef<Record<string, SharedNodePosition>>({});
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(true);
  const searchMatches = getSearchMatches(graph.nodes, searchQuery);
  const visibleSearchMatches = searchMatches.slice(0, 6);
  const committedSearchNode = committedSearchNodeId
    ? graph.nodes.find((node) => node.id === committedSearchNodeId) ?? null
    : null;

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
    const panX = cameraRef.current.offsetX / Math.max(viewportRef.current.width, 1);
    const panY = cameraRef.current.offsetY / Math.max(viewportRef.current.height, 1);
    const viewportX = clamp(
      (((Math.sin(cameraRef.current.rotY) + 1) / 2) * (1 - viewportWidth)) - panX * 0.35,
      0,
      1 - viewportWidth,
    );
    const viewportY = clamp(
      (((Math.sin(cameraRef.current.rotX) + 1) / 2) * (1 - viewportHeight)) - panY * 0.35,
      0,
      1 - viewportHeight,
    );

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
        sharedPositions: {
          ...nodePositionsRef.current,
          ...dragPositionOverridesRef.current,
        },
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
    nodePositionsRef.current = nodePositions;
    needsRedrawRef.current = true;
  }, [nodePositions]);

  useEffect(() => {
    autoRotateRef.current = autoRotateEnabled;
  }, [autoRotateEnabled]);

  useEffect(() => {
    needsRedrawRef.current = true;
    dragPositionOverridesRef.current = {};
  }, [graph]);

  useEffect(() => {
    if (isActive) {
      resizeCanvasRef.current?.();
      needsRedrawRef.current = true;
      drawCurrentFrame();
      updateTooltip();
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

    resizeCanvasRef.current = resizeCanvas;

    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    resizeObserver.observe(wrapperElement);

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      cameraRef.current.zoom = clamp(
        cameraRef.current.zoom - event.deltaY * 0.0008,
        0.3,
        3.5,
      );
      needsRedrawRef.current = true;
      emitMinimapState();
    };

    canvasElement.addEventListener('wheel', handleWheel, { passive: false });

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
      canvasElement.removeEventListener('wheel', handleWheel);
      resizeCanvasRef.current = null;
    };
  }, [graph, onMinimapStateChange]);

  useEffect(() => {
    function handleMouseUp() {
      if (dragModeRef.current === 'node' && draggedNodeIdRef.current) {
        const position = dragPositionOverridesRef.current[draggedNodeIdRef.current];
        if (position) {
          onUpdateNodePosition(draggedNodeIdRef.current, position);
        }
      }

      draggingRef.current = false;
      dragModeRef.current = null;
      draggedNodeIdRef.current = null;
    }

    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onUpdateNodePosition]);

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

    const hit = hitTest3D(frame.projectedNodes, x, y, 8, selectedNodeIdRef.current ?? undefined);
    hoverNodeIdRef.current = hit.node?.id ?? null;
    needsRedrawRef.current = true;
    updateTooltip();
  }

  return (
    <section className="rounded-shell-xl border border-shell-border bg-shell-surface p-6 shadow-shell-lg">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-shell-text-muted">
            3D Renderer
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-shell-text-primary">MindMap3D</h2>
        </div>
        <div className="flex items-start gap-3">
          <div className="relative w-[280px]">
            <label className="block rounded-shell-lg border border-shell-border bg-shell-surface-raised px-4 py-3">
              <span className="text-xs uppercase tracking-[0.2em] text-shell-text-muted">Search nodes</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                placeholder="Search nodes"
                className="mt-2 w-full bg-transparent text-sm text-shell-text-primary outline-none placeholder:text-shell-text-muted"
              />
            </label>
            {searchQuery.trim() ? (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-10 overflow-hidden rounded-shell-lg border border-shell-border bg-shell-surface shadow-shell-lg">
                {visibleSearchMatches.length > 0 ? (
                  <ul className="divide-y divide-shell-border">
                    {visibleSearchMatches.map((node) => (
                      <li key={node.id}>
                        <button
                          type="button"
                          onClick={() => onCommitSearchSelection(node.id)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-shell-surface-raised"
                        >
                          <span>
                            <span className="block text-sm font-medium text-shell-text-primary">{node.label}</span>
                            <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-shell-text-muted">
                              {node.type}
                            </span>
                          </span>
                          <span className="text-xs text-shell-text-secondary">Focus</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-sm text-shell-text-secondary">
                    No matching entities yet.
                  </div>
                )}
              </div>
            ) : null}
          </div>
          <div className="rounded-shell-pill border border-shell-accent/20 bg-shell-accent-muted px-4 py-2 text-sm text-shell-text-primary">
            {highlightedNodeIds.length} highlighted
          </div>
        </div>
      </div>

      <div
        ref={wrapperRef}
        className="relative h-[620px] overflow-hidden rounded-shell-xl border border-shell-border bg-shell-bg"
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full cursor-grab active:cursor-grabbing"
          onContextMenu={(event) => {
            event.preventDefault();
          }}
          onMouseDown={(event) => {
            draggingRef.current = true;
            dragMovedRef.current = false;
            pointerRef.current = { x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY };
            draggedNodeIdRef.current = null;

            if (event.button === 2) {
              dragModeRef.current = 'pan';
              return;
            }

            const frame = frameRef.current;
            if (!frame) {
              dragModeRef.current = 'rotate';
              return;
            }

            const hit = hitTest3D(
              frame.projectedNodes,
              event.nativeEvent.offsetX,
              event.nativeEvent.offsetY,
              8,
              selectedNodeIdRef.current ?? undefined,
            );

            if (hit.node && hit.isSelectedNode) {
              dragModeRef.current = 'node';
              draggedNodeIdRef.current = hit.node.id;
              const current = dragPositionOverridesRef.current[hit.node.id]
                ?? nodePositionsRef.current[hit.node.id]
                ?? { x: hit.node.x, y: hit.node.z };
              dragPositionOverridesRef.current[hit.node.id] = current;
              return;
            }

            dragModeRef.current = 'rotate';
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

            if (dragModeRef.current === 'node' && draggedNodeIdRef.current) {
              const current = dragPositionOverridesRef.current[draggedNodeIdRef.current]
                ?? nodePositionsRef.current[draggedNodeIdRef.current]
                ?? { x: 0, y: 0 };
              const yaw = cameraRef.current.rotY;
              const zoomFactor = Math.max(cameraRef.current.zoom, 0.35);
              const cy = Math.cos(yaw);
              const sy = Math.sin(yaw);
              const worldDeltaX = ((cy * deltaX) + (sy * deltaY)) / zoomFactor;
              const worldDeltaY = ((-sy * deltaX) + (cy * deltaY)) / zoomFactor;
              dragPositionOverridesRef.current[draggedNodeIdRef.current] = {
                x: current.x + worldDeltaX,
                y: current.y + worldDeltaY,
              };
            } else if (dragModeRef.current === 'pan') {
              cameraRef.current.offsetX += deltaX;
              cameraRef.current.offsetY += deltaY;
            } else {
              cameraRef.current.rotY += deltaX * 0.008;
              cameraRef.current.rotX += deltaY * 0.008;
            }
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
              8,
              selectedNodeIdRef.current ?? undefined,
            );

            if (!hit.node) {
              onSelectNode(null);
            } else if (selectedNodeIdRef.current === hit.node.id) {
              onSelectNode(null);
            } else {
              onSelectNode(hit.node.id);
            }

            autoRotateRef.current = false;
            setAutoRotateEnabled(false);
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
              cameraRef.current = { rotX: 0.28, rotY: 0.55, zoom: 1, offsetX: 0, offsetY: 0 };
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
          Left drag to rotate · Right drag to pan · Scroll to zoom · Click node to highlight
        </div>
        <div className="absolute right-3 top-16 rounded-shell-lg border border-shell-border bg-shell-surface/90 px-4 py-3 text-right shadow-shell-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-shell-text-muted">
            Search status
          </p>
          <p className="mt-2 text-sm text-shell-text-primary">
            {searchQuery.trim()
              ? `${searchMatches.length} suggestion${searchMatches.length === 1 ? '' : 's'}`
              : 'No search active'}
          </p>
          <p className="mt-1 text-xs text-shell-text-secondary">
            {committedSearchNode
              ? `Focused on ${committedSearchNode.label}`
              : searchQuery.trim()
                ? 'Choose a result to focus the graph'
                : 'Select a node to inspect it'}
          </p>
        </div>
      </div>
    </section>
  );
});

export default MindMap3D;
