'use client';

import { type EntityType, ENTITY_TYPE_COLOR } from '@/lib/graph/graphTypes';
import { type LayerPreferences } from '@/store/caseStore';
import { useMemo, useState } from 'react';

const ENTITY_LABELS: Record<EntityType, string> = {
  person: 'People',
  location: 'Locations',
  event: 'Events',
  evidence: 'Transactions',
  organization: 'Organizations',
  vehicle: 'Vehicles',
  digital: 'Digital',
};

function formatDateLabel(value: string) {
  return value.slice(0, 10);
}

function FilterToggle({
  label,
  checked,
  count,
  accent,
  onChange,
}: {
  label: string;
  checked: boolean;
  count?: number;
  accent?: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-shell-sm rounded-shell-lg border border-shell-border bg-shell-surface-raised px-shell-md py-shell-sm text-sm text-shell-text-primary">
      <div className="flex items-center gap-shell-sm">
        {accent ? (
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: accent }}
          />
        ) : null}
        <span>{label}</span>
      </div>

      <div className="flex items-center gap-shell-sm">
        {typeof count === 'number' ? (
          <span className="rounded-shell-pill border border-shell-border bg-shell-surface px-2 py-0.5 text-xs text-shell-text-muted">
            {count}
          </span>
        ) : null}
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 rounded border-shell-border bg-shell-bg text-[var(--shell-accent)]"
        />
      </div>
    </label>
  );
}

export default function WorkspaceFiltersPanel({
  activeFilters,
  typeCounts,
  layerPreferences,
  onToggleEntityFilter,
  onSetLayerPreference,
  dateRange,
}: {
  activeFilters: EntityType[];
  typeCounts: Map<EntityType, number>;
  layerPreferences: LayerPreferences;
  onToggleEntityFilter: (entityType: EntityType) => void;
  onSetLayerPreference: <K extends keyof LayerPreferences>(
    key: K,
    value: LayerPreferences[K],
  ) => void;
  dateRange: {
    from: string;
    to: string;
  };
}) {
  const [localDates, setLocalDates] = useState(dateRange);

  const entityEntries = useMemo(
    () => Object.entries(ENTITY_LABELS) as [EntityType, string][],
    [],
  );

  return (
    <div className="space-y-shell-md">
      <section className="rounded-shell-lg border border-shell-border bg-shell-surface p-shell-md shadow-shell-sm">
        <div className="mb-shell-sm flex items-center gap-shell-sm">
          <span className="text-sm text-shell-accent">⌁</span>
          <div>
            <h3 className="text-sm font-semibold text-shell-text-primary">Entity Types</h3>
            <p className="mt-1 text-xs text-shell-text-muted">
              Control which node families remain active in the workspace.
            </p>
          </div>
        </div>

        <div className="space-y-shell-sm">
          {entityEntries.map(([entityType, label]) => (
            <FilterToggle
              key={entityType}
              label={label}
              checked={activeFilters.includes(entityType)}
              count={typeCounts.get(entityType) ?? 0}
              accent={ENTITY_TYPE_COLOR[entityType]}
              onChange={() => onToggleEntityFilter(entityType)}
            />
          ))}
        </div>
      </section>

      <section className="rounded-shell-lg border border-shell-border bg-shell-surface p-shell-md shadow-shell-sm">
        <div className="mb-shell-sm">
          <h3 className="text-sm font-semibold text-shell-text-primary">Connection Layers</h3>
          <p className="mt-1 text-xs text-shell-text-muted">
            Keep relationship context lightweight while preserving the shared graph controls.
          </p>
        </div>

        <div className="space-y-shell-sm">
          <FilterToggle
            label="Edge Labels"
            checked={layerPreferences.showEdgeLabels}
            onChange={(checked) => onSetLayerPreference('showEdgeLabels', checked)}
          />
          <FilterToggle
            label="Node Labels"
            checked={layerPreferences.showNodeLabels}
            onChange={(checked) => onSetLayerPreference('showNodeLabels', checked)}
          />
          <FilterToggle
            label="Focused Network"
            checked={layerPreferences.focusSelectedNeighborhood}
            onChange={(checked) => onSetLayerPreference('focusSelectedNeighborhood', checked)}
          />
        </div>
      </section>

      <section className="rounded-shell-lg border border-shell-border bg-shell-surface p-shell-md shadow-shell-sm">
        <div className="mb-shell-sm">
          <h3 className="text-sm font-semibold text-shell-text-primary">Time Range</h3>
          <p className="mt-1 text-xs text-shell-text-muted">
            Reserve the chronology frame inside the workspace shell. Interactive filtering deepens later.
          </p>
        </div>

        <div className="grid gap-shell-sm">
          <label className="grid gap-1 text-xs uppercase tracking-[0.18em] text-shell-text-muted">
            From
            <input
              type="date"
              value={localDates.from}
              onChange={(event) => setLocalDates((current) => ({ ...current, from: event.target.value }))}
              className="rounded-shell-lg border border-shell-border bg-shell-surface-raised px-shell-md py-shell-sm text-sm tracking-normal text-shell-text-primary outline-none"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-[0.18em] text-shell-text-muted">
            To
            <input
              type="date"
              value={localDates.to}
              onChange={(event) => setLocalDates((current) => ({ ...current, to: event.target.value }))}
              className="rounded-shell-lg border border-shell-border bg-shell-surface-raised px-shell-md py-shell-sm text-sm tracking-normal text-shell-text-primary outline-none"
            />
          </label>
          <p className="text-xs text-shell-text-muted">
            Current workspace range: {formatDateLabel(localDates.from)} to {formatDateLabel(localDates.to)}
          </p>
        </div>
      </section>
    </div>
  );
}
