'use client';

import { type EntityType, ENTITY_TYPE_COLOR } from '@/lib/graph/graphTypes';
import { type LayerPreferences } from '@/store/caseStore';
import { useMemo, useRef, useState } from 'react';

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

function HintTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-shell-border bg-shell-surface-raised text-[10px] font-semibold text-shell-text-muted transition hover:border-shell-accent/40 hover:text-shell-accent"
        aria-label="More info"
      >
        ?
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-50 w-52 rounded-shell-lg border border-shell-border bg-shell-surface-raised px-3 py-2 text-xs text-shell-text-secondary shadow-shell-sm">
          {text}
        </div>
      )}
    </div>
  );
}

const SECTION_ICONS = {
  entityTypes: (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <circle cx="4" cy="6" r="2" />
      <circle cx="20" cy="6" r="2" />
      <circle cx="4" cy="18" r="2" />
      <circle cx="20" cy="18" r="2" />
      <path d="M9.5 10.5L6 7.5M14.5 10.5L18 7.5M9.5 13.5L6 16.5M14.5 13.5L18 16.5" />
    </svg>
  ),
  connectionLayers: (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  ),
  timeRange: (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
} as const;

function SectionHeader({ icon, title, hint }: { icon: React.ReactNode; title: string; hint: string }) {
  return (
    <div className="mb-shell-sm flex items-center gap-2">
      <span className="text-shell-accent">{icon}</span>
      <h3 className="flex-1 text-sm font-semibold text-shell-text-primary">{title}</h3>
      <HintTooltip text={hint} />
    </div>
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
        <SectionHeader
          icon={SECTION_ICONS.entityTypes}
          title="Entity Types"
          hint="Control which node families remain active in the workspace."
        />

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
        <SectionHeader
          icon={SECTION_ICONS.connectionLayers}
          title="Connection Layers"
          hint="Keep relationship context lightweight while preserving the shared graph controls."
        />

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
        <SectionHeader
          icon={SECTION_ICONS.timeRange}
          title="Time Range"
          hint="Reserve the chronology frame inside the workspace shell. Interactive filtering deepens later."
        />

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
