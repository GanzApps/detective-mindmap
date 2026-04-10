'use client';

import { type GraphData, getConnectedIds, type GraphNode } from '@/lib/graph/graphTypes';

function formatValue(value: string) {
  return value.trim() ? value : 'Unknown';
}

export default function NodeDetailPanel({
  graph,
  node,
  highlightedNodeIds,
  onDismiss,
}: {
  graph: GraphData;
  node: GraphNode | null;
  highlightedNodeIds: string[];
  onDismiss: () => void;
}) {
  if (!node) {
    return null;
  }

  const connectedNodeIds = Array.from(getConnectedIds(graph.edges, node.id));
  const relatedNodes = connectedNodeIds
    .map((relatedId) => graph.nodes.find((candidate) => candidate.id === relatedId) ?? null)
    .filter((candidate): candidate is GraphNode => candidate !== null);
  const directEdges = graph.edges.filter((edge) => edge.source === node.id || edge.target === node.id);
  const highlightedConnections = relatedNodes.filter((relatedNode) => highlightedNodeIds.includes(relatedNode.id));
  const properties = Object.entries(node.properties);

  return (
    <section aria-label="Node detail panel" className="space-y-shell-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-shell-text-muted">
            Active analysis
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-shell-text-primary">
            {node.label}
          </h3>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-shell-text-muted">
            {node.type} · {node.status} · tier {node.tier + 1}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close node detail panel"
          onClick={onDismiss}
          className="rounded-shell-pill border border-shell-border px-3 py-1 text-xs uppercase tracking-[0.18em] text-shell-text-secondary transition hover:border-shell-border-strong hover:text-shell-text-primary"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-shell-lg border border-shell-border bg-shell-surface-raised px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-shell-text-muted">Connections</p>
          <p className="mt-2 text-xl font-semibold text-shell-text-primary">{directEdges.length}</p>
        </div>
        <div className="rounded-shell-lg border border-shell-border bg-shell-surface-raised px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-shell-text-muted">Neighbors</p>
          <p className="mt-2 text-xl font-semibold text-shell-text-primary">{relatedNodes.length}</p>
        </div>
        <div className="rounded-shell-lg border border-shell-border bg-shell-surface-raised px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-shell-text-muted">Highlighted</p>
          <p className="mt-2 text-xl font-semibold text-shell-text-primary">{highlightedConnections.length}</p>
        </div>
      </div>

      <section className="rounded-shell-lg border border-shell-border bg-shell-surface-raised p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-shell-text-muted">Connection summary</p>
          <span className="text-xs text-shell-text-muted">{directEdges.length} edges</span>
        </div>
        <div className="mt-3 space-y-2">
          {directEdges.length > 0 ? directEdges.map((edge) => {
            const counterpartId = edge.source === node.id ? edge.target : edge.source;
            const counterpart = graph.nodes.find((candidate) => candidate.id === counterpartId);

            return (
              <div
                key={edge.id}
                className="rounded-shell-lg border border-shell-border bg-shell-surface px-3 py-3"
              >
                <p className="text-sm font-medium text-shell-text-primary">
                  {counterpart?.label ?? counterpartId}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-shell-text-muted">
                  {edge.label} · strength {edge.strength.toFixed(1)}
                </p>
              </div>
            );
          }) : (
            <p className="text-sm text-shell-text-secondary">No linked relationships yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-shell-lg border border-shell-border bg-shell-surface-raised p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-shell-text-muted">Entity properties</p>
        <div className="mt-3 space-y-2">
          {properties.length > 0 ? properties.map(([key, value]) => (
            <div
              key={key}
              className="flex items-start justify-between gap-4 rounded-shell-lg border border-shell-border bg-shell-surface px-3 py-3"
            >
              <span className="text-xs uppercase tracking-[0.18em] text-shell-text-muted">{key}</span>
              <span className="text-right text-sm text-shell-text-primary">{formatValue(value)}</span>
            </div>
          )) : (
            <p className="text-sm text-shell-text-secondary">No properties captured for this node.</p>
          )}
        </div>
      </section>
    </section>
  );
}
