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
}: {
  caseData: Case;
  /** @deprecated — no longer shown in the timeline strip */
  activeEvidenceLabel?: string;
  /** @deprecated — no longer shown in the timeline strip */
  selectedNodeLabel?: string;
  /** @deprecated — no longer shown in the timeline strip */
  highlightedCount?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const timelineEvents = useMemo(
    () => caseData.evidence
      .flatMap((category) => category.files)
      .sort((left, right) => left.addedAt.localeCompare(right.addedAt))
      .slice(0, 12),
    [caseData.evidence],
  );

  return (
    <div className="border-t border-shell-border bg-shell-surface">

      {/* ── Header: label left, controls right ── */}
      <div className="flex items-center gap-2 px-3 py-1.5">

        {/* Left group */}
        <span className="text-xs font-medium uppercase tracking-[0.22em] text-shell-text-muted">
          Timeline
        </span>
        <span className="rounded-full border border-shell-border bg-shell-surface-raised px-2 py-0.5 text-[10px] text-shell-text-secondary">
          {timelineEvents.length} events
        </span>

        {/* (?) help */}
        <div className="relative">
          <button
            type="button"
            aria-label="Timeline help"
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
            onFocus={() => setTooltipVisible(true)}
            onBlur={() => setTooltipVisible(false)}
            className="flex h-4 w-4 items-center justify-center rounded-full border border-shell-border bg-shell-surface-raised text-[9px] font-bold text-shell-text-muted transition hover:border-shell-accent/40 hover:text-shell-accent"
          >
            ?
          </button>
          {tooltipVisible && (
            <div
              role="tooltip"
              className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-lg border border-shell-border bg-shell-surface px-3 py-2 text-xs text-shell-text-secondary shadow-shell-lg"
            >
              Chronology stays docked in the workspace and expands only when you need the sequence.
            </div>
          )}
        </div>

        {/* Spacer pushes right group to far edge */}
        <div className="flex-1" />

        {/* Right group: status + updated + collapse */}
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
          {caseData.status}
        </span>
        <span className="text-[10px] text-shell-text-muted">
          Updated {formatUpdatedAt(caseData.updatedAt)}
        </span>

        <button
          type="button"
          aria-label="Toggle timeline"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((v) => !v)}
          className="ml-1 rounded p-1 text-shell-text-muted transition hover:bg-shell-surface-raised hover:text-shell-text-secondary"
        >
          <svg
            className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* ── Horizontal timeline strip ── */}
      {isExpanded && (
        <div className="overflow-x-auto border-t border-shell-border">
          <div className="flex items-start px-4 py-3" style={{ width: 'max-content' }}>
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="flex shrink-0 items-start">

                {/* Card column: dot on track + content below */}
                <div className="flex w-40 flex-col items-center">
                  {/* Track dot */}
                  <div className="mb-2 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-shell-accent bg-shell-bg shadow-sm" />

                  {/* Event card */}
                  <article className="w-full rounded-lg border border-shell-border bg-shell-surface-raised px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-shell-text-muted">
                      {formatEventDate(event.addedAt)}
                    </p>
                    <p className="mt-1 line-clamp-3 text-xs font-medium leading-snug text-shell-text-primary">
                      {event.name}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-shell-text-secondary">
                      {event.type.replace('_', ' ')}
                    </p>
                  </article>
                </div>

                {/* Connector line to next node (skip on last) */}
                {index < timelineEvents.length - 1 && (
                  <div className="mt-[4.5px] h-px w-5 shrink-0 bg-gradient-to-r from-shell-accent/50 to-shell-accent/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
