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
  getBestSearchMatch,
  getGraphBounds,
  getSearchMatches,
  hitTest2D,
  type ForceGraphEdgeDatum,
  type ForceGraphNodeDatum,
} from '@/lib/graph/forceSimulation';
import { type EntityType, type GraphData } from '@/lib/graph/graphTypes';
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
  showEdgeLabels?: boolean;
  showNodeLabels?: boolean;
  focusSelectedNeighborhood?: boolean;
  isActive: boolean;
  onSearchQueryChange: (value: string) => void;
  onSelectNode: (nodeId: string | null) => void;
}>(function ForceGraph2D({
  graph,
  selectedNodeId,
  highlightedNodeIds,
  activeEntityTypes = ENTITY_FILTER_OPTIONS,
  searchQuery,
  showEdgeLabels = true,
  showNodeLabels = true,
  focusSelectedNeighborhood = true,
  isActive,
  onSearchQueryChange,
  onSelectNode,
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
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const selectedNodeIdRef = useRef<string | null>(selectedNodeId);
  const highlightedNodeIdsRef = useRef<string[]>(highlightedNodeIds);
  const activeEntityTypesRef = useRef<EntityType[]>(activeEntityTypes);
  const searchMatchIdsRef = useRef<string[]>([]);
  const showEdgeLabelsRef = useRef(showEdgeLabels);
  const showNodeLabelsRef = useRef(showNodeLabels);
  const focusSelectedNeighborhoodRef = useRef(focusSelectedNeighborhood);
  const hoverNodeIdRef = useRef<string | null>(null);
  const pointerDownRef = useRef<PointerState>({ x: 0, y: 0 });
  const dragActivatedRef = useRef(false);
  const userAdjustedViewportRef = useRef(false);
  const viewportRef = useRef({ width: 0, height: 0, dpr: 1 });

  const searchMatches = useMemo(() => getSearchMatches(graph.nodes, searchQuery), [graph.nodes, searchQuery]);
  const bestSearchMatchId = useMemo(() => getBestSearchMatch(graph.nodes, searchQuery)?.id ?? null, [graph.nodes, searchQuery]);

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
  }

  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId;
    scheduleDraw();
  }, [selectedNodeId]);

  useEffect(() => {
    highlightedNodeIdsRef.current = highlightedNodeIds;
    scheduleDraw();
  }, [highlightedNodeIds]);

  useEffect(() => {
    activeEntityTypesRef.current = activeEntityTypes;
    scheduleDraw();
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
  }, [focusSelectedNeighborhood]);

  useEffect(() => {
    searchMatchIdsRef.current = searchMatches.map((node) => node.id);
    scheduleDraw();

    if (bestSearchMatchId) {
      focusNode(bestSearchMatchId);
    }
  }, [bestSearchMatchId, searchMatches]);

  useEffect(() => {
    if (isActive) {
      scheduleDraw();
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
      }
    };

    const zoomBehavior = zoom<HTMLCanvasElement, unknown>()
      .filter((event) => !event.button && (!event.ctrlKey || event.type === 'wheel'))
      .scaleExtent([0.45, 2.5])
      .on('zoom', (event: D3ZoomEvent<HTMLCanvasElement, unknown>) => {
        transformRef.current = event.transform;
        if (event.sourceEvent) {
          userAdjustedViewportRef.current = true;
        }
        scheduleDraw();
      });
    zoomBehaviorRef.current = zoomBehavior;

    const dragBehavior: any = drag<HTMLCanvasElement, unknown>()
      .filter((event: MouseEvent) => !event.button)
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
      });

    selection
      .call(zoomBehavior)
      .call(dragBehavior)
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
        dragActivatedRef.current = false;
      })
      .on('mouseup.force-graph', (event: MouseEvent) => {
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
    resizeObserverRef.current = resizeObserver;

    return () => {
      resizeObserver.disconnect();
      resizeObserverRef.current = null;
      selection.on('.force-graph', null);
      d3SelectionRef.current = null;
      zoomBehaviorRef.current = null;
    };
  }, [onSelectNode]);

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
    });

    return () => {
      bundle.simulation.stop();
      bundle.simulation.on('tick', null);
      simulationRef.current = null;
      nodesRef.current = [];
      edgesRef.current = [];
    };
  }, [graph]);

  return (
    <section className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
      <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
            2D Renderer
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-50">ForceGraph2D</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Live force simulation with selectable relationships, bounded pan/zoom, and search-centered navigation.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(240px,320px)_auto]">
          <label className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Search nodes</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search nodes"
              className="mt-2 w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              userAdjustedViewportRef.current = false;
              applyFitTransform();
            }}
            className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-300/10"
          >
            Zoom to Fit
          </button>
        </div>
      </div>

      <div
        ref={wrapperRef}
        className="relative h-[620px] overflow-hidden rounded-[1.75rem] border border-slate-800 bg-[#040712]"
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full cursor-grab active:cursor-grabbing"
        />
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs text-white/45 backdrop-blur">
          Drag nodes to reposition · Drag empty space to pan · Scroll to zoom
        </div>
        <div className="absolute right-4 top-4 rounded-2xl border border-white/10 bg-[rgba(9,14,25,0.88)] px-4 py-3 text-right shadow-xl shadow-black/20">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/70">
            Search status
          </p>
          <p className="mt-2 text-sm text-slate-100">
            {searchQuery.trim()
              ? `${searchMatches.length} match${searchMatches.length === 1 ? '' : 'es'}`
              : 'No search active'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {bestSearchMatchId
              ? `Centered on ${graph.nodes.find((node) => node.id === bestSearchMatchId)?.label ?? 'best match'}`
              : selectedNodeId
                ? graph.nodes.find((node) => node.id === selectedNodeId)?.label ?? 'Selected node'
                : 'Select a node to inspect it'}
          </p>
        </div>
      </div>
    </section>
  );
});

export default ForceGraph2D;
