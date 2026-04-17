'use client';

import { useRef } from 'react';
import { type GraphMinimapState } from '@/components/graph/graphMinimapTypes';

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function readNormalized(event: React.MouseEvent<SVGSVGElement>): { nx: number; ny: number } | null {
  const rect = event.currentTarget.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;
  return {
    nx: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
    ny: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
  };
}

export default function GraphMinimap({
  state,
  width,
  onPanTo,
  onPanMove,
}: {
  state: GraphMinimapState;
  width?: number;
  onPanTo?: (nx: number, ny: number) => void;
  onPanMove?: (dnx: number, dny: number) => void;
}) {
  const isDraggingRef = useRef(false);
  const prevPosRef = useRef<{ nx: number; ny: number } | null>(null);
  const viewBoxSize = 100;
  const viewportX = clamp01(state.viewport.x) * viewBoxSize;
  const viewportY = clamp01(state.viewport.y) * viewBoxSize;
  const viewportWidth = clamp01(state.viewport.width) * viewBoxSize;
  const viewportHeight = clamp01(state.viewport.height) * viewBoxSize;
  const interactive = !!(onPanTo || onPanMove);

  return (
    <div
      className="absolute bottom-4 right-4 z-20 overflow-hidden rounded-shell-xl border border-shell-border shadow-[0_4px_24px_rgba(0,0,0,0.22)]"
      style={{ width: width ?? 144 }}
    >
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        aria-label="Workspace minimap"
        className={`w-full aspect-square overflow-hidden rounded-shell-xl bg-shell-bg/50 ${interactive ? 'cursor-crosshair' : ''}`}
        onMouseDown={(event) => {
          if (!interactive) return;
          isDraggingRef.current = true;
          const pos = readNormalized(event);
          if (!pos) return;
          prevPosRef.current = pos;
          onPanTo?.(pos.nx, pos.ny);
        }}
        onMouseMove={(event) => {
          if (!isDraggingRef.current || !onPanMove || event.buttons === 0) return;
          const pos = readNormalized(event);
          if (!pos) return;
          const prev = prevPosRef.current;
          if (prev) {
            const dnx = pos.nx - prev.nx;
            const dny = pos.ny - prev.ny;
            if (dnx !== 0 || dny !== 0) {
              onPanMove(dnx, dny);
            }
          }
          prevPosRef.current = pos;
        }}
        onMouseUp={() => {
          isDraggingRef.current = false;
          prevPosRef.current = null;
        }}
        onMouseLeave={() => {
          isDraggingRef.current = false;
          prevPosRef.current = null;
        }}
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
