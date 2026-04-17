'use client';

import ConnectionModal from '@/components/crud/ConnectionModal';
import DeleteConfirmDialog from '@/components/crud/DeleteConfirmDialog';
import EntityModal from '@/components/crud/EntityModal';
import GraphWorkspace from '@/components/graph/GraphWorkspace';
import { type GraphWorkspaceExportHandle } from '@/components/graph/GraphWorkspace';
import AICommandBar from '@/components/layout/AICommandBar';
import EntitiesPanel from '@/components/layout/EntitiesPanel';
import EvidenceSidebar from '@/components/layout/EvidenceSidebar';
import TimelineBar from '@/components/layout/TimelineBar';
import WorkspaceAnalysisPanel from '@/components/layout/WorkspaceAnalysisPanel';
import WorkspaceFiltersPanel from '@/components/layout/WorkspaceFiltersPanel';
import { type AIResultPayload, type CommandHistoryEntry, type QuickCommandSuggestion } from '@/lib/ai/knownIntents';
import { type Case, type EvidenceFile } from '@/lib/data/dataTypes';
import { type ExportFormat } from '@/lib/export/exportTypes';
import { getSearchMatches } from '@/lib/graph/forceSimulation';
import { getEvidenceLabel } from '@/store/caseStore';
import { type EntityStatus, type EntityType } from '@/lib/graph/graphTypes';
import {
  selectActiveFilters,
  selectLayerPreferences,
  useCaseStore,
} from '@/store/caseStore';
import { type RefObject, useEffect, useMemo, useState } from 'react';

