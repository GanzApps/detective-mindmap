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
  const [isExpanded, setIsExpanded] = useState(true);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const timelineEvents = useMemo(
    () => caseData.evidence
      .flatMap((category) => category.files)
      .sort((left, right) => left.addedAt.localeCompare(right.addedAt))
      .slice(0, 8),
    [caseData.evidence],
  );

  return (
    <div className="border-t border-shell-border bg-shell-surface">
      {/* Header strip — always visible, single line */}
      <div className="flex items-center gap-2 px-3 py-1.5">
        {/* Left: label + count + help */}
        <button
          type="button"
          aria-label="Toggle timeline"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((v) => !v)}
          className="flex items-center gap-2 text-left"
        >
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-shell-text-muted">
            Timeline
          </span>
          <span className="rounded-full border border-shell-border bg-shell-surface-raised px-2 py-0.5 text-[10px] text-shell-text-secondary">
            {timelineEvents.length} events
          </span>
          <svg
            className={`h-3 w-3 text-shell-text-muted transition ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* (?) help tooltip */}
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

        <div className="mx-1 h-3 w-px bg-shell-border" />

        {/* Status chips — compact, always visible */}
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
          {caseData.status}
        </span>
        <span className="text-[10px] text-shell-text-muted">
          Updated {formatUpdatedAt(caseData.updatedAt)}
        </span>
      </div>

      {/* Horizontally scrollable event strip */}
      {isExpanded && (
        <div className="overflow-x-auto border-t border-shell-border">
          <div className="flex gap-2 px-3 py-2" style={{ width: 'max-content' }}>
            {/* Context chips — inline in the scroll area */}
            <div className="flex shrink-0 flex-col justify-center gap-1 rounded-lg border border-shell-border bg-shell-bg px-3 py-2 text-[10px]">
              <span className="uppercase tracking-[0.16em] text-shell-text-muted">Evidence</span>
              <span className="max-w-[120px] truncate font-medium text-shell-text-primary">{activeEvidenceLabel}</span>
            </div>
            <div className="flex shrink-0 flex-col justify-center gap-1 rounded-lg border border-shell-border bg-shell-bg px-3 py-2 text-[10px]">
              <span className="uppercase tracking-[0.16em] text-shell-text-muted">Node</span>
              <span className="max-w-[120px] truncate font-medium text-shell-text-primary">{selectedNodeLabel}</span>
            </div>
            <div className="flex shrink-0 flex-col justify-center gap-1 rounded-lg border border-shell-border bg-shell-bg px-3 py-2 text-[10px]">
              <span className="uppercase tracking-[0.16em] text-shell-text-muted">Network</span>
              <span className="font-medium text-shell-text-primary">{highlightedCount} highlighted</span>
            </div>

            <div className="mx-1 self-stretch border-l border-shell-border" />

            {/* Event cards */}
            {timelineEvents.map((event) => (
              <article
                key={event.id}
                className="flex w-36 shrink-0 flex-col gap-1 rounded-lg border border-shell-border bg-shell-surface-raised px-3 py-2"
              >
                <p className="text-[10px] uppercase tracking-[0.14em] text-shell-text-muted">
                  {formatEventDate(event.addedAt)}
                </p>
                <p className="truncate text-xs font-medium text-shell-text-primary">{event.name}</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-shell-text-secondary">
                  {event.type.replace('_', ' ')}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
