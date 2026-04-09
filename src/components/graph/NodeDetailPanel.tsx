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
    <aside
      aria-label="Node detail panel"
      className="w-[340px] rounded-[1.6rem] border border-cyan-400/20 bg-[rgba(6,10,18,0.94)] p-5 text-slate-100 shadow-2xl shadow-black/45 backdrop-blur"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-300/70">
            Active analysis
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {node.label}
          </h3>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            {node.type} · {node.status} · tier {node.tier + 1}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close node detail panel"
          onClick={onDismiss}
          className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300 transition hover:border-white/25 hover:text-white"
        >
          Close
        </button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Connections</p>
          <p className="mt-2 text-xl font-semibold text-white">{directEdges.length}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Neighbors</p>
          <p className="mt-2 text-xl font-semibold text-white">{relatedNodes.length}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Highlighted</p>
          <p className="mt-2 text-xl font-semibold text-white">{highlightedConnections.length}</p>
        </div>
      </div>

      <section className="mt-5 rounded-[1.4rem] border border-white/8 bg-slate-950/70 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Connection summary</p>
          <span className="text-xs text-slate-500">{directEdges.length} edges</span>
        </div>
        <div className="mt-3 space-y-2">
          {directEdges.length > 0 ? directEdges.map((edge) => {
            const counterpartId = edge.source === node.id ? edge.target : edge.source;
            const counterpart = graph.nodes.find((candidate) => candidate.id === counterpartId);

            return (
              <div
                key={edge.id}
                className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3"
              >
                <p className="text-sm font-medium text-white">
                  {counterpart?.label ?? counterpartId}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  {edge.label} · strength {edge.strength.toFixed(1)}
                </p>
              </div>
            );
          }) : (
            <p className="text-sm text-slate-400">No linked relationships yet.</p>
          )}
        </div>
      </section>

      <section className="mt-5 rounded-[1.4rem] border border-white/8 bg-slate-950/70 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Entity properties</p>
        <div className="mt-3 space-y-2">
          {properties.length > 0 ? properties.map(([key, value]) => (
            <div
              key={key}
              className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3"
            >
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{key}</span>
              <span className="text-right text-sm text-slate-200">{formatValue(value)}</span>
            </div>
          )) : (
            <p className="text-sm text-slate-400">No properties captured for this node.</p>
          )}
        </div>
      </section>
    </aside>
  );
}
