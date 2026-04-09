'use client';

import { type Case } from '@/lib/data/dataTypes';
import { type ExportFormat } from '@/lib/export/exportTypes';

function statusClasses(status: Case['status']) {
  switch (status) {
    case 'active':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100';
    case 'closed':
      return 'border-amber-400/20 bg-amber-400/10 text-amber-100';
    case 'archived':
      return 'border-slate-400/20 bg-slate-400/10 text-slate-200';
    default:
      return 'border-slate-400/20 bg-slate-400/10 text-slate-200';
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
    <header className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/70">
              Investigation Workspace
            </p>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] ${statusClasses(caseData.status)}`}
            >
              {caseData.status}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
              {caseData.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              {caseData.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <details className="relative">
            <summary className="list-none rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-300/10">
              {isExporting ? 'Exporting...' : 'Export Report'}
            </summary>
            <div className="absolute right-0 z-10 mt-3 min-w-56 rounded-2xl border border-slate-800 bg-slate-950/95 p-2 shadow-2xl shadow-black/40">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => onExport('png')}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                PNG snapshot
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => onExport('pdf')}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                PDF report
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => onExport('both')}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                PNG + PDF
              </button>
            </div>
          </details>
          <details className="relative">
            <summary className="list-none rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500">
              Actions
            </summary>
            <div className="absolute right-0 z-10 mt-3 min-w-56 rounded-2xl border border-slate-800 bg-slate-950/95 p-2 shadow-2xl shadow-black/40">
              <button
                type="button"
                onClick={onOpenEntityModal}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-900"
              >
                Add entity
              </button>
              <button
                type="button"
                onClick={onOpenConnectionModal}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-900"
              >
                Add connection
              </button>
              <button
                type="button"
                onClick={onClearHighlights}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-900"
              >
                Clear evidence highlight
              </button>
            </div>
          </details>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-slate-800 pt-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="rounded-full border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm text-slate-200">
            {entityCount} entities
          </div>
          <div className="rounded-full border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm text-slate-200">
            {connectionCount} connections
          </div>
          <div className="rounded-full border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm text-slate-200">
            {highlightedCount} highlighted
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onSetViewMode('2d')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              viewMode === '2d'
                ? 'bg-slate-100 text-slate-950'
                : 'border border-slate-700 text-slate-200 hover:border-slate-500'
            }`}
          >
            2D view
          </button>
          <button
            type="button"
            onClick={() => onSetViewMode('3d')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              viewMode === '3d'
                ? 'bg-slate-100 text-slate-950'
                : 'border border-slate-700 text-slate-200 hover:border-slate-500'
            }`}
          >
            3D view
          </button>
        </div>
      </div>
    </header>
  );
}
