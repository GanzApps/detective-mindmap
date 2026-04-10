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
    <section className="rounded-shell-xl border border-shell-border bg-shell-surface shadow-shell-sm">
      <div className="flex flex-col gap-shell-sm border-b border-shell-border px-shell-md py-shell-md lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-shell-text-muted">
            TimelineBar
          </p>
          <h2 className="mt-2 text-lg font-semibold text-shell-text-primary">Timeline and status strip</h2>
        </div>
        <div className="flex flex-wrap items-center gap-shell-sm text-xs uppercase tracking-widest text-shell-text-secondary">
          <span className="rounded-shell-pill border border-emerald-500/30 bg-emerald-500/10 px-shell-sm py-1 text-emerald-600 dark:text-emerald-400">
            {caseData.status}
          </span>
          <span className="rounded-shell-pill border border-shell-border bg-shell-surface-raised px-shell-sm py-1">
            Updated {formatUpdatedAt(caseData.updatedAt)}
          </span>
          <span className="rounded-shell-pill border border-shell-border bg-shell-surface-raised px-shell-sm py-1">
            {highlightedCount} highlighted
          </span>
        </div>
      </div>

      <div className="grid gap-shell-md px-shell-md py-shell-md xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-shell-lg border border-shell-border bg-shell-surface-raised p-shell-md">
          <div className="flex items-center justify-between gap-shell-sm">
            <div>
              <p className="text-xs uppercase tracking-widest text-shell-text-muted">
                Case timeline
              </p>
              <p className="mt-2 text-sm font-medium text-shell-text-primary">
                {caseData.name} timeline placeholder
              </p>
            </div>
            <div className="text-xs uppercase tracking-widest text-shell-text-secondary">
              8 events queued
            </div>
          </div>

          <div className="mt-shell-md">
            <div className="relative h-2 rounded-full bg-shell-surface">
              <div className="absolute inset-y-0 left-0 w-[72%] rounded-full bg-gradient-to-r from-[var(--shell-accent)] via-fuchsia-500 to-amber-400 opacity-70" />
              <div className="absolute left-[70%] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-shell-surface bg-shell-text-primary shadow-shell-sm" />
            </div>
            <div className="mt-shell-sm flex justify-between text-xs uppercase tracking-widest text-shell-text-muted">
              <span>Intake</span>
              <span>Transfers</span>
              <span>Current review</span>
              <span>Export</span>
            </div>
          </div>
        </div>

        <div className="grid gap-shell-sm md:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-shell-lg border border-shell-border bg-shell-surface-raised px-shell-md py-shell-md">
            <p className="text-xs uppercase tracking-widest text-shell-text-muted">Active evidence</p>
            <p className="mt-2 text-sm font-medium text-shell-text-primary">{activeEvidenceLabel}</p>
          </div>
          <div className="rounded-shell-lg border border-shell-border bg-shell-surface-raised px-shell-md py-shell-md">
            <p className="text-xs uppercase tracking-widest text-shell-text-muted">Selected node</p>
            <p className="mt-2 text-sm font-medium text-shell-text-primary">{selectedNodeLabel}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
