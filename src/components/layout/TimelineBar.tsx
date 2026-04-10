'use client';

import { useMemo, useState } from 'react';
import { type Case } from '@/lib/data/dataTypes';

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
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
  const [isExpanded, setIsExpanded] = useState(false);
  const timelineEvents = useMemo(
    () => caseData.evidence
      .flatMap((category) => category.files)
      .sort((left, right) => left.addedAt.localeCompare(right.addedAt))
      .slice(0, 8),
    [caseData.evidence],
  );

  return (
    <section className="rounded-shell-xl border border-shell-border bg-shell-surface shadow-shell-sm">
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((current) => !current)}
        className="flex w-full items-center justify-between gap-shell-md px-shell-md py-shell-md text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-shell-sm">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-shell-text-muted">
              Timeline
            </p>
            <span className="rounded-shell-pill border border-shell-border bg-shell-surface-raised px-3 py-1 text-xs text-shell-text-secondary">
              {timelineEvents.length} events
            </span>
          </div>
          <p className="mt-2 text-sm text-shell-text-secondary">
            Chronology stays docked in the workspace and expands only when you need the sequence.
          </p>
        </div>

        <div className="flex items-center gap-shell-sm">
          <span className="rounded-shell-pill border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            {caseData.status}
          </span>
          <span className="rounded-shell-pill border border-shell-border bg-shell-surface-raised px-3 py-1 text-xs text-shell-text-secondary">
            Updated {formatUpdatedAt(caseData.updatedAt)}
          </span>
          <span className="text-lg text-shell-text-muted">{isExpanded ? '⌄' : '⌃'}</span>
        </div>
      </button>

      {isExpanded ? (
        <div className="border-t border-shell-border px-shell-md py-shell-md">
          <div className="mb-shell-md grid gap-shell-sm md:grid-cols-3">
            <div className="rounded-shell-lg border border-shell-border bg-shell-surface-raised px-shell-md py-shell-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-shell-text-muted">Active evidence</p>
              <p className="mt-2 text-sm font-medium text-shell-text-primary">{activeEvidenceLabel}</p>
            </div>
            <div className="rounded-shell-lg border border-shell-border bg-shell-surface-raised px-shell-md py-shell-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-shell-text-muted">Selected node</p>
              <p className="mt-2 text-sm font-medium text-shell-text-primary">{selectedNodeLabel}</p>
            </div>
            <div className="rounded-shell-lg border border-shell-border bg-shell-surface-raised px-shell-md py-shell-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-shell-text-muted">Focused network</p>
              <p className="mt-2 text-sm font-medium text-shell-text-primary">{highlightedCount} highlighted</p>
            </div>
          </div>

          <div className="grid gap-shell-sm xl:grid-cols-4">
            {timelineEvents.map((event) => (
              <article
                key={event.id}
                className="rounded-shell-lg border border-shell-border bg-shell-surface-raised px-shell-md py-shell-md"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-shell-text-muted">
                  {formatEventDate(event.addedAt)}
                </p>
                <p className="mt-2 text-sm font-medium text-shell-text-primary">{event.name}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-shell-text-secondary">
                  {event.type.replace('_', ' ')}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
