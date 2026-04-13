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

interface PointerState {
  x: number;
  y: number;
}

export interface ForceGraph2DExportHandle {
  getCanvas: () => HTMLCanvasElement | null;
  redrawForExport: () => void;
  captureDataUrl: () => string | null;
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
  showEdgeLabels?: boolean;
  showNodeLabels?: boolean;
  focusSelectedNeighborhood?: boolean;
  isActive: boolean;
  onSearchQueryChange: (value: string) => void;
  onCommitSearchSelection: (nodeId: string) => void;
  onSelectNode: (nodeId: string | null) => void;
  onMinimapStateChange?: (state: GraphMinimapState) => void;
}>(function ForceGraph2D({
  graph,
  selectedNodeId,
  highlightedNodeIds,
  activeEntityTypes = ENTITY_FILTER_OPTIONS,
  searchQuery,
  committedSearchNodeId,
  showEdgeLabels = true,
  showNodeLabels = true,
  focusSelectedNeighborhood = true,
  isActive,
  onSearchQueryChange,
  onCommitSearchSelection,
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
  const hoverNodeIdRef = useRef<string | null>(null);
  const pointerDownRef = useRef<PointerState>({ x: 0, y: 0 });
  const pointerButtonRef = useRef<number>(0);
  const dragActivatedRef = useRef(false);
  const userAdjustedViewportRef = useRef(false);
  const viewportRef = useRef({ width: 0, height: 0, dpr: 1 });

  const searchMatches = useMemo(() => getSearchMatches(graph.nodes, searchQuery), [graph.nodes, searchQuery]);
  const visibleSearchMatches = useMemo(() => searchMatches.slice(0, 6), [searchMatches]);
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

    onMinimapStateChange({
      label: '2D',
      points: nodesRef.current.map((node) => ({
        id: node.id,
        x: (node.x - bounds.minX) / width,
        y: (node.y - bounds.minY) / height,
        color: node.color,
        active: selectedNodeIdRef.current === node.id,
        dimmed: !activeEntityTypesRef.current.includes(node.type),
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

        return event.button === 0 || event.button === 2;
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
      .subject((event: MouseEvent) => hitTest2D(nodesRef.current, event.x, event.y, transformRef.current))
      .on('start', (event: any, subject: any) => {
        if (!subject) {
          return;
        }

        event.sourceEvent?.stopPropagation?.();
        dragActivatedRef.current = false;
        pointerDownRef.current = { x: event.x, y: event.y };
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

        const worldX = (event.x - transformRef.current.x) / transformRef.current.k;
        const worldY = (event.y - transformRef.current.y) / transformRef.current.k;
        subject.fx = worldX;
        subject.fy = worldY;
        scheduleDraw();
        emitMinimapState();
      })
      .on('end', (event: any, subject: any) => {
        if (!subject) {
          return;
        }

        if (dragActivatedRef.current) {
          subject.fx = null;
          subject.fy = null;
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
        pointerButtonRef.current = event.button;
        dragActivatedRef.current = false;
      })
      .on('click.force-graph', (event: MouseEvent) => {
        if (pointerButtonRef.current !== 0) {
          return;
        }

        const [x, y] = pointer(event, canvas);
        const travel = Math.hypot(x - pointerDownRef.current.x, y - pointerDownRef.current.y);

        if (dragActivatedRef.current || travel >= 5) {
          return;
        }

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
  }, [onMinimapStateChange, onSelectNode]);

  useEffect(() => {
    const bundle = createForceSimulation(graph.nodes, graph.edges);
    nodesRef.current = bundle.nodes;
    edgesRef.current = bundle.edges;
    simulationRef.current = bundle.simulation;
    userAdjustedViewportRef.current = false;

    bundle.simulation.on('tick', () => {
      scheduleDraw();
    });

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
    <section className="rounded-shell-xl border border-shell-border bg-shell-surface p-6 shadow-shell-lg">
      <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-shell-text-muted">
            2D Renderer
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-shell-text-primary">ForceGraph2D</h2>
          <p className="mt-2 max-w-2xl text-sm text-shell-text-secondary">
            Live force simulation with selectable relationships, bounded pan/zoom, and search-centered navigation.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(240px,320px)_auto]">
          <div className="relative">
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
          <button
            type="button"
            onClick={() => {
              userAdjustedViewportRef.current = false;
              applyFitTransform();
            }}
            className="rounded-shell-lg border border-shell-accent/25 bg-shell-accent-muted px-4 py-3 text-sm font-semibold text-shell-text-primary transition hover:border-shell-accent"
          >
            Zoom to Fit
          </button>
        </div>
      </div>

      <div
        ref={wrapperRef}
        className="relative h-[620px] overflow-hidden rounded-shell-xl border border-shell-border bg-shell-bg"
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full cursor-grab active:cursor-grabbing"
        />
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-shell-pill border border-shell-border bg-shell-surface/80 px-3 py-1.5 text-xs text-shell-text-muted backdrop-blur">
          Drag nodes to reposition · Drag empty space to pan · Scroll to zoom
        </div>
        <div className="absolute right-4 top-4 rounded-shell-lg border border-shell-border bg-shell-surface/90 px-4 py-3 text-right shadow-shell-sm">
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
                : selectedNode
                  ? selectedNode.label
                : 'Select a node to inspect it'}
          </p>
        </div>
      </div>
    </section>
  );
});

export default ForceGraph2D;
