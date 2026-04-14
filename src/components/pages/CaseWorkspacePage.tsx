'use client';

import { startTransition, useMemo, useRef, useState } from 'react';
import { type GraphWorkspaceExportHandle } from '@/components/graph/GraphWorkspace';
import CaseWorkspaceShell from '@/components/layout/CaseWorkspaceShell';
import {
  executeKnownIntent,
  getQuickCommandSuggestions,
  type AIResultPayload,
  type CommandHistoryEntry,
} from '@/lib/ai/knownIntents';
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
  const setGraphFocus = useCaseStore((state) => state.setGraphFocus);
  const setSelectedNode = useCaseStore((state) => state.setSelectedNode);
  const addEntity = useCaseStore((state) => state.addEntity);
  const addConnection = useCaseStore((state) => state.addConnection);
  const deleteEntity = useCaseStore((state) => state.deleteEntity);
  const deleteConnection = useCaseStore((state) => state.deleteConnection);
  const graphWorkspaceRef = useRef<GraphWorkspaceExportHandle | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [aiResult, setAiResult] = useState<AIResultPayload | null>(null);
  const [commandHistory, setCommandHistory] = useState<CommandHistoryEntry[]>([]);
  const [commandStatus, setCommandStatus] = useState<'idle' | 'running' | 'complete' | 'failed'>('idle');
  const [commandStatusMessage, setCommandStatusMessage] = useState('Known intents are ready. Type naturally or start with /.');

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
          Loading case...
        </div>
      </main>
    );
  }

  if (!caseData) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
        <div className="mx-auto max-w-7xl rounded-3xl border border-rose-500/20 bg-rose-950/30 p-8 text-rose-100">
          {error ?? 'Case not found.'}
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
  const quickCommands = useMemo(
    () => getQuickCommandSuggestions(resolvedCaseData, selectedNodeId),
    [resolvedCaseData, selectedNodeId],
  );

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

  function handleExecuteCommand(command: string) {
    setCommandStatus('running');
    setCommandStatusMessage(`Running: ${command}`);

    startTransition(() => {
      const execution = executeKnownIntent(command, {
        caseData: resolvedCaseData,
        selectedNodeId,
      });

      setCommandHistory((current) => [execution.history, ...current].slice(0, 6));

      if (!execution.ok) {
        setCommandStatus('failed');
        setCommandStatusMessage(execution.message);
        return;
      }

      setCommandStatus('complete');
      setCommandStatusMessage(`Complete: ${execution.result.historyLabel}`);
      setAiResult(execution.result);
      setGraphFocus(execution.result.selectedNodeId, execution.result.highlightedNodeIds);
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
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
          setAiResult(null);
          setCommandStatus('idle');
          setCommandStatusMessage(`Focused evidence: ${file.name}`);
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
        onSelectNode={(nodeId) => {
          setAiResult(null);
          setSelectedNode(nodeId);
        }}
        onClearHighlights={() => {
          setHighlightedEvidence(null, []);
          setSelectedNode(null);
          setAiResult(null);
          setCommandStatus('idle');
          setCommandStatusMessage('Known intents are ready. Type naturally or start with /.');
        }}
        onExport={handleExport}
        isExporting={isExporting}
        graphWorkspaceRef={graphWorkspaceRef}
        aiResult={aiResult}
        aiQuickCommands={quickCommands}
        commandHistory={commandHistory}
        commandStatus={commandStatus}
        commandStatusMessage={commandStatusMessage}
        onExecuteCommand={handleExecuteCommand}
        onDismissAIResult={() => setAiResult(null)}
      />
    </main>
  );
}
