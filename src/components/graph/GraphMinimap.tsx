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
  height,
  onPanTo,
  onPanMove,
}: {
  state: GraphMinimapState;
  width?: number;
  height?: number;
  onPanTo?: (nx: number, ny: number) => void;
  onPanMove?: (dnx: number, dny: number) => void;
}) {
  const isDraggingRef = useRef(false);
  const prevPosRef = useRef<{ nx: number; ny: number } | null>(null);
  const w = width ?? 144;
  const h = height ?? w; // default square if height not supplied
  // viewBox matches the container's aspect ratio so circles stay round (no stretch)
  const vbW = 100;
  const vbH = w > 0 ? (100 * h) / w : 100;
  const viewportX = clamp01(state.viewport.x) * vbW;
  const viewportY = clamp01(state.viewport.y) * vbH;
  const viewportWidth = clamp01(state.viewport.width) * vbW;
  const viewportHeight = clamp01(state.viewport.height) * vbH;
  const interactive = !!(onPanTo || onPanMove);

  return (
    <div
      className="absolute bottom-4 right-4 z-20 overflow-hidden rounded-shell-xl border border-shell-border shadow-[0_4px_24px_rgba(0,0,0,0.22)]"
      style={{ width: w, height: h }}
    >
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        aria-label="Workspace minimap"
        className={`w-full h-full overflow-hidden bg-shell-bg/50 ${interactive ? 'cursor-crosshair' : ''}`}
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
          const x = clamp01(point.x) * vbW;
          const y = clamp01(point.y) * vbH;
          const radius = point.active ? 3.2 : point.related ? 2.6 : 2.1;
          const opacity = point.dimmed ? 0.28 : point.active ? 1 : point.related ? 0.9 : 0.7;
          const strokeColor = point.active
            ? 'rgba(255,255,255,0.9)'
            : point.related
            ? 'rgba(255,255,255,0.55)'
            : 'none';
          const strokeWidth = point.active ? 1.2 : point.related ? 1 : 0;

          return (
            <circle
              key={point.id}
              cx={x}
              cy={y}
              r={radius}
              fill={point.color}
              opacity={opacity}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          );
        })}

        <rect
          x={viewportX}
          y={viewportY}
          width={Math.max(10, viewportWidth)}
          height={Math.max(10, viewportHeight)}
          rx={3}
          fill="rgba(124,58,237,0.07)"
          stroke="rgba(124,58,237,0.8)"
          strokeWidth={1.5}
        />
      </svg>
    </div>
  );
}
