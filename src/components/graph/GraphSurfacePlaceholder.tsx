'use client';

export default function GraphSurfacePlaceholder({
  caseName,
  entityCount,
  connectionCount,
  highlightedCount,
  viewMode,
  selectedNodeLabel,
  highlightPreview,
}: {
  caseName: string;
  entityCount: number;
  connectionCount: number;
  highlightedCount: number;
  viewMode?: '2d' | '3d';
  selectedNodeLabel?: string | null;
  highlightPreview?: string[];
}) {
  return (
    <section className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/30">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
            Graph Surface
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-50">{caseName}</h2>
        </div>
        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
          {highlightedCount} highlighted
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
        <div className="rounded-[1.75rem] border border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_40%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(2,6,23,0.98))] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Renderer status</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">
                {viewMode ? `${viewMode.toUpperCase()} shell ready` : 'Viewport ready'}
              </p>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-950/60 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
              {selectedNodeLabel ?? 'No node selected'}
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Entities</p>
              <p className="mt-2 text-3xl font-semibold text-slate-50">{entityCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Connections</p>
              <p className="mt-2 text-3xl font-semibold text-slate-50">{connectionCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <p className="text-sm text-slate-400">Highlight preview</p>
          <div className="mt-4 space-y-3">
            {(highlightPreview && highlightPreview.length > 0) ? (
              highlightPreview.map((label) => (
                <div
                  key={label}
                  className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-50"
                >
                  {label}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
                Select an evidence file to pre-highlight related entities.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
