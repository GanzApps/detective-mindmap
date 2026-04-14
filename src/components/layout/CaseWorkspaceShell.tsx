'use client';

import ConnectionModal from '@/components/crud/ConnectionModal';
import DeleteConfirmDialog from '@/components/crud/DeleteConfirmDialog';
import EntityModal from '@/components/crud/EntityModal';
import GraphWorkspace from '@/components/graph/GraphWorkspace';
import { type GraphWorkspaceExportHandle } from '@/components/graph/GraphWorkspace';
import AICommandBar from '@/components/layout/AICommandBar';
import CaseHeader from '@/components/layout/CaseHeader';
import EvidenceSidebar from '@/components/layout/EvidenceSidebar';
import TimelineBar from '@/components/layout/TimelineBar';
import WorkspaceAnalysisPanel from '@/components/layout/WorkspaceAnalysisPanel';
import WorkspaceFiltersPanel from '@/components/layout/WorkspaceFiltersPanel';
import { type AIResultPayload, type CommandHistoryEntry, type QuickCommandSuggestion } from '@/lib/ai/knownIntents';
import { type Case, type EvidenceFile } from '@/lib/data/dataTypes';
import { type ExportFormat } from '@/lib/export/exportTypes';
import { getEvidenceLabel } from '@/store/caseStore';
import { type EntityStatus, type EntityType } from '@/lib/graph/graphTypes';
import {
  selectActiveFilters,
  selectLayerPreferences,
  useCaseStore,
} from '@/store/caseStore';
import { type RefObject, useMemo, useState } from 'react';

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

  const activeEvidenceFile = caseData.evidence
    .flatMap((category) => category.files)
    .find((file) => file.id === highlightedEvidenceId) ?? null;
  const graphWorkspaceProps = {
    caseData,
    viewMode,
    selectedNodeId,
    highlightedNodeIds: highlightedEntityIds,
    onSetViewMode,
    onSelectNode,
  };
  const activeEvidenceLabel = activeEvidenceFile ? getEvidenceLabel(activeEvidenceFile) : 'None selected';
  const selectedNodeLabel = selectedNode?.label ?? 'No active node';
  const evidenceFiles = caseData.evidence.flatMap((category) => category.files);
  const evidenceDates = evidenceFiles
    .map((file) => file.addedAt)
    .sort((left, right) => left.localeCompare(right));
  const dateRange = {
    from: evidenceDates[0]?.slice(0, 10) ?? caseData.createdAt.slice(0, 10),
    to: evidenceDates[evidenceDates.length - 1]?.slice(0, 10) ?? caseData.updatedAt.slice(0, 10),
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* 1. Toolbar — fixed height */}
      <div className="shrink-0">
        <CaseHeader
          caseData={caseData}
          entityCount={caseData.graph.nodes.length}
          connectionCount={caseData.graph.edges.length}
          highlightedCount={highlightedEntityIds.length}
          viewMode={viewMode}
          onSetViewMode={onSetViewMode}
          onOpenEntityModal={() => setShowEntityModal(true)}
          onOpenConnectionModal={() => setShowConnectionModal(true)}
          onClearHighlights={onClearHighlights}
          onExport={onExport}
          isExporting={isExporting}
        />
      </div>

      {/* 2. Middle row: Sidebar + Graph + Analysis — fills remaining space */}
      <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
        {/* Sidebar — fixed width, scrolls internally */}
        <div className="w-80 shrink-0 overflow-y-auto border-r border-shell-border bg-shell-surface">
          <EvidenceSidebar
            evidence={caseData.evidence}
            selectedEvidenceId={highlightedEvidenceId}
            onEvidenceSelect={onSelectEvidence}
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
          />
        </div>

        {/* Graph + bottom panels — fills remaining width */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Graph canvas — fills available space */}
          <div className="min-h-0 flex-1 overflow-hidden bg-shell-bg">
            <GraphWorkspace
              ref={graphWorkspaceRef}
              {...graphWorkspaceProps}
            />
          </div>

          {/* Entity/Connection lists — compact, below graph */}
          <div className="shrink-0 border-t border-shell-border bg-shell-surface px-shell-md py-shell-sm">
            <div className="flex gap-shell-md">
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-shell-text-muted">Entities</p>
                  <button
                    type="button"
                    onClick={() => setShowEntityModal(true)}
                    className="rounded-shell-pill border border-shell-accent/30 bg-shell-accent-muted px-3 py-1 text-xs font-semibold text-shell-text-primary transition hover:border-shell-accent"
                  >
                    Add entity
                  </button>
                </div>
                <div className="max-h-32 space-y-2 overflow-y-auto">
                  {caseData.graph.nodes.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const isHighlighted = highlightedEntityIds.includes(node.id);
                    return (
                      <div
                        key={node.id}
                        className={`rounded-shell-lg border px-3 py-2 transition ${
                          isSelected
                            ? 'border-shell-accent/40 bg-shell-accent-muted'
                            : isHighlighted
                              ? 'border-amber-400/30 bg-amber-400/10'
                              : 'border-shell-border bg-shell-bg'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectNode(isSelected ? null : node.id)}
                            className="text-left text-xs font-semibold text-shell-text-primary"
                          >
                            {node.label}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEntityToDelete(node.id)}
                            className="rounded-shell-pill border border-shell-destructive/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-shell-destructive transition hover:border-shell-destructive"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-shell-text-muted">Connections</p>
                  <button
                    type="button"
                    onClick={() => setShowConnectionModal(true)}
                    className="rounded-shell-pill border border-shell-accent/30 bg-shell-accent-muted px-3 py-1 text-xs font-semibold text-shell-text-primary transition hover:border-shell-accent"
                  >
                    Add connection
                  </button>
                </div>
                <div className="max-h-32 space-y-2 overflow-y-auto">
                  {caseData.graph.edges.map((edge) => {
                    const source = caseData.graph.nodes.find((node) => node.id === edge.source);
                    const target = caseData.graph.nodes.find((node) => node.id === edge.target);
                    return (
                      <div
                        key={edge.id}
                        className="rounded-shell-lg border border-shell-border bg-shell-bg px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-shell-text-primary">
                            {source?.label ?? edge.source} → {target?.label ?? edge.target}
                          </p>
                          <button
                            type="button"
                            onClick={() => setConnectionToDelete(edge.id)}
                            className="rounded-shell-pill border border-shell-destructive/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-shell-destructive transition hover:border-shell-destructive"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Timeline — fixed height, horizontal scroll */}
          <div className="shrink-0">
            <TimelineBar
              caseData={caseData}
              activeEvidenceLabel={activeEvidenceLabel}
              selectedNodeLabel={selectedNodeLabel}
              highlightedCount={highlightedEntityIds.length}
            />
          </div>

          {/* 4. AI Command Bar — fixed height */}
          <div className="shrink-0">
            <AICommandBar
              quickCommands={aiQuickCommands}
              recentCommands={commandHistory}
              status={commandStatus}
              statusMessage={commandStatusMessage}
              onExecute={onExecuteCommand}
            />
          </div>
        </div>

        {/* Analysis panel — fixed width, scrolls internally */}
        <div className="w-80 shrink-0 overflow-y-auto border-l border-shell-border bg-shell-surface">
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
