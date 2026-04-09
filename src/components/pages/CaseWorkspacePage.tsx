'use client';

import { useRef, useState } from 'react';
import { type GraphWorkspaceExportHandle } from '@/components/graph/GraphWorkspace';
import CaseWorkspaceShell from '@/components/layout/CaseWorkspaceShell';
import { useCaseById } from '@/hooks/useCaseData';
import { resolveEvidenceHighlightIds } from '@/lib/data/evidenceHighlights';
import { exportBoth, exportPDF, exportPNG } from '@/lib/export/reportExporter';
import { type ExportFormat } from '@/lib/export/exportTypes';
import { getEvidenceLabel, useCaseStore } from '@/store/caseStore';

export default function CaseWorkspacePage({ caseId }: { caseId: string }) {
  const { caseData, isLoading, error } = useCaseById(caseId);
  const highlightedEvidenceId = useCaseStore((state) => state.highlightedEvidenceId);
  const highlightedEntityIds = useCaseStore((state) => state.highlightedEntityIds);
  const selectedNodeId = useCaseStore((state) => state.selectedNodeId);
  const activeFilters = useCaseStore((state) => state.activeFilters);
  const viewMode = useCaseStore((state) => state.viewMode);
  const setViewMode = useCaseStore((state) => state.setViewMode);
  const setHighlightedEvidence = useCaseStore((state) => state.setHighlightedEvidence);
  const setSelectedNode = useCaseStore((state) => state.setSelectedNode);
  const addEntity = useCaseStore((state) => state.addEntity);
  const addConnection = useCaseStore((state) => state.addConnection);
  const deleteEntity = useCaseStore((state) => state.deleteEntity);
  const deleteConnection = useCaseStore((state) => state.deleteConnection);
  const graphWorkspaceRef = useRef<GraphWorkspaceExportHandle | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-shell-bg px-shell-lg py-shell-xl text-shell-text-primary">
        <div className="mx-auto max-w-7xl rounded-shell-xl border border-shell-border bg-shell-surface p-shell-lg shadow-shell-md">
          <p className="text-sm text-shell-text-muted">Loading case\u2026</p>
        </div>
      </main>
    );
  }

  if (!caseData) {
    return (
      <main className="min-h-screen bg-shell-bg px-shell-lg py-shell-xl text-shell-text-primary">
        <div className="mx-auto max-w-7xl rounded-shell-xl border border-shell-destructive/20 bg-shell-destructive-bg p-shell-lg">
          <p className="text-sm text-shell-destructive">
            {error ?? 'Case not found.'}
          </p>
        </div>
      </main>
    );
  }

  const resolvedCaseData = caseData;

  const activeEvidenceFile = resolvedCaseData.evidence
    .flatMap((category) => category.files)
    .find((file) => file.id === highlightedEvidenceId) ?? null;
  const activeEvidenceLabel = activeEvidenceFile ? getEvidenceLabel(activeEvidenceFile) : 'None selected';
  const selectedNodeLabel = resolvedCaseData.graph.nodes.find((node) => node.id === selectedNodeId)?.label ?? 'No active node';

  async function handleExport(format: ExportFormat) {
    const exportSource = graphWorkspaceRef.current;
    const fallbackElement = exportSource?.getActiveCaptureElement() ?? null;

    if (!exportSource) {
      return;
    }

    setIsExporting(true);

    try {
      const exportContext = {
        caseData: resolvedCaseData,
        viewMode,
        highlightedEvidenceId,
        highlightedEntityIds,
        selectedNodeId,
        activeFilters,
        activeEvidenceLabel,
        selectedNodeLabel,
      };

      if (format === 'png') {
        await exportPNG(exportContext, exportSource, fallbackElement);
        return;
      }

      if (format === 'pdf') {
        await exportPDF(exportContext, exportSource, fallbackElement);
        return;
      }

      await exportBoth(exportContext, exportSource, fallbackElement);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <main className="min-h-screen bg-shell-bg px-shell-lg py-shell-xl text-shell-text-primary">
      <CaseWorkspaceShell
        caseData={resolvedCaseData}
        highlightedEvidenceId={highlightedEvidenceId}
        highlightedEntityIds={highlightedEntityIds}
        selectedNodeId={selectedNodeId}
        viewMode={viewMode}
        onSetViewMode={setViewMode}
        onSelectEvidence={(file) => {
          const ids = resolveEvidenceHighlightIds(caseData, file);
          setHighlightedEvidence(file.id, ids);
          if (ids.length > 0) {
            setSelectedNode(ids[0]);
          }
        }}
        onCreateEntity={(input) => {
          addEntity(caseId, input);
        }}
        onCreateConnection={(input) => {
          addConnection(caseId, input);
        }}
        onDeleteEntity={(entityId) => {
          deleteEntity(caseId, entityId);
        }}
        onDeleteConnection={(connectionId) => {
          deleteConnection(caseId, connectionId);
        }}
        onSelectNode={setSelectedNode}
        onClearHighlights={() => {
          setHighlightedEvidence(null, []);
          setSelectedNode(null);
        }}
        onExport={handleExport}
        isExporting={isExporting}
        graphWorkspaceRef={graphWorkspaceRef}
      />
    </main>
  );
}
