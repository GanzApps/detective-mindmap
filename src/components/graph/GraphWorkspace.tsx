'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { type ForceGraph2DExportHandle } from '@/components/graph/ForceGraph2D';
import GraphMinimap from '@/components/graph/GraphMinimap';
import { type GraphMinimapState } from '@/components/graph/graphMinimapTypes';
import MindMap3D, { type MindMap3DExportHandle } from '@/components/graph/MindMap3D';
import { type Case } from '@/lib/data/dataTypes';
import { ENTITY_TYPE_COLOR, type GraphData } from '@/lib/graph/graphTypes';
import {
  ENTITY_FILTER_OPTIONS,
  selectActiveFilters,
  selectLayerPreferences,
  type ViewMode,
  useCaseStore,
} from '@/store/caseStore';
import { type SharedNodePosition } from '@/lib/graph/projection3d';

export function shouldDismissNodeDetail(key: string) {
  return key === 'Escape';
}

export interface GraphWorkspaceExportHandle {
  getActiveCanvas: () => HTMLCanvasElement | null;
  getActiveCaptureElement: () => HTMLElement | null;
  redrawActiveView: () => void;
  captureActiveViewDataUrl: () => string | null;
}

interface GraphWorkspaceProps {
  caseData: Case;
  viewMode: ViewMode;
  selectedNodeId: string | null;
  highlightedNodeIds: string[];
  searchQuery: string;
  committedSearchNodeId: string | null;
  showMinimap?: boolean;
  onSetViewMode: (viewMode: ViewMode) => void;
  onSelectNode: (nodeId: string | null) => void;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function buildFallbackMinimapState(
  graph: GraphData,
  viewMode: ViewMode,
  selectedNodeId: string | null,
): GraphMinimapState {
  const total = Math.max(graph.nodes.length, 1);
  const points = graph.nodes.map((node, index) => {
    const angle = (index / total) * Math.PI * 2;
    const radius = 0.35 + (node.tier % 3) * 0.08;

    return {
      id: node.id,
      x: clamp01(0.5 + Math.cos(angle) * radius * 0.5),
      y: clamp01(0.5 + Math.sin(angle) * radius * 0.5),
      color: ENTITY_TYPE_COLOR[node.type],
      active: selectedNodeId === node.id,
    };
  });

  return {
    label: viewMode === '2d' ? '2D' : '3D',
    points,
    viewport: viewMode === '2d'
      ? { x: 0.16, y: 0.16, width: 0.58, height: 0.58 }
      : { x: 0.24, y: 0.24, width: 0.44, height: 0.44 },
  };
}

const GraphWorkspace = forwardRef<GraphWorkspaceExportHandle, GraphWorkspaceProps>(function GraphWorkspace({
  caseData,
  viewMode,
  selectedNodeId,
  highlightedNodeIds,
  searchQuery,
  committedSearchNodeId,
  showMinimap = true,
  onSetViewMode,
  onSelectNode,
}, ref) {
  const [nodePositions, setNodePositions] = useState<Record<string, SharedNodePosition>>({});
  const [minimapWidth, setMinimapWidth] = useState(144);
  const [minimapHeight, setMinimapHeight] = useState(108); // default 4:3
  const graphCanvasContainerRef = useRef<HTMLDivElement | null>(null);
  const fallbackMinimapState = useMemo(
    () => buildFallbackMinimapState(caseData.graph, viewMode, selectedNodeId),
    [caseData.graph, viewMode, selectedNodeId],
  );
  const [minimapState, setMinimapState] = useState<GraphMinimapState>(fallbackMinimapState);
  const forceGraphRef = useRef<ForceGraph2DExportHandle | null>(null);
  const mindMapRef = useRef<MindMap3DExportHandle | null>(null);
  const forceGraphContainerRef = useRef<HTMLDivElement | null>(null);
  const mindMapContainerRef = useRef<HTMLDivElement | null>(null);
  const activeFilters = useCaseStore(selectActiveFilters);
  const layerPreferences = useCaseStore(selectLayerPreferences);
  const activeEntityTypes = useMemo(
    () => [...activeFilters],
    [activeFilters],
  );

  useEffect(() => {
    setNodePositions({});
  }, [caseData.id]);

  useEffect(() => {
    const el = graphCanvasContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const w = Math.max(80, Math.min(240, Math.round(width * 0.2)));
      const h = width > 0 ? Math.round(w * height / width) : w;
      setMinimapWidth(w);
      setMinimapHeight(h);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (shouldDismissNodeDetail(event.key)) {
        onSelectNode(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSelectNode]);

  useEffect(() => {
    setMinimapState((current) => ({
      ...fallbackMinimapState,
      points: current.points.length > 0 ? current.points : fallbackMinimapState.points,
      label: viewMode === '2d' ? '2D' : '3D',
    }));
  }, [fallbackMinimapState, viewMode]);

  useImperativeHandle(ref, () => ({
    getActiveCanvas: () => (
      viewMode === '2d'
        ? forceGraphRef.current?.getCanvas() ?? null
        : mindMapRef.current?.getCanvas() ?? null
    ),
    getActiveCaptureElement: () => (
      viewMode === '2d'
        ? forceGraphContainerRef.current
        : mindMapContainerRef.current
    ),
    redrawActiveView: () => {
      if (viewMode === '2d') {
        forceGraphRef.current?.redrawForExport();
        return;
      }

      mindMapRef.current?.redrawForExport();
    },
    captureActiveViewDataUrl: () => (
      viewMode === '2d'
        ? forceGraphRef.current?.captureDataUrl() ?? null
        : mindMapRef.current?.captureDataUrl() ?? null
    ),
  }), [viewMode]);

  const handleSelectNode = useCallback((nodeId: string | null) => {
    onSelectNode(nodeId);
  }, [onSelectNode]);

  const handle2DMinimapStateChange = useCallback((nextState: GraphMinimapState) => {
    if (viewMode === '2d') {
      setMinimapState(nextState);
    }
  }, [viewMode]);

  const handle3DMinimapStateChange = useCallback((nextState: GraphMinimapState) => {
    if (viewMode === '3d') {
      setMinimapState(nextState);
    }
  }, [viewMode]);

  const handleMinimapPanTo = useCallback((nx: number, ny: number) => {
    if (viewMode === '2d') {
      forceGraphRef.current?.panTo(nx, ny);
    } else {
      mindMapRef.current?.panTo(nx, ny);
    }
  }, [viewMode]);

  const handleMinimapPanMove = useCallback((dnx: number, dny: number) => {
    if (viewMode === '2d') {
      forceGraphRef.current?.panMove(dnx, dny);
    } else {
      mindMapRef.current?.panMove(dnx, dny);
    }
  }, [viewMode]);

  const handleUpdateNodePosition = useCallback((nodeId: string, position: SharedNodePosition) => {
    setNodePositions((current) => {
      const existing = current[nodeId];
      if (existing && existing.x === position.x && existing.y === position.y) {
        return current;
      }

      return {
        ...current,
        [nodeId]: position,
      };
    });
  }, []);

  return (
    <div data-testid="graph-workspace" className="relative flex h-full flex-col">
      {/* Graph canvas fills available space — no header panel */}
      <div ref={graphCanvasContainerRef} className="relative min-h-0 flex-1">
        <div
          ref={forceGraphContainerRef}
          className="h-full"
          style={{ display: viewMode === '2d' ? 'block' : 'none' }}
        >
          <ForceGraph2D
            ref={forceGraphRef}
            graph={caseData.graph}
            selectedNodeId={selectedNodeId}
            highlightedNodeIds={highlightedNodeIds}
            activeEntityTypes={activeEntityTypes}
            searchQuery={searchQuery}
            committedSearchNodeId={committedSearchNodeId}
            nodePositions={nodePositions}
            showEdgeLabels={layerPreferences.showEdgeLabels}
            showNodeLabels={layerPreferences.showNodeLabels}
            focusSelectedNeighborhood={layerPreferences.focusSelectedNeighborhood}
            isActive={viewMode === '2d'}
            onUpdateNodePosition={handleUpdateNodePosition}
            onSelectNode={handleSelectNode}
            onMinimapStateChange={handle2DMinimapStateChange}
          />
        </div>
        <div
          ref={mindMapContainerRef}
          className="h-full"
          style={{ display: viewMode === '3d' ? 'block' : 'none' }}
        >
          <MindMap3D
            ref={mindMapRef}
            graph={caseData.graph}
            selectedNodeId={selectedNodeId}
            highlightedNodeIds={highlightedNodeIds}
            activeEntityTypes={activeEntityTypes}
            searchQuery={searchQuery}
            committedSearchNodeId={committedSearchNodeId}
            nodePositions={nodePositions}
            showNodeLabels={layerPreferences.showNodeLabels}
            focusSelectedNeighborhood={layerPreferences.focusSelectedNeighborhood}
            isActive={viewMode === '3d'}
            onUpdateNodePosition={handleUpdateNodePosition}
            onSelectNode={handleSelectNode}
            onMinimapStateChange={handle3DMinimapStateChange}
          />
        </div>

        {showMinimap && (
          <GraphMinimap
            state={minimapState}
            width={minimapWidth}
            height={minimapHeight}
            onPanTo={handleMinimapPanTo}
            onPanMove={handleMinimapPanMove}
          />
        )}
      </div>
    </div>
  );
});

export default GraphWorkspace;
