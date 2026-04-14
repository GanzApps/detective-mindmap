'use client';

import NodeDetailPanel from '@/components/graph/NodeDetailPanel';
import { type Case } from '@/lib/data/dataTypes';
import { getConnectedIds, type GraphNode } from '@/lib/graph/graphTypes';
import { type AIResultPayload } from '@/lib/ai/knownIntents';

export default function WorkspaceAnalysisPanel({
  caseData,
  selectedNode,
  highlightedNodeIds,
  aiResult,
  onDismiss,
  onDismissAIResult,
}: {
  caseData: Case;
  selectedNode: GraphNode | null;
  highlightedNodeIds: string[];
  aiResult: AIResultPayload | null;
  onDismiss: () => void;
  onDismissAIResult: () => void;
}) {
  const directConnectionCount = selectedNode
    ? getConnectedIds(caseData.graph.edges, selectedNode.id).size
    : 0;
  const panelMode = aiResult ? 'ai' : selectedNode ? 'node' : 'idle';

  return (
    <aside
      aria-label="Workspace analysis panel"
      className="flex h-full min-h-[620px] flex-col rounded-shell-xl border border-shell-border bg-shell-surface p-shell-md shadow-shell-md"
    >
      <div className="border-b border-shell-border pb-shell-md">
        <div className="flex items-start justify-between gap-shell-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-shell-text-muted">
              Analysis Results
            </p>
            <h2 className="mt-2 text-xl font-semibold text-shell-text-primary">
              {aiResult ? aiResult.title : selectedNode ? selectedNode.label : 'Workspace overview'}
            </h2>
          </div>
          <span className="rounded-shell-pill border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            {panelMode === 'ai' ? 'AI Result' : selectedNode ? 'Selected' : 'Idle'}
          </span>
        </div>

        <p className="mt-3 text-sm text-shell-text-secondary">
          {aiResult
            ? aiResult.subtitle
            : selectedNode
            ? 'Node details stay here so the graph remains unobstructed while you inspect the active network.'
            : 'Select an entity or trigger an AI result to populate this panel without shifting the workspace frame.'}
        </p>
      </div>

      <div className="mt-shell-md flex-1">
        {aiResult ? (
          <section aria-label="AI result panel" className="space-y-shell-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-shell-text-muted">
                  Known intent result
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-shell-text-primary">
                  {aiResult.title}
                </h3>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-shell-text-muted">
                  {aiResult.intentId.replaceAll('_', ' ')}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close AI result panel"
                onClick={onDismissAIResult}
                className="rounded-shell-pill border border-shell-border px-3 py-1 text-xs uppercase tracking-[0.18em] text-shell-text-secondary transition hover:border-shell-border-strong hover:text-shell-text-primary"
              >
                Close
              </button>
            </div>

            <section className="rounded-shell-lg border border-shell-border bg-shell-surface-raised p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-shell-text-muted">Summary</p>
              <p className="mt-3 text-sm text-shell-text-secondary">
                {aiResult.summary}
              </p>
            </section>

            <section className="rounded-shell-lg border border-shell-border bg-shell-surface-raised p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-shell-text-muted">Key Findings</p>
              <div className="mt-3 space-y-2">
                {aiResult.findings.map((finding) => (
                  <div
                    key={finding}
                    className="rounded-shell-lg border border-shell-border bg-shell-surface px-3 py-3 text-sm text-shell-text-primary"
                  >
                    {finding}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-shell-lg border border-shell-border bg-shell-surface-raised p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-shell-text-muted">Metrics</p>
              <div className="mt-shell-sm grid gap-shell-sm sm:grid-cols-2">
                {aiResult.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-shell-lg border border-shell-border bg-shell-surface px-shell-md py-shell-md">
                    <p className="text-xs uppercase tracking-[0.18em] text-shell-text-muted">{metric.label}</p>
                    <p className="mt-2 text-xl font-semibold text-shell-text-primary">{metric.value}</p>
                  </div>
                ))}
              </div>
            </section>
          </section>
        ) : selectedNode ? (
          <NodeDetailPanel
            graph={caseData.graph}
            node={selectedNode}
            highlightedNodeIds={highlightedNodeIds}
            onDismiss={onDismiss}
          />
        ) : (
          <div className="grid gap-shell-md">
            <section className="rounded-shell-lg border border-shell-border bg-shell-surface-raised p-shell-md">
              <p className="text-xs uppercase tracking-[0.18em] text-shell-text-muted">Summary</p>
              <p className="mt-2 text-sm text-shell-text-secondary">
                The workspace is ready for evidence review, layered filtering, and focused graph inspection. This panel stays present to preserve layout stability.
              </p>
            </section>

            <section className="rounded-shell-lg border border-shell-border bg-shell-surface-raised p-shell-md">
              <p className="text-xs uppercase tracking-[0.18em] text-shell-text-muted">Metrics</p>
              <div className="mt-shell-sm grid gap-shell-sm sm:grid-cols-2">
                <div className="rounded-shell-lg border border-shell-border bg-shell-surface px-shell-md py-shell-md">
                  <p className="text-xs uppercase tracking-[0.18em] text-shell-text-muted">Entities</p>
                  <p className="mt-2 text-2xl font-semibold text-shell-text-primary">
                    {caseData.graph.nodes.length}
                  </p>
                </div>
                <div className="rounded-shell-lg border border-shell-border bg-shell-surface px-shell-md py-shell-md">
                  <p className="text-xs uppercase tracking-[0.18em] text-shell-text-muted">Connections</p>
                  <p className="mt-2 text-2xl font-semibold text-shell-text-primary">
                    {caseData.graph.edges.length}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-shell-lg border border-shell-border bg-shell-surface-raised p-shell-md">
              <p className="text-xs uppercase tracking-[0.18em] text-shell-text-muted">Focused Network</p>
              <p className="mt-2 text-sm text-shell-text-secondary">
                {highlightedNodeIds.length > 0
                  ? `${highlightedNodeIds.length} highlighted node(s) currently linked to the active evidence or graph state.`
                  : 'No focused network yet. Use evidence selection, future search selection, or AI commands to drive this panel.'}
              </p>
            </section>
          </div>
        )}
      </div>

      {aiResult ? (
        <div className="mt-shell-md rounded-shell-lg border border-shell-border bg-shell-surface-raised px-shell-md py-shell-sm text-sm text-shell-text-secondary">
          {aiResult.highlightedNodeIds.length} graph node{aiResult.highlightedNodeIds.length === 1 ? '' : 's'} highlighted by the active command.
        </div>
      ) : selectedNode ? (
        <div className="mt-shell-md rounded-shell-lg border border-shell-border bg-shell-surface-raised px-shell-md py-shell-sm text-sm text-shell-text-secondary">
          {directConnectionCount} direct connection{directConnectionCount === 1 ? '' : 's'} linked to the active entity.
        </div>
      ) : null}
    </aside>
  );
}