export default function CaseWorkspaceShell({
  caseData,
  highlightedEvidenceId,
  highlightedEntityIds,
  selectedNodeId,
  viewMode,
  onSetViewMode,
  onSelectEvidence,
  onCreateEntity,
  onCreateConnection,
  onDeleteEntity,
  onDeleteConnection,
  onSelectNode,
  onClearHighlights,
  onExport,
  isExporting,
  graphWorkspaceRef,
  aiResult,
  aiQuickCommands,
  commandHistory,
  commandStatus,
  commandStatusMessage,
  onExecuteCommand,
  onDismissAIResult,
}: {
  caseData: Case;
  highlightedEvidenceId: string | null;
  highlightedEntityIds: string[];
  selectedNodeId: string | null;
  viewMode: '2d' | '3d';
  onSetViewMode: (viewMode: '2d' | '3d') => void;
  onSelectEvidence: (file: EvidenceFile) => void;
  onCreateEntity: (input: {
    label: string;
    type: EntityType;
    status: EntityStatus;
    parent: string | null;
    properties: Record<string, string>;
  }) => void;
  onCreateConnection: (input: {
    source: string;
    target: string;
    label: string;
  }) => void;
  onDeleteEntity: (entityId: string) => void;
  onDeleteConnection: (connectionId: string) => void;
  onSelectNode: (nodeId: string | null) => void;
  onClearHighlights: () => void;
  onExport: (format: ExportFormat) => void;
  isExporting: boolean;
  graphWorkspaceRef: RefObject<GraphWorkspaceExportHandle | null>;
  aiResult: AIResultPayload | null;
  aiQuickCommands: QuickCommandSuggestion[];
  commandHistory: CommandHistoryEntry[];
  commandStatus: 'idle' | 'running' | 'complete' | 'failed';
  commandStatusMessage: string;
  onExecuteCommand: (command: string) => void;
  onDismissAIResult: () => void;
}) {
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<string | null>(null);
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(null);
  // Collapsible panels — default: sidebar open, analysis panel hidden
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [committedSearchNodeId, setCommittedSearchNodeId] = useState<string | null>(null);
  // Expandable connections section inside sidebar
  const [connectionsExpanded, setConnectionsExpanded] = useState(false);
  const activeFilters = useCaseStore(selectActiveFilters);
  const layerPreferences = useCaseStore(selectLayerPreferences);
  const toggleEntityFilter = useCaseStore((state) => state.toggleEntityFilter);
  const setLayerPreference = useCaseStore((state) => state.setLayerPreference);

  const selectedNode = useMemo(() => (
    caseData.graph.nodes.find((node) => node.id === selectedNodeId) ?? null
  ), [caseData.graph.nodes, selectedNodeId]);
  const typeCounts = useMemo(() => {
    const counts = new Map<EntityType, number>();

    for (const node of caseData.graph.nodes) {
      counts.set(node.type, (counts.get(node.type) ?? 0) + 1);
    }

    return counts;
  }, [caseData.graph.nodes]);
  const searchMatches = useMemo(
    () => getSearchMatches(caseData.graph.nodes, searchQuery),
    [caseData.graph.nodes, searchQuery],
  );
  const visibleSearchMatches = useMemo(
    () => searchMatches.slice(0, 6),
    [searchMatches],
  );

  const activeEvidenceFile = caseData.evidence
    .flatMap((category) => category.files)
    .find((file) => file.id === highlightedEvidenceId) ?? null;
  const graphWorkspaceProps = {
    caseData,
    viewMode,
    selectedNodeId,
    highlightedNodeIds: highlightedEntityIds,
    searchQuery,
    committedSearchNodeId,
    showMinimap,
    onSetViewMode,
    onSelectNode,
  };
  const evidenceFiles = caseData.evidence.flatMap((category) => category.files);
  const evidenceDates = evidenceFiles
    .map((file) => file.addedAt)
    .sort((left, right) => left.localeCompare(right));
  const dateRange = {
    from: evidenceDates[0]?.slice(0, 10) ?? caseData.createdAt.slice(0, 10),
    to: evidenceDates[evidenceDates.length - 1]?.slice(0, 10) ?? caseData.updatedAt.slice(0, 10),
  };

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
    if (selectedNodeId !== null || aiResult !== null) {
      setAnalysisOpen(true);
    } else {
      setAnalysisOpen(false);
    }
  }, [selectedNodeId, aiResult]);

  const searchPanel = (
    <div className="relative">
      <label className="block rounded-shell-lg border border-shell-border bg-shell-surface-raised px-4 py-3">
        <span className="sr-only">Search graph nodes</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search nodes"
          className="w-full bg-transparent text-sm text-shell-text-primary outline-none placeholder:text-shell-text-muted"
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
                    onClick={() => {
                      setCommittedSearchNodeId(node.id);
                      setSearchQuery(node.label);
                      onSelectNode(node.id);
                    }}
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
  );

  return (
    <div className="flex h-full w-full flex-col">
      {/* 1. Compact Toolbar — strip style */}
      <div className="flex shrink-0 items-center justify-between border-b border-shell-border bg-shell-surface px-3 py-1.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="rounded p-1 text-shell-text-muted transition hover:bg-shell-surface-raised hover:text-shell-text-secondary"
            title="Toggle sidebar"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-shell-text-primary">{caseData.name}</h1>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium ${
              caseData.status === 'active'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : caseData.status === 'closed'
                  ? 'border-shell-border bg-shell-surface-raised text-shell-text-muted'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-400'
            }`}>
              {caseData.status}
            </span>
          </div>
          <span className="text-xs text-shell-text-muted">{caseData.graph.nodes.length} entities · {caseData.graph.edges.length} connections</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-shell-border bg-shell-bg p-0.5">
            <button
              type="button"
              onClick={() => onSetViewMode('2d')}
              className={`rounded px-2 py-1 text-xs font-medium transition ${viewMode === '2d' ? 'bg-shell-accent text-white' : 'text-shell-text-muted hover:text-shell-text-secondary'}`}
            >
              2D
            </button>
            <button
              type="button"
              onClick={() => onSetViewMode('3d')}
              className={`rounded px-2 py-1 text-xs font-medium transition ${viewMode === '3d' ? 'bg-shell-accent text-white' : 'text-shell-text-muted hover:text-shell-text-secondary'}`}
            >
              3D
            </button>
          </div>
          <button
            type="button"
            onClick={() => onExport('png')}
            disabled={isExporting}
            className="rounded-lg border border-shell-border px-3 py-1 text-xs font-medium text-shell-text-secondary transition hover:bg-shell-surface-raised disabled:opacity-50"
          >
            {isExporting ? 'Exporting…' : 'Export'}
          </button>
          <button
            type="button"
            onClick={() => setShowEntityModal(true)}
            className="rounded-lg bg-shell-accent px-3 py-1 text-xs font-semibold text-white transition hover:bg-shell-accent-hover"
          >
            + Entity
          </button>
          <div className="flex rounded-lg border border-shell-border bg-shell-bg p-0.5">
            <button
              type="button"
              onClick={() => setShowMinimap((v) => !v)}
              className={`rounded px-2 py-1 text-xs font-medium transition ${showMinimap ? 'bg-shell-accent text-white' : 'text-shell-text-muted hover:text-shell-text-secondary'}`}
              title="Toggle minimap"
            >
              Minimap
            </button>
          </div>
        </div>
      </div>

      {/* 2. Middle row: Sidebar + Graph + Analysis */}
      <div className="flex min-h-0 flex-1 flex-row">
        {/* Sidebar — collapsible, fixed width when open */}
        {sidebarOpen && (
          <div className="flex w-80 shrink-0 flex-col border-r border-shell-border bg-shell-surface">
            {/* Evidence sidebar */}
            <div className="flex-1 overflow-y-auto">
              <EvidenceSidebar
                searchPanel={searchPanel}
                filtersPanel={(
                  <WorkspaceFiltersPanel
                    activeFilters={activeFilters}
                    typeCounts={typeCounts}
                    layerPreferences={layerPreferences}
                    onToggleEntityFilter={toggleEntityFilter}
                    onSetLayerPreference={setLayerPreference}
                    dateRange={dateRange}
                  />
                )}
                entitiesPanel={(
                  <EntitiesPanel
                    nodes={caseData.graph.nodes}
                    selectedNodeId={selectedNodeId}
                    highlightedEntityIds={highlightedEntityIds}
                    onSelectNode={onSelectNode}
                    onDeleteEntity={(id) => setEntityToDelete(id)}
                  />
                )}
              />
            </div>

            {/* Connections strip */}
            <div className="shrink-0 border-t border-shell-border">
              <button
                type="button"
                onClick={() => setConnectionsExpanded((v) => !v)}
                className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-medium text-shell-text-muted transition hover:bg-shell-surface-raised hover:text-shell-text-secondary"
              >
                <span>Connections ({caseData.graph.edges.length})</span>
                <svg className={`h-3 w-3 transition ${connectionsExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {connectionsExpanded && (
                <div className="max-h-40 overflow-y-auto px-2 pb-1.5">
                  {caseData.graph.edges.map((edge) => {
                    const source = caseData.graph.nodes.find((n) => n.id === edge.source);
                    const target = caseData.graph.nodes.find((n) => n.id === edge.target);
                    return (
                      <div key={edge.id} className="mb-1 flex items-center justify-between rounded border border-shell-border bg-shell-bg px-2 py-1.5 text-xs">
                        <span className="flex-1 truncate text-shell-text-primary">
                          {source?.label ?? '?'} → {target?.label ?? '?'}
                        </span>
                        <button type="button" onClick={() => setConnectionToDelete(edge.id)} className="ml-1 text-shell-destructive opacity-60 hover:opacity-100">×</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Center: Graph + Timeline + AI Bar */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Graph canvas — fills available space, no fixed minimum */}
          <div className="min-h-0 flex-1 bg-shell-bg">
            <GraphWorkspace
              ref={graphWorkspaceRef}
              {...graphWorkspaceProps}
            />
          </div>

          {/* Timeline — collapsible */}
          <div className="shrink-0 border-t border-shell-border">
            <TimelineBar caseData={caseData} />
          </div>

          {/* AI Command Bar — fixed height */}
          <div className="shrink-0 border-t border-shell-border">
            <AICommandBar
              quickCommands={aiQuickCommands}
              recentCommands={commandHistory}
              status={commandStatus}
              statusMessage={commandStatusMessage}
              onExecute={onExecuteCommand}
            />
          </div>
        </div>

        {/* Analysis panel — always mounted, width animates open/closed */}
        <div
          data-testid="analysis-panel-wrapper"
          className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${analysisOpen ? 'w-80' : 'w-0'}`}
        >
          <div className="flex h-full w-80 flex-col border-l border-shell-border bg-shell-surface">
            <div className="flex items-center justify-between border-b border-shell-border px-3 py-1.5">
              <span className="text-xs font-medium text-shell-text-muted">Analysis</span>
              <button
                type="button"
                onClick={() => {
                  onSelectNode(null);
                  onDismissAIResult();
                }}
                className="rounded p-1 text-shell-text-muted transition hover:text-shell-text-secondary"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <WorkspaceAnalysisPanel
                caseData={caseData}
                selectedNode={selectedNode}
                highlightedNodeIds={highlightedEntityIds}
                aiResult={aiResult}
                onDismiss={() => onSelectNode(null)}
                onDismissAIResult={onDismissAIResult}
              />
            </div>
          </div>
        </div>
      </div>

      <EntityModal
        open={showEntityModal}
        nodes={caseData.graph.nodes}
        onClose={() => setShowEntityModal(false)}
        onSubmit={onCreateEntity}
      />
      <ConnectionModal
        open={showConnectionModal}
        nodes={caseData.graph.nodes}
        onClose={() => setShowConnectionModal(false)}
        onSubmit={onCreateConnection}
      />
      <DeleteConfirmDialog
        open={entityToDelete !== null}
        title="Delete Entity"
        description="Deleting an entity also removes every connection linked to it."
        confirmLabel="Delete entity"
        onClose={() => setEntityToDelete(null)}
        onConfirm={() => {
          if (entityToDelete) {
            onDeleteEntity(entityToDelete);
          }
          setEntityToDelete(null);
        }}
      />
      <DeleteConfirmDialog
        open={connectionToDelete !== null}
        title="Delete Connection"
        description="Remove this relationship from the current case graph."
        confirmLabel="Delete connection"
        onClose={() => setConnectionToDelete(null)}
        onConfirm={() => {
          if (connectionToDelete) {
            onDeleteConnection(connectionToDelete);
          }
          setConnectionToDelete(null);
        }}
      />
    </div>
  );
}
