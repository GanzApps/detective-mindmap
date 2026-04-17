'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import {
  drag,
  pointer,
  select,
  zoom,
  zoomIdentity,
  type D3ZoomEvent,
  type Selection,
  type ZoomBehavior,
  type ZoomTransform,
} from 'd3';
import {
  createForceSimulation,
  drawGraph2D,
  getGraphBounds,
  getSearchMatches,
  hitTest2D,
  type ForceGraphEdgeDatum,
  type ForceGraphNodeDatum,
} from '@/lib/graph/forceSimulation';
import { type EntityType, type GraphData } from '@/lib/graph/graphTypes';
import { type GraphMinimapState } from '@/components/graph/graphMinimapTypes';
import { ENTITY_FILTER_OPTIONS } from '@/store/caseStore';
import { type SharedNodePosition } from '@/lib/graph/projection3d';

interface PointerState {
  x: number;
  y: number;
}

export interface ForceGraph2DExportHandle {
  getCanvas: () => HTMLCanvasElement | null;
  redrawForExport: () => void;
  captureDataUrl: () => string | null;
  panTo: (nx: number, ny: number) => void;
  panMove: (dnx: number, dny: number) => void;
}

function getFitTransform(
  width: number,
  height: number,
  nodes: ForceGraphNodeDatum[],
) {
  const bounds = getGraphBounds(nodes);
  const padding = 100;
  const scale = Math.max(
    0.55,
    Math.min(
      1.45,
      Math.min((width - padding) / bounds.width, (height - padding) / bounds.height),
    ),
  );
  const centerX = bounds.minX + bounds.width / 2;
  const centerY = bounds.minY + bounds.height / 2;
  const x = width / 2 - centerX * scale;
  const y = height / 2 - centerY * scale;

  return zoomIdentity.translate(x, y).scale(scale);
}

