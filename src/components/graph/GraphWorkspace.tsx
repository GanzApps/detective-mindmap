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
  onSetViewMode,
  onSelectNode,
}, ref) {
  const [searchQuery, setSearchQuery] = useState('');
  const [committedSearchNodeId, setCommittedSearchNodeId] = useState<string | null>(null);
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
  const selectedNode = useMemo(
    () => caseData.graph.nodes.find((node) => node.id === selectedNodeId) ?? null,
    [caseData.graph.nodes, selectedNodeId],
  );
  const activeEntityTypes = useMemo(
    () => [...activeFilters],
    [activeFilters],
  );

  useEffect(() => {
    setSearchQuery('');
    setCommittedSearchNodeId(null);
  }, [caseData.id]);

  useEffect(() => {
    if (selectedNodeId === null) {
      setCommittedSearchNodeId(null);
    }
  }, [selectedNodeId]);

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
    if (nodeId === null) {
      setCommittedSearchNodeId(null);
    }

    onSelectNode(nodeId);
  }, [onSelectNode]);

  const handleCommitSearchSelection = useCallback((nodeId: string) => {
    const match = caseData.graph.nodes.find((node) => node.id === nodeId);
    setCommittedSearchNodeId(nodeId);
    setSearchQuery(match?.label ?? '');
    onSelectNode(nodeId);
  }, [caseData.graph.nodes, onSelectNode]);

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

  return (
    <div data-testid="graph-workspace" className="relative">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-shell-text-muted">
            Graph workspace
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-shell-text-primary">Dual renderer continuity</h2>
          <p className="mt-2 max-w-2xl text-sm text-shell-text-secondary">
            Both graph systems stay mounted so camera, simulation, and selection context persist while you switch views.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-shell-pill border border-shell-border bg-shell-surface px-4 py-2 text-sm text-shell-text-secondary">
            {highlightedNodeIds.length} highlighted
          </div>
          <div className="flex rounded-shell-pill border border-shell-border bg-shell-surface p-1">
            <button
              type="button"
              onClick={() => onSetViewMode('2d')}
              className={`rounded-shell-pill px-4 py-2 text-sm font-medium transition ${
                viewMode === '2d'
                  ? 'bg-shell-accent text-white'
                  : 'text-shell-text-secondary hover:bg-shell-surface-raised'
              }`}
            >
              2D workspace
            </button>
            <button
              type="button"
              onClick={() => onSetViewMode('3d')}
              className={`rounded-shell-pill px-4 py-2 text-sm font-medium transition ${
                viewMode === '3d'
                  ? 'bg-shell-accent text-white'
                  : 'text-shell-text-secondary hover:bg-shell-surface-raised'
              }`}
            >
              3D workspace
            </button>
          </div>
        </div>
      </div>

      <div className="relative min-h-[680px]">
        <div
          ref={forceGraphContainerRef}
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
            showEdgeLabels={layerPreferences.showEdgeLabels}
            showNodeLabels={layerPreferences.showNodeLabels}
            focusSelectedNeighborhood={layerPreferences.focusSelectedNeighborhood}
            isActive={viewMode === '2d'}
            onSearchQueryChange={setSearchQuery}
            onCommitSearchSelection={handleCommitSearchSelection}
            onSelectNode={handleSelectNode}
            onMinimapStateChange={handle2DMinimapStateChange}
          />
        </div>
        <div
          ref={mindMapContainerRef}
          style={{ display: viewMode === '3d' ? 'block' : 'none' }}
        >
          <MindMap3D
            ref={mindMapRef}
            graph={caseData.graph}
            selectedNodeId={selectedNodeId}
            highlightedNodeIds={highlightedNodeIds}
            activeEntityTypes={activeEntityTypes}
            showNodeLabels={layerPreferences.showNodeLabels}
            focusSelectedNeighborhood={layerPreferences.focusSelectedNeighborhood}
            isActive={viewMode === '3d'}
            onSelectNode={handleSelectNode}
            onMinimapStateChange={handle3DMinimapStateChange}
          />
        </div>

        <GraphMinimap state={minimapState} />

        {selectedNode ? (
          <div className="pointer-events-none absolute left-6 top-6 z-10 rounded-shell-pill border border-shell-accent/30 bg-shell-accent-muted px-4 py-2 text-sm text-shell-text-primary shadow-shell-sm">
            Active node: {selectedNode.label}
          </div>
        ) : null}
      </div>
    </div>
  );
});

export default GraphWorkspace;
