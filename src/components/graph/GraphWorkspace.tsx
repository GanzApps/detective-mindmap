'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { type ForceGraph2DExportHandle } from '@/components/graph/ForceGraph2D';
import MindMap3D, { type MindMap3DExportHandle } from '@/components/graph/MindMap3D';
import NodeDetailPanel from '@/components/graph/NodeDetailPanel';
import { type Case } from '@/lib/data/dataTypes';
import { type EntityType } from '@/lib/graph/graphTypes';
import {
  ENTITY_FILTER_OPTIONS,
  selectActiveFilters,
  selectLayerPreferences,
  type LayerPreferences,
  type ViewMode,
  useCaseStore,
} from '@/store/caseStore';

export function shouldDismissNodeDetail(key: string) {
  return key === 'Escape';
}

function formatEntityTypeLabel(type: EntityType) {
  return type.charAt(0).toUpperCase() + type.slice(1);
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

function FilterPanel({
  activeFilters,
  layerPreferences,
  typeCounts,
  onToggleEntityFilter,
  onSetActiveFilters,
  onSetLayerPreference,
}: {
  activeFilters: EntityType[];
  layerPreferences: LayerPreferences;
  typeCounts: Map<EntityType, number>;
  onToggleEntityFilter: (entityType: EntityType) => void;
  onSetActiveFilters: (filters: EntityType[]) => void;
  onSetLayerPreference: <K extends keyof LayerPreferences>(
    key: K,
    value: LayerPreferences[K],
  ) => void;
}) {
  return (
    <section className="mb-5 rounded-[1.75rem] border border-slate-800 bg-slate-950/65 p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
            FilterPanel
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-50">Investigation controls</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Dim the workspace by entity type and keep label or focus layers aligned across both renderers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSetActiveFilters([...ENTITY_FILTER_OPTIONS])}
            className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-300"
          >
            Show all
          </button>
          <button
            type="button"
            onClick={() => onSetActiveFilters([])}
            className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
          >
            Dim all
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {ENTITY_FILTER_OPTIONS.map((entityType) => {
          const isActive = activeFilters.includes(entityType);

          return (
            <button
              key={entityType}
              type="button"
              onClick={() => onToggleEntityFilter(entityType)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
              }`}
            >
              {formatEntityTypeLabel(entityType)}{' '}
              <span className="text-xs opacity-70">({typeCounts.get(entityType) ?? 0})</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <label className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-200">
          <span>Edge labels</span>
          <input
            type="checkbox"
            checked={layerPreferences.showEdgeLabels}
            onChange={(event) => onSetLayerPreference('showEdgeLabels', event.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-cyan-400"
          />
        </label>
        <label className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-200">
          <span>Node labels</span>
          <input
            type="checkbox"
            checked={layerPreferences.showNodeLabels}
            onChange={(event) => onSetLayerPreference('showNodeLabels', event.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-cyan-400"
          />
        </label>
        <label className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-200">
          <span>Focus selected links</span>
          <input
            type="checkbox"
            checked={layerPreferences.focusSelectedNeighborhood}
            onChange={(event) => onSetLayerPreference('focusSelectedNeighborhood', event.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-cyan-400"
          />
        </label>
      </div>
    </section>
  );
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
  const forceGraphRef = useRef<ForceGraph2DExportHandle | null>(null);
  const mindMapRef = useRef<MindMap3DExportHandle | null>(null);
  const forceGraphContainerRef = useRef<HTMLDivElement | null>(null);
  const mindMapContainerRef = useRef<HTMLDivElement | null>(null);
  const activeFilters = useCaseStore(selectActiveFilters);
  const layerPreferences = useCaseStore(selectLayerPreferences);
  const setActiveFilters = useCaseStore((state) => state.setActiveFilters);
  const toggleEntityFilter = useCaseStore((state) => state.toggleEntityFilter);
  const setLayerPreference = useCaseStore((state) => state.setLayerPreference);
  const selectedNode = useMemo(() => (
    caseData.graph.nodes.find((node) => node.id === selectedNodeId) ?? null
  ), [caseData.graph.nodes, selectedNodeId]);
  const activeEntityTypes = useMemo(
    () => [...activeFilters],
    [activeFilters],
  );
  const typeCounts = useMemo(() => {
    const counts = new Map<EntityType, number>();

    for (const entityType of ENTITY_FILTER_OPTIONS) {
      counts.set(entityType, 0);
    }

    for (const node of caseData.graph.nodes) {
      counts.set(node.type, (counts.get(node.type) ?? 0) + 1);
    }

    return counts;
  }, [caseData.graph.nodes]);

  useEffect(() => {
    setSearchQuery('');
  }, [caseData.id]);

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

  return (
    <div
      data-testid="graph-workspace"
      className="relative"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
            Graph workspace
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-50">Dual renderer continuity</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Both graph systems stay mounted so camera, simulation, and selection context persist while you switch views.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm text-slate-200">
            {highlightedNodeIds.length} highlighted
          </div>
          <div className="flex rounded-full border border-slate-700 bg-slate-950/80 p-1">
            <button
              type="button"
              onClick={() => onSetViewMode('2d')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                viewMode === '2d'
                  ? 'bg-slate-100 text-slate-950'
                  : 'text-slate-200 hover:bg-slate-900'
              }`}
            >
              2D workspace
            </button>
            <button
              type="button"
              onClick={() => onSetViewMode('3d')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                viewMode === '3d'
                  ? 'bg-slate-100 text-slate-950'
                  : 'text-slate-200 hover:bg-slate-900'
              }`}
            >
              3D workspace
            </button>
          </div>
        </div>
      </div>

      <div className="relative min-h-[680px]">
        <FilterPanel
          activeFilters={activeFilters}
          layerPreferences={layerPreferences}
          typeCounts={typeCounts}
          onToggleEntityFilter={toggleEntityFilter}
          onSetActiveFilters={setActiveFilters}
          onSetLayerPreference={setLayerPreference}
        />

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
            showEdgeLabels={layerPreferences.showEdgeLabels}
            showNodeLabels={layerPreferences.showNodeLabels}
            focusSelectedNeighborhood={layerPreferences.focusSelectedNeighborhood}
            isActive={viewMode === '2d'}
            onSearchQueryChange={setSearchQuery}
            onSelectNode={onSelectNode}
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
            onSelectNode={onSelectNode}
          />
        </div>

        <div className={`pointer-events-none absolute right-6 top-40 z-20 transition-opacity ${selectedNode ? 'opacity-100' : 'opacity-0'}`}>
          <div className="pointer-events-auto">
            <NodeDetailPanel
              graph={caseData.graph}
              node={selectedNode}
              highlightedNodeIds={highlightedNodeIds}
              onDismiss={() => onSelectNode(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default GraphWorkspace;