const ForceGraph2D = forwardRef<ForceGraph2DExportHandle, {
  graph: GraphData;
  selectedNodeId: string | null;
  highlightedNodeIds: string[];
  activeEntityTypes?: EntityType[];
  searchQuery: string;
  committedSearchNodeId: string | null;
  nodePositions: Record<string, SharedNodePosition>;
  showEdgeLabels?: boolean;
  showNodeLabels?: boolean;
  focusSelectedNeighborhood?: boolean;
  isActive: boolean;
  onUpdateNodePosition: (nodeId: string, position: SharedNodePosition) => void;
  onSelectNode: (nodeId: string | null) => void;
  onMinimapStateChange?: (state: GraphMinimapState) => void;
}>(function ForceGraph2D({
  graph,
  selectedNodeId,
  highlightedNodeIds,
  activeEntityTypes = ENTITY_FILTER_OPTIONS,
  searchQuery,
  committedSearchNodeId,
  nodePositions,
  showEdgeLabels = true,
  showNodeLabels = true,
  focusSelectedNeighborhood = true,
  isActive,
  onUpdateNodePosition,
  onSelectNode,
  onMinimapStateChange,
}, ref) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const d3SelectionRef = useRef<Selection<HTMLCanvasElement, unknown, null, undefined> | null>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<HTMLCanvasElement, unknown> | null>(null);
  const simulationRef = useRef<ReturnType<typeof createForceSimulation>['simulation'] | null>(null);
  const nodesRef = useRef<ForceGraphNodeDatum[]>([]);
  const edgesRef = useRef<ForceGraphEdgeDatum[]>([]);
  const transformRef = useRef<ZoomTransform>(zoomIdentity);
  const animationFrameRef = useRef<number | null>(null);
  const resizeCanvasRef = useRef<(() => void) | null>(null);
  const selectedNodeIdRef = useRef<string | null>(selectedNodeId);
  const highlightedNodeIdsRef = useRef<string[]>(highlightedNodeIds);
  const activeEntityTypesRef = useRef<EntityType[]>(activeEntityTypes);
  const searchMatchIdsRef = useRef<string[]>([]);
  const showEdgeLabelsRef = useRef(showEdgeLabels);
  const showNodeLabelsRef = useRef(showNodeLabels);
  const focusSelectedNeighborhoodRef = useRef(focusSelectedNeighborhood);
  const nodePositionsRef = useRef(nodePositions);
  const hoverNodeIdRef = useRef<string | null>(null);
  const pointerDownRef = useRef<PointerState>({ x: 0, y: 0 });
  const clickOriginRef = useRef<PointerState>({ x: 0, y: 0 });
  const lastDragPointerRef = useRef<PointerState>({ x: 0, y: 0 });
  const pointerButtonRef = useRef<number>(0);
  const dragActivatedRef = useRef(false);
  const userAdjustedViewportRef = useRef(false);
  const viewportRef = useRef({ width: 0, height: 0, dpr: 1 });

  const searchMatches = useMemo(() => getSearchMatches(graph.nodes, searchQuery), [graph.nodes, searchQuery]);
  const committedSearchNode = useMemo(
    () => (committedSearchNodeId
      ? graph.nodes.find((node) => node.id === committedSearchNodeId) ?? null
      : null),
    [committedSearchNodeId, graph.nodes],
  );
  const selectedNode = useMemo(
    () => (selectedNodeId
      ? graph.nodes.find((node) => node.id === selectedNodeId) ?? null
      : null),
    [graph.nodes, selectedNodeId],
  );

  function emitMinimapState() {
    if (!onMinimapStateChange || nodesRef.current.length === 0) {
      return;
    }

    const bounds = getGraphBounds(nodesRef.current);
    const width = Math.max(bounds.width, 1);
    const height = Math.max(bounds.height, 1);
    const transform = transformRef.current;
    const viewport = viewportRef.current;
    const left = (-transform.x) / transform.k;
    const top = (-transform.y) / transform.k;
    const right = (viewport.width - transform.x) / transform.k;
    const bottom = (viewport.height - transform.y) / transform.k;

    const selId = selectedNodeIdRef.current;
    const relatedIds = selId
      ? new Set(
          edgesRef.current.flatMap((e) =>
            e.source.id === selId ? [e.target.id]
            : e.target.id === selId ? [e.source.id]
            : [],
          ),
        )
      : null;

    onMinimapStateChange({
      label: '2D',
      points: nodesRef.current.map((node) => ({
        id: node.id,
        x: (node.x - bounds.minX) / width,
        y: (node.y - bounds.minY) / height,
        color: node.color,
        active: selId === node.id,
        dimmed: !activeEntityTypesRef.current.includes(node.type),
        related: relatedIds ? relatedIds.has(node.id) : false,
      })),
      viewport: {
        x: Math.max(0, Math.min(1, (left - bounds.minX) / width)),
        y: Math.max(0, Math.min(1, (top - bounds.minY) / height)),
        width: Math.max(0.12, Math.min(1, (right - left) / width)),
        height: Math.max(0.12, Math.min(1, (bottom - top) / height)),
      },
    });
  }

  function drawCurrentFrame() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const { width, height } = viewportRef.current;
    if (width === 0 || height === 0) {
      return;
    }

    drawGraph2D(context, width, height, nodesRef.current, edgesRef.current, {
      transform: transformRef.current,
      selectedId: selectedNodeIdRef.current,
      highlightedIds: highlightedNodeIdsRef.current,
      activeEntityTypes: activeEntityTypesRef.current,
      searchMatchIds: searchMatchIdsRef.current,
      showEdgeLabels: showEdgeLabelsRef.current,
      showNodeLabels: showNodeLabelsRef.current,
      focusSelectedNeighborhood: focusSelectedNeighborhoodRef.current,
      theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light',
    });
  }

  function scheduleDraw() {
    if (animationFrameRef.current !== null) {
      return;
    }

    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = null;
      drawCurrentFrame();
    });
  }

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    redrawForExport: () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      drawCurrentFrame();
    },
    captureDataUrl: () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      drawCurrentFrame();
      return canvasRef.current?.toDataURL('image/png') ?? null;
    },
    panTo: (nx: number, ny: number) => {
      const selection = d3SelectionRef.current;
      const behavior = zoomBehaviorRef.current;
      if (!selection || !behavior || nodesRef.current.length === 0) return;
      const bounds = getGraphBounds(nodesRef.current);
      const worldX = bounds.minX + nx * bounds.width;
      const worldY = bounds.minY + ny * bounds.height;
      const k = transformRef.current.k;
      const nextTransform = zoomIdentity
        .translate(
          viewportRef.current.width / 2 - worldX * k,
          viewportRef.current.height / 2 - worldY * k,
        )
        .scale(k);
      selection.call(behavior.transform, nextTransform);
      userAdjustedViewportRef.current = true;
      emitMinimapState();
    },
    panMove: (dnx: number, dny: number) => {
      const selection = d3SelectionRef.current;
      const behavior = zoomBehaviorRef.current;
      if (!selection || !behavior || nodesRef.current.length === 0) return;
      const bounds = getGraphBounds(nodesRef.current);
      const k = transformRef.current.k;
      // dnx/dny are minimap-space fractions of the graph bounds
      const dx = -dnx * bounds.width * k;
      const dy = -dny * bounds.height * k;
      const nextTransform = zoomIdentity
        .translate(transformRef.current.x + dx, transformRef.current.y + dy)
        .scale(k);
      selection.call(behavior.transform, nextTransform);
      userAdjustedViewportRef.current = true;
      emitMinimapState();
    },
  }), []);

  function applyFitTransform() {
    const selection = d3SelectionRef.current;
    const behavior = zoomBehaviorRef.current;

    if (!selection || !behavior || nodesRef.current.length === 0) {
      return;
    }

    const nextTransform = getFitTransform(viewportRef.current.width, viewportRef.current.height, nodesRef.current);
    selection.call(behavior.transform, nextTransform);
    emitMinimapState();
  }

  function focusNode(nodeId: string | null) {
    if (!nodeId) {
      return;
    }

    const selection = d3SelectionRef.current;
    const behavior = zoomBehaviorRef.current;
    const targetNode = nodesRef.current.find((node) => node.id === nodeId);

    if (!selection || !behavior || !targetNode) {
      return;
    }

    const nextScale = Math.max(transformRef.current.k, 1.1);
    const nextTransform = zoomIdentity
      .translate(
        viewportRef.current.width / 2 - targetNode.x * nextScale,
        viewportRef.current.height / 2 - targetNode.y * nextScale,
      )
      .scale(nextScale);

    selection.call(behavior.transform, nextTransform);
    emitMinimapState();
  }

  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId;
    scheduleDraw();
    emitMinimapState();
  }, [selectedNodeId]);

  useEffect(() => {
    highlightedNodeIdsRef.current = highlightedNodeIds;
    scheduleDraw();
    emitMinimapState();
  }, [highlightedNodeIds]);

  useEffect(() => {
    activeEntityTypesRef.current = activeEntityTypes;
    scheduleDraw();
    emitMinimapState();
  }, [activeEntityTypes]);

  useEffect(() => {
    showEdgeLabelsRef.current = showEdgeLabels;
    scheduleDraw();
  }, [showEdgeLabels]);

  useEffect(() => {
    showNodeLabelsRef.current = showNodeLabels;
    scheduleDraw();
  }, [showNodeLabels]);

  useEffect(() => {
    focusSelectedNeighborhoodRef.current = focusSelectedNeighborhood;
    scheduleDraw();
    emitMinimapState();
  }, [focusSelectedNeighborhood]);

  useEffect(() => {
    nodePositionsRef.current = nodePositions;
  }, [nodePositions]);

  // Redraw when the page theme changes (data-theme on <html>)
  useEffect(() => {
    const observer = new MutationObserver(() => scheduleDraw());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    searchMatchIdsRef.current = [];
    scheduleDraw();
  }, [searchMatches]);

  useEffect(() => {
    searchMatchIdsRef.current = committedSearchNodeId ? [committedSearchNodeId] : [];
    scheduleDraw();

    if (committedSearchNodeId) {
      focusNode(committedSearchNodeId);
    }
  }, [committedSearchNodeId]);

  useEffect(() => {
    if (isActive) {
      resizeCanvasRef.current?.();
      scheduleDraw();
      emitMinimapState();
    }
  }, [isActive]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;

    if (!wrapper || !canvas) {
      return;
    }

    const selection = select(canvas);
    d3SelectionRef.current = selection;

    const resizeCanvas = () => {
      const width = wrapper.clientWidth;
      const height = wrapper.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      viewportRef.current = { width, height, dpr };
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const context = canvas.getContext('2d');
      if (context) {
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      scheduleDraw();
      if (!userAdjustedViewportRef.current && nodesRef.current.length > 0) {
        applyFitTransform();
      } else {
        emitMinimapState();
      }
    };

    resizeCanvasRef.current = resizeCanvas;

    const zoomBehavior = zoom<HTMLCanvasElement, unknown>()
      .filter((event: MouseEvent | WheelEvent) => {
        if (event.type === 'wheel') {
          return !event.ctrlKey;
        }

        // Right-click always pans.
        // Left-click only pans on empty canvas space — not on nodes
        // (so D3 drag can handle node interactions without being blocked
        // by zoom's stopImmediatePropagation).
        if ((event as MouseEvent).button === 2) return true;
        if ((event as MouseEvent).button === 0) {
          const [x, y] = pointer(event as MouseEvent, canvas);
          return !hitTest2D(nodesRef.current, x, y, transformRef.current);
        }
        return false;
      })
      .scaleExtent([0.45, 2.5])
      .on('zoom', (event: D3ZoomEvent<HTMLCanvasElement, unknown>) => {
        transformRef.current = event.transform;
        if (event.sourceEvent) {
          userAdjustedViewportRef.current = true;
        }
        scheduleDraw();
        emitMinimapState();
      });
    zoomBehaviorRef.current = zoomBehavior;

    const dragBehavior: any = drag<HTMLCanvasElement, unknown>()
      .filter((event: MouseEvent) => event.button === 0)
      .clickDistance(5)
      .subject((event: MouseEvent) => {
        const [cx, cy] = pointer(event, canvas);
        return hitTest2D(nodesRef.current, cx, cy, transformRef.current);
      })
      .on('start', (event: any, subject: any) => {
        if (!subject) {
          return;
        }

        dragActivatedRef.current = false;
        pointerButtonRef.current = event.sourceEvent?.button ?? 0;
        pointerDownRef.current = { x: event.x, y: event.y };
        const [sx, sy] = pointer(event.sourceEvent, canvas);
        clickOriginRef.current = { x: sx, y: sy };
        lastDragPointerRef.current = { x: sx, y: sy };
        subject.fx = subject.x;
        subject.fy = subject.y;
      })
      .on('drag', (event: any, subject: any) => {
        if (!subject) {
          return;
        }

        const deltaX = event.x - pointerDownRef.current.x;
        const deltaY = event.y - pointerDownRef.current.y;

        if (!dragActivatedRef.current && Math.hypot(deltaX, deltaY) < 5) {
          return;
        }

        if (!dragActivatedRef.current) {
          dragActivatedRef.current = true;
          userAdjustedViewportRef.current = true;
          if (!event.active) {
            simulationRef.current?.alphaTarget(0.28).restart();
          }
        }

        // Use actual screen position → world conversion (event.x/y in D3 drag
        // are subject-relative, not raw screen coords, so we read the source event).
        const [screenX, screenY] = pointer(event.sourceEvent, canvas);
        const pointerDeltaX = screenX - lastDragPointerRef.current.x;
        const pointerDeltaY = screenY - lastDragPointerRef.current.y;
        lastDragPointerRef.current = { x: screenX, y: screenY };
        const worldDeltaX = pointerDeltaX / transformRef.current.k;
        const worldDeltaY = pointerDeltaY / transformRef.current.k;
        const nextX = (subject.fx ?? subject.x ?? 0) + worldDeltaX;
        const nextY = (subject.fy ?? subject.y ?? 0) + worldDeltaY;
        subject.x = nextX;
        subject.y = nextY;
        subject.fx = nextX;
        subject.fy = nextY;
        scheduleDraw();
        emitMinimapState();
      })
      .on('end', (event: any, subject: any) => {
        if (!subject) {
          return;
        }

        if (dragActivatedRef.current) {
          subject.vx = 0;
          subject.vy = 0;
          subject.fx = subject.x;
          subject.fy = subject.y;
          onUpdateNodePosition(subject.id, {
            x: subject.x,
            y: subject.y,
          });
          if (!event.active) {
            simulationRef.current?.alphaTarget(0);
          }
        }

        dragActivatedRef.current = false;
        scheduleDraw();
        emitMinimapState();
      });

    selection
      .call(zoomBehavior)
      .call(dragBehavior)
      .on('contextmenu.force-graph', (event: MouseEvent) => {
        event.preventDefault();
      })
      .on('mousemove.force-graph', (event: MouseEvent) => {
        const [x, y] = pointer(event, canvas);
        const hit = hitTest2D(nodesRef.current, x, y, transformRef.current);
        const nextHoverId = hit?.id ?? null;

        if (hoverNodeIdRef.current !== nextHoverId) {
          hoverNodeIdRef.current = nextHoverId;
          scheduleDraw();
        }
      })
      .on('mouseleave.force-graph', () => {
        hoverNodeIdRef.current = null;
        scheduleDraw();
      })
      .on('mousedown.force-graph', (event: MouseEvent) => {
        const [x, y] = pointer(event, canvas);
        pointerDownRef.current = { x, y };
        clickOriginRef.current = { x, y };
        pointerButtonRef.current = event.button;
        dragActivatedRef.current = false;
      })
      .on('click.force-graph', (event: MouseEvent) => {
        // D3 zoom suppresses clicks after panning (via yesdrag) and
        // D3 drag suppresses clicks after node-dragging (via clickDistance).
        // So any click that reaches here is a genuine tap — just hit-test and select.
        const [x, y] = pointer(event, canvas);
        const hit = hitTest2D(nodesRef.current, x, y, transformRef.current);

        if (!hit) {
          onSelectNode(null);
          return;
        }

        userAdjustedViewportRef.current = true;
        onSelectNode(selectedNodeIdRef.current === hit.id ? null : hit.id);
      });

    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(wrapper);

    return () => {
      resizeObserver.disconnect();
      selection.on('.force-graph', null);
      d3SelectionRef.current = null;
      zoomBehaviorRef.current = null;
      resizeCanvasRef.current = null;
    };
  }, [onMinimapStateChange, onSelectNode, onUpdateNodePosition]);

  useEffect(() => {
    if (nodesRef.current.length === 0) {
      return;
    }

    let changed = false;
    for (const node of nodesRef.current) {
      const override = nodePositionsRef.current[node.id];
      if (!override) {
        continue;
      }

      if (node.x !== override.x || node.y !== override.y || node.fx !== override.x || node.fy !== override.y) {
        node.x = override.x;
        node.y = override.y;
        node.fx = override.x;
        node.fy = override.y;
        node.vx = 0;
        node.vy = 0;
        changed = true;
      }
    }

    if (changed) {
      simulationRef.current?.alphaTarget(0).restart();
      scheduleDraw();
      emitMinimapState();
    }
  }, [nodePositions]);

  useEffect(() => {
    const bundle = createForceSimulation(graph.nodes, graph.edges);
    nodesRef.current = bundle.nodes;
    edgesRef.current = bundle.edges;
    simulationRef.current = bundle.simulation;
    userAdjustedViewportRef.current = false;

    bundle.simulation.on('tick', () => {
      scheduleDraw();
    });

    for (const node of bundle.nodes) {
      const override = nodePositionsRef.current[node.id];
      if (!override) {
        continue;
      }

      node.x = override.x;
      node.y = override.y;
      node.fx = override.x;
      node.fy = override.y;
      node.vx = 0;
      node.vy = 0;
    }

    window.requestAnimationFrame(() => {
      applyFitTransform();
      scheduleDraw();
      emitMinimapState();
    });

    return () => {
      bundle.simulation.stop();
      bundle.simulation.on('tick', null);
      simulationRef.current = null;
      nodesRef.current = [];
      edgesRef.current = [];
    };
  }, [graph, onMinimapStateChange]);

  return (
    <div
      data-testid="graph-renderer-2d"
      ref={wrapperRef}
      className="relative h-full overflow-hidden bg-shell-bg"
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-grab active:cursor-grabbing"
      />
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-shell-pill border border-shell-border bg-shell-surface/80 px-3 py-1.5 text-xs text-shell-text-muted backdrop-blur">
        Drag nodes to reposition · Drag empty space to pan · Scroll to zoom
      </div>
      {selectedNode ? (
        <div className="pointer-events-none absolute left-4 top-4 rounded-shell-pill border border-shell-accent/30 bg-shell-accent-muted px-3 py-1.5 text-sm text-shell-text-primary shadow-shell-sm">
          <span className="text-shell-text-secondary">Active node:</span>{' '}
          <span className="font-medium">{selectedNode.label}</span>
        </div>
      ) : null}
      <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => {
            userAdjustedViewportRef.current = false;
            applyFitTransform();
          }}
          className="rounded-shell-lg border border-shell-accent/25 bg-shell-accent-muted px-3 py-1.5 text-xs font-semibold text-shell-text-primary transition hover:border-shell-accent"
        >
          Zoom to Fit
        </button>
      </div>
    </div>
  );
});

export default ForceGraph2D;
