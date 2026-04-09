'use client';

import { type Case } from '@/lib/data/dataTypes';
import { type ExportFormat } from '@/lib/export/exportTypes';

function statusClasses(status: Case['status']) {
  switch (status) {
    case 'active':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'closed':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'archived':
      return 'border-shell-border bg-shell-surface-raised text-shell-text-muted';
    default:
      return 'border-shell-border bg-shell-surface-raised text-shell-text-muted';
  }
}

export default function CaseHeader({
  caseData,
  entityCount,
  connectionCount,
  highlightedCount,
  viewMode,
  onSetViewMode,
  onOpenEntityModal,
  onOpenConnectionModal,
  onClearHighlights,
  onExport,
  isExporting = false,
}: {
  caseData: Case;
  entityCount: number;
  connectionCount: number;
  highlightedCount: number;
  viewMode: '2d' | '3d';
  onSetViewMode: (viewMode: '2d' | '3d') => void;
  onOpenEntityModal: () => void;
  onOpenConnectionModal: () => void;
  onClearHighlights: () => void;
  onExport: (format: ExportFormat) => void;
  isExporting?: boolean;
}) {
  return (
    <header className="rounded-shell-xl border border-shell-border bg-shell-surface p-shell-lg shadow-shell-sm">
      <div className="flex flex-col gap-shell-md xl:flex-row xl:items-start xl:justify-between">
        {/* Case identity */}
        <div className="space-y-shell-sm">
          <div className="flex flex-wrap items-center gap-shell-sm">
            <p className="text-xs font-medium uppercase tracking-widest text-shell-text-muted">
              Investigation Workspace
            </p>
            <span
              className={`rounded-shell-pill border px-shell-sm py-1 text-xs font-medium uppercase tracking-widest ${statusClasses(caseData.status)}`}
            >
              {caseData.status}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-shell-text-primary">
              {caseData.name}
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-shell-text-secondary">
              {caseData.description}
            </p>
          </div>
        </div>

        {/* Top action area */}
        <div className="flex flex-wrap items-center gap-shell-sm">
          {/* Export menu */}
          <details className="relative">
            <summary className="list-none cursor-pointer rounded-shell-pill bg-shell-accent px-shell-md py-shell-sm text-sm font-semibold text-shell-accent-fg transition hover:bg-[var(--shell-accent-hover)]">
              {isExporting ? 'Exporting\u2026' : 'Export Report'}
            </summary>
            <div className="absolute right-0 z-10 mt-2 min-w-48 rounded-shell-xl border border-shell-border bg-shell-surface p-1 shadow-shell-lg">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => onExport('png')}
                className="block w-full rounded-shell-lg px-shell-md py-shell-sm text-left text-sm text-shell-text-primary transition hover:bg-shell-surface-raised disabled:cursor-not-allowed disabled:opacity-50"
              >
                PNG snapshot
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => onExport('pdf')}
                className="block w-full rounded-shell-lg px-shell-md py-shell-sm text-left text-sm text-shell-text-primary transition hover:bg-shell-surface-raised disabled:cursor-not-allowed disabled:opacity-50"
              >
                PDF report
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => onExport('both')}
                className="block w-full rounded-shell-lg px-shell-md py-shell-sm text-left text-sm text-shell-text-primary transition hover:bg-shell-surface-raised disabled:cursor-not-allowed disabled:opacity-50"
              >
                PNG + PDF
              </button>
            </div>
          </details>

          {/* Actions menu */}
          <details className="relative">
            <summary className="list-none cursor-pointer rounded-shell-pill border border-shell-border px-shell-md py-shell-sm text-sm font-semibold text-shell-text-primary transition hover:border-shell-border-strong hover:bg-shell-surface-raised">
              Actions
            </summary>
            <div className="absolute right-0 z-10 mt-2 min-w-48 rounded-shell-xl border border-shell-border bg-shell-surface p-1 shadow-shell-lg">
              <button
                type="button"
                onClick={onOpenEntityModal}
                className="block w-full rounded-shell-lg px-shell-md py-shell-sm text-left text-sm text-shell-text-primary transition hover:bg-shell-surface-raised"
              >
                Add entity
              </button>
              <button
                type="button"
                onClick={onOpenConnectionModal}
                className="block w-full rounded-shell-lg px-shell-md py-shell-sm text-left text-sm text-shell-text-primary transition hover:bg-shell-surface-raised"
              >
                Add connection
              </button>
              <button
                type="button"
                onClick={onClearHighlights}
                className="block w-full rounded-shell-lg px-shell-md py-shell-sm text-left text-sm text-shell-text-primary transition hover:bg-shell-surface-raised"
              >
                Clear evidence highlight
              </button>
            </div>
          </details>
        </div>
      </div>

      {/* Stats and view mode row */}
      <div className="mt-shell-md flex flex-col gap-shell-sm border-t border-shell-border pt-shell-md lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-shell-sm">
          <span className="rounded-shell-pill border border-shell-border bg-shell-surface-raised px-shell-md py-shell-sm text-sm text-shell-text-secondary">
            {entityCount} entities
          </span>
          <span className="rounded-shell-pill border border-shell-border bg-shell-surface-raised px-shell-md py-shell-sm text-sm text-shell-text-secondary">
            {connectionCount} connections
          </span>
          {highlightedCount > 0 && (
            <span className="rounded-shell-pill border border-shell-accent/30 bg-shell-accent-muted px-shell-md py-shell-sm text-sm text-shell-accent">
              {highlightedCount} highlighted
            </span>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-shell-sm">
          <button
            type="button"
            aria-label="2D view"
            onClick={() => onSetViewMode('2d')}
            className={`rounded-shell-pill px-shell-md py-shell-sm text-sm font-medium transition ${
              viewMode === '2d'
                ? 'bg-shell-accent text-shell-accent-fg'
                : 'border border-shell-border text-shell-text-secondary hover:border-shell-border-strong hover:text-shell-text-primary'
            }`}
          >
            2D view
          </button>
          <button
            type="button"
            aria-label="3D view"
            onClick={() => onSetViewMode('3d')}
            className={`rounded-shell-pill px-shell-md py-shell-sm text-sm font-medium transition ${
              viewMode === '3d'
                ? 'bg-shell-accent text-shell-accent-fg'
                : 'border border-shell-border text-shell-text-secondary hover:border-shell-border-strong hover:text-shell-text-primary'
            }`}
          >
            3D view
          </button>
        </div>
      </div>
    </header>
  );
}
