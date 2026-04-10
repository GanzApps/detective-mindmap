'use client';

import { type GraphMinimapState } from '@/components/graph/graphMinimapTypes';

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export default function GraphMinimap({
  state,
}: {
  state: GraphMinimapState;
}) {
  const viewBoxSize = 100;
  const viewportX = clamp01(state.viewport.x) * viewBoxSize;
  const viewportY = clamp01(state.viewport.y) * viewBoxSize;
  const viewportWidth = clamp01(state.viewport.width) * viewBoxSize;
  const viewportHeight = clamp01(state.viewport.height) * viewBoxSize;

  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-20 w-36 rounded-shell-xl border border-shell-border bg-shell-surface/90 p-3 shadow-shell-md backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-shell-text-muted">
          Minimap
        </p>
        <span className="rounded-shell-pill border border-shell-border bg-shell-surface-raised px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-shell-text-secondary">
          {state.label}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        aria-label="Workspace minimap"
        className="h-24 w-full overflow-hidden rounded-shell-lg border border-shell-border bg-shell-bg"
      >
        {state.points.map((point) => {
          const x = clamp01(point.x) * viewBoxSize;
          const y = clamp01(point.y) * viewBoxSize;
          const radius = point.active ? 3.1 : 2.1;

          return (
            <circle
              key={point.id}
              cx={x}
              cy={y}
              r={radius}
              fill={point.color}
              opacity={point.dimmed ? 0.35 : point.active ? 0.95 : 0.75}
              stroke={point.active ? 'rgba(15,23,42,0.85)' : 'none'}
              strokeWidth={point.active ? 1 : 0}
            />
          );
        })}

        <rect
          x={viewportX}
          y={viewportY}
          width={Math.max(10, viewportWidth)}
          height={Math.max(10, viewportHeight)}
          rx={4}
          fill="rgba(124,58,237,0.08)"
          stroke="rgba(124,58,237,0.85)"
          strokeWidth={1.5}
        />
      </svg>
    </div>
  );
}
