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
import { type Case, type EvidenceFile } from '@/lib/data/dataTypes';
import { type ExportFormat } from '@/lib/export/exportTypes';
import { getEvidenceLabel } from '@/store/caseStore';
import { type EntityStatus, type EntityType } from '@/lib/graph/graphTypes';
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
}) {
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<string | null>(null);
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(null);

  const selectedNode = useMemo(() => (
    caseData.graph.nodes.find((node) => node.id === selectedNodeId) ?? null
  ), [caseData.graph.nodes, selectedNodeId]);

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

  return (
    <div className="mx-auto max-w-7xl space-y-shell-md">
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

      <div className="grid gap-shell-md lg:grid-cols-[320px_minmax(0,1fr)]">
        <EvidenceSidebar
          evidence={caseData.evidence}
          selectedEvidenceId={highlightedEvidenceId}
          onEvidenceSelect={onSelectEvidence}
        />

        <div className="space-y-shell-md">
          <GraphWorkspace
            ref={graphWorkspaceRef}
            {...graphWorkspaceProps}
          />

          <div className="space-y-shell-sm">
            <TimelineBar
              caseData={caseData}
              activeEvidenceLabel={activeEvidenceLabel}
              selectedNodeLabel={selectedNodeLabel}
              highlightedCount={highlightedEntityIds.length}
            />
            <AICommandBar />
          </div>

          <section className="grid gap-shell-md xl:grid-cols-2">
            {/* Entities panel */}
            <div className="rounded-shell-xl border border-shell-border bg-shell-surface p-shell-md shadow-shell-sm">
              <div className="mb-shell-md flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-shell-text-muted">
                    Entities
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-shell-text-primary">
                    Graph Nodes
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEntityModal(true)}
                  className="rounded-shell-pill border border-shell-accent/30 bg-shell-accent-muted px-shell-md py-shell-sm text-sm font-semibold text-shell-accent transition hover:border-shell-accent"
                >
                  Add entity
                </button>
              </div>
              <div className="space-y-shell-sm">
                {caseData.graph.nodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const isHighlighted = highlightedEntityIds.includes(node.id);

                  return (
                    <div
                      key={node.id}
                      className={`rounded-shell-lg border px-shell-md py-shell-sm transition ${
                        isSelected
                          ? 'border-shell-accent/40 bg-shell-accent-muted'
                          : isHighlighted
                            ? 'border-amber-400/30 bg-amber-400/10'
                            : 'border-shell-border bg-shell-surface-raised'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-shell-sm">
                        <button
                          type="button"
                          onClick={() => onSelectNode(isSelected ? null : node.id)}
                          className="text-left"
                        >
                          <p className="text-sm font-semibold text-shell-text-primary">{node.label}</p>
                          <p className="mt-1 text-xs uppercase tracking-widest text-shell-text-muted">
                            {node.type} · {node.status}
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEntityToDelete(node.id)}
                          className="rounded-shell-pill border border-shell-destructive/20 px-shell-sm py-1 text-xs uppercase tracking-widest text-shell-destructive transition hover:border-shell-destructive/60"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Connections panel */}
            <div className="rounded-shell-xl border border-shell-border bg-shell-surface p-shell-md shadow-shell-sm">
              <div className="mb-shell-md flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-shell-text-muted">
                    Connections
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-shell-text-primary">
                    Relationship Edges
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConnectionModal(true)}
                  className="rounded-shell-pill border border-shell-accent/30 bg-shell-accent-muted px-shell-md py-shell-sm text-sm font-semibold text-shell-accent transition hover:border-shell-accent"
                >
                  Add connection
                </button>
              </div>
              <div className="space-y-shell-sm">
                {caseData.graph.edges.map((edge) => {
                  const source = caseData.graph.nodes.find((node) => node.id === edge.source);
                  const target = caseData.graph.nodes.find((node) => node.id === edge.target);

                  return (
                    <div
                      key={edge.id}
                      className="rounded-shell-lg border border-shell-border bg-shell-surface-raised px-shell-md py-shell-sm"
                    >
                      <div className="flex items-start justify-between gap-shell-sm">
                        <div>
                          <p className="text-sm font-semibold text-shell-text-primary">
                            {source?.label ?? edge.source} → {target?.label ?? edge.target}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-widest text-shell-text-muted">
                            {edge.label} · strength {edge.strength.toFixed(1)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setConnectionToDelete(edge.id)}
                          className="rounded-shell-pill border border-shell-destructive/20 px-shell-sm py-1 text-xs uppercase tracking-widest text-shell-destructive transition hover:border-shell-destructive/60"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

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
