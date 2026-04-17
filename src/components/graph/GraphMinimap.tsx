'use client';

import { useRef } from 'react';
import { type GraphMinimapState } from '@/components/graph/graphMinimapTypes';

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export default function GraphMinimap({
  state,
  width,
  onPanTo,
}: {
  state: GraphMinimapState;
  width?: number;
  onPanTo?: (nx: number, ny: number) => void;
}) {
  const isDraggingRef = useRef(false);
  const viewBoxSize = 100;
  const viewportX = clamp01(state.viewport.x) * viewBoxSize;
  const viewportY = clamp01(state.viewport.y) * viewBoxSize;
  const viewportWidth = clamp01(state.viewport.width) * viewBoxSize;
  const viewportHeight = clamp01(state.viewport.height) * viewBoxSize;

  function handlePointerEvent(event: React.MouseEvent<SVGSVGElement>) {
    if (!onPanTo) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const nx = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    onPanTo(nx, ny);
  }

  return (
    <div
      className="absolute bottom-4 right-4 z-20 overflow-hidden rounded-shell-xl border border-shell-border shadow-[0_4px_24px_rgba(0,0,0,0.22)]"
      style={{ width: width ?? 144 }}
    >
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        aria-label="Workspace minimap"
        className={`w-full ${onPanTo ? 'cursor-crosshair' : ''} aspect-square overflow-hidden rounded-shell-xl bg-shell-bg`}
        onMouseDown={(event) => {
          if (!onPanTo) return;
          isDraggingRef.current = true;
          handlePointerEvent(event);
        }}
        onMouseMove={(event) => {
          if (!isDraggingRef.current || !onPanTo || event.buttons === 0) return;
          handlePointerEvent(event);
        }}
        onMouseUp={() => {
          isDraggingRef.current = false;
        }}
        onMouseLeave={() => {
          isDraggingRef.current = false;
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
