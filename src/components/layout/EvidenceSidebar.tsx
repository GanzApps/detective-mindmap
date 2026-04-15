'use client';

import { type ReactNode, useState } from 'react';

type RailTab = 'evidence' | 'filters';

export default function EvidenceSidebar({
  searchPanel,
  filtersPanel,
  entitiesPanel,
}: {
  searchPanel?: ReactNode;
  filtersPanel?: ReactNode;
  entitiesPanel?: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<RailTab>('evidence');

  return (
    <aside className="flex h-full min-h-[620px] flex-col rounded-shell-xl border border-shell-border bg-shell-surface p-shell-md shadow-shell-md">
      {searchPanel ? <div className="mb-shell-md">{searchPanel}</div> : null}

      <div className="mb-shell-md flex rounded-shell-lg border border-shell-border bg-shell-surface-raised p-1">
        <button
          type="button"
          onClick={() => setActiveTab('evidence')}
          className={`flex-1 rounded-shell-lg px-2 py-shell-sm text-xs font-medium transition ${
            activeTab === 'evidence'
              ? 'bg-shell-accent text-white shadow-shell-sm'
              : 'text-shell-text-secondary hover:bg-shell-surface'
          }`}
        >
          Evidence
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('filters')}
          className={`flex-1 rounded-shell-lg px-2 py-shell-sm text-xs font-medium transition ${
            activeTab === 'filters'
              ? 'bg-shell-accent text-white shadow-shell-sm'
              : 'text-shell-text-secondary hover:bg-shell-surface'
          }`}
        >
          Filters
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'filters' ? (
          filtersPanel ?? (
            <div className="rounded-shell-lg border border-shell-border bg-shell-surface-raised p-shell-md text-sm text-shell-text-secondary">
              Filters are not available yet.
            </div>
          )
        ) : (
          entitiesPanel ?? (
            <div className="rounded-shell-lg border border-shell-border bg-shell-surface-raised p-shell-md text-sm text-shell-text-secondary">
              No entities panel provided.
            </div>
          )
        )}
      </div>
    </aside>
  );
}
