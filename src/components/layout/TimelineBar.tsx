'use client';

import { type Case } from '@/lib/data/dataTypes';

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export default function TimelineBar({
  caseData,
  activeEvidenceLabel,
  selectedNodeLabel,
  highlightedCount,
}: {
  caseData: Case;
  activeEvidenceLabel: string;
  selectedNodeLabel: string;
  highlightedCount: number;
}) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-900/90 shadow-2xl shadow-black/30">
      <div className="flex flex-col gap-4 border-b border-slate-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
            TimelineBar
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-50">Timeline and status strip</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-100">
            {caseData.status}
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1">
            Updated {formatUpdatedAt(caseData.updatedAt)}
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1">
            {highlightedCount} highlighted
          </span>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.5rem] border border-slate-800 bg-[#070c19] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Case timeline
              </p>
              <p className="mt-2 text-sm font-medium text-slate-100">
                {caseData.name} timeline placeholder
              </p>
            </div>
            <div className="text-xs uppercase tracking-[0.18em] text-cyan-200/70">
              8 events queued
            </div>
          </div>

          <div className="mt-4">
            <div className="relative h-3 rounded-full bg-slate-950">
              <div className="absolute inset-y-0 left-0 w-[72%] rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 opacity-80" />
              <div className="absolute left-[70%] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-slate-950 bg-slate-100 shadow-lg shadow-cyan-400/20" />
            </div>
            <div className="mt-3 flex justify-between text-[11px] uppercase tracking-[0.18em] text-slate-500">
              <span>Intake</span>
              <span>Transfers</span>
              <span>Current review</span>
              <span>Export</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/70 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Active evidence</p>
            <p className="mt-2 text-sm font-medium text-slate-50">{activeEvidenceLabel}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/70 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Selected node</p>
            <p className="mt-2 text-sm font-medium text-slate-50">{selectedNodeLabel}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
