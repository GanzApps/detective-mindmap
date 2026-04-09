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
    <div className="mx-auto max-w-7xl space-y-6">
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

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <EvidenceSidebar
          evidence={caseData.evidence}
          selectedEvidenceId={highlightedEvidenceId}
          onEvidenceSelect={onSelectEvidence}
        />

        <div className="space-y-6">
          <GraphWorkspace
            ref={graphWorkspaceRef}
            {...graphWorkspaceProps}
          />

          <div className="space-y-4">
            <TimelineBar
              caseData={caseData}
              activeEvidenceLabel={activeEvidenceLabel}
              selectedNodeLabel={selectedNodeLabel}
              highlightedCount={highlightedEntityIds.length}
            />
            <AICommandBar />
          </div>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/30">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
                    Entities
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-50">
                    Graph Nodes
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEntityModal(true)}
                  className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300"
                >
                  Add entity
                </button>
              </div>
              <div className="space-y-3">
                {caseData.graph.nodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const isHighlighted = highlightedEntityIds.includes(node.id);

                  return (
                    <div
                      key={node.id}
                      className={`rounded-3xl border px-4 py-4 transition ${
                        isSelected
                          ? 'border-cyan-400/40 bg-cyan-400/10'
                          : isHighlighted
                            ? 'border-amber-400/30 bg-amber-400/10'
                            : 'border-slate-800 bg-slate-950/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => onSelectNode(isSelected ? null : node.id)}
                          className="text-left"
                        >
                          <p className="text-sm font-semibold text-slate-50">{node.label}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                            {node.type} · {node.status}
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEntityToDelete(node.id)}
                          className="rounded-full border border-rose-500/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-rose-200 transition hover:border-rose-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/30">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
                    Connections
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-50">
                    Relationship Edges
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConnectionModal(true)}
                  className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300"
                >
                  Add connection
                </button>
              </div>
              <div className="space-y-3">
                {caseData.graph.edges.map((edge) => {
                  const source = caseData.graph.nodes.find((node) => node.id === edge.source);
                  const target = caseData.graph.nodes.find((node) => node.id === edge.target);

                  return (
                    <div
                      key={edge.id}
                      className="rounded-3xl border border-slate-800 bg-slate-950/70 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-50">
                            {source?.label ?? edge.source} → {target?.label ?? edge.target}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                            {edge.label} · strength {edge.strength.toFixed(1)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setConnectionToDelete(edge.id)}
                          className="rounded-full border border-rose-500/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-rose-200 transition hover:border-rose-400"
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
