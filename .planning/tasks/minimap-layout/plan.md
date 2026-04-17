# Plan: Minimap Layout Redesign

Spec: `.planning/specs/minimap-layout.md`

## Dependency Graph

```
Task 1: ForceGraph2D.panTo ──────────────────────────────┐
                                                          ▼
Task 2: MindMap3D.panTo ─────────────────────────────► Task 4: Wire GraphWorkspace ──► Task 5: Toolbar Toggle
                                                          ▲
Task 3: GraphMinimap redesign + interactivity ───────────┘
```

Tasks 1, 2, 3 are independent — no inter-dependencies.
Task 4 depends on 1, 2, 3 all complete.
Task 5 depends on 4.

---

## Task 1: Add `panTo` to `ForceGraph2DExportHandle`

**File:** `src/components/graph/ForceGraph2D.tsx`

**What:**
- Add `panTo(nx: number, ny: number): void` to `ForceGraph2DExportHandle` interface.
- Implement inside `useImperativeHandle`.

**Implementation:**
```typescript
panTo: (nx: number, ny: number) => {
  const selection = d3SelectionRef.current;
  const behavior = zoomBehaviorRef.current;
  if (!selection || !behavior || nodesRef.current.length === 0) return;
  const bounds = getGraphBounds(nodesRef.current);
  const worldX = bounds.minX + nx * bounds.width;
  const worldY = bounds.minY + ny * bounds.height;
  const k = transformRef.current.k;
  const nextTransform = zoomIdentity
    .translate(
      viewportRef.current.width / 2 - worldX * k,
      viewportRef.current.height / 2 - worldY * k,
    )
    .scale(k);
  selection.call(behavior.transform, nextTransform);
  userAdjustedViewportRef.current = true;
  emitMinimapState();
},
```

- Uses only refs (stable) — `useImperativeHandle` deps stay `[]`.
- `getGraphBounds` already imported; `zoomIdentity` already imported.

**Acceptance:** `ForceGraph2DExportHandle.panTo` exists and TypeScript accepts it. Calling it shifts the D3 zoom transform so that the world point `(bounds.minX + nx*width, bounds.minY + ny*height)` lands at canvas center, preserving current scale.

**Verify:** `pnpm exec tsc --noEmit` (no new errors). Manual: click minimap → 2D graph pans.

---

## Task 2: Add `panTo` to `MindMap3DExportHandle`

**File:** `src/components/graph/MindMap3D.tsx`

**What:**
- Add `panTo(nx: number, ny: number): void` to `MindMap3DExportHandle` interface.
- Implement inside `useImperativeHandle`.

**Implementation:**
```typescript
panTo: (nx: number, ny: number) => {
  const frame = frameRef.current;
  const viewport = viewportRef.current;
  if (!frame || frame.projectedNodes.length === 0) return;
  const projectedNodes = frame.projectedNodes;
  const minX = Math.min(...projectedNodes.map((n) => n.sx));
  const maxX = Math.max(...projectedNodes.map((n) => n.sx));
  const minY = Math.min(...projectedNodes.map((n) => n.sy));
  const maxY = Math.max(...projectedNodes.map((n) => n.sy));
  const targetX = minX + nx * (maxX - minX);
  const targetY = minY + ny * (maxY - minY);
  cameraRef.current.offsetX += viewport.width / 2 - targetX;
  cameraRef.current.offsetY += viewport.height / 2 - targetY;
  autoRotateRef.current = false;
  needsRedrawRef.current = true;
  emitMinimapState();
},
```

- `frameRef.current.projectedNodes` has `sx`, `sy` (screen-space positions).
- `offsetX`/`offsetY` are screen-pixel pans applied in the renderer.
- `useImperativeHandle` deps are `[graph]` — no change needed (all values accessed via refs).

**Acceptance:** `MindMap3DExportHandle.panTo` exists. Calling it adjusts `cameraRef.current.offsetX/Y` so the clicked minimap point moves toward canvas center. Auto-rotate stops on pan.

**Verify:** `pnpm exec tsc --noEmit`. Manual: click minimap → 3D view pans.

---

## ✅ Checkpoint 1

Both renderer handles export `panTo`. `pnpm exec tsc --noEmit` passes.

---

## Task 3: Redesign `GraphMinimap` — visual + interactivity

**File:** `src/components/graph/GraphMinimap.tsx`

**What:**

**Props changes:**
- Add `width?: number` — pixel width from parent (used as inline style). Falls back to `144` (same as current `w-36`).
- Add `onPanTo?: (nx: number, ny: number) => void` — called on SVG click/drag.

**Visual changes — remove:**
- Outer container: remove `pointer-events-none`, `bg-shell-surface/90`, `backdrop-blur`, `p-3`, `w-36`.
- The entire `mb-2` header div (`<p>Minimap</p>` + `<span>` badge) — delete it.

**Visual changes — keep/update:**
- Container: `absolute bottom-4 right-4 z-20 rounded-shell-xl border border-shell-border shadow-[0_4px_24px_rgba(0,0,0,0.22)] overflow-hidden`
- Apply `style={{ width: width ?? 144 }}` inline for proportional sizing.
- SVG: remove `h-24` fixed height → `w-full aspect-square` so it scales with container width.
- SVG keeps `bg-shell-bg` fill so dots are readable.

**Interactivity:**
- Track `isDragging` with `useRef<boolean>`.
- On SVG `onMouseDown`: set dragging = true, call `handlePointerEvent`.
- On SVG `onMouseMove`: if dragging, call `handlePointerEvent`.
- On window `mouseup` (effect): set dragging = false.
- `handlePointerEvent(event: React.MouseEvent<SVGSVGElement>)`:
  ```typescript
  const rect = event.currentTarget.getBoundingClientRect();
  const nx = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const ny = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
  onPanTo?.(nx, ny);
  ```
- SVG cursor: `className="cursor-crosshair"`.
- No `pointer-events-none` on container when `onPanTo` is provided.

**Acceptance:**
- No label text visible.
- No opaque background on container — border + shadow only.
- SVG scales with `width` prop.
- Click on SVG calls `onPanTo` with correct normalized coords.
- Drag on SVG continuously calls `onPanTo`.

**Verify:** `pnpm exec tsc --noEmit`. Visual: open app, minimap is borderless chip, no label.

---

## ✅ Checkpoint 2

`GraphMinimap` redesigned. `pnpm exec tsc --noEmit` passes. Visual check: no text, no bg, border + shadow visible.

---

## Task 4: Wire `GraphWorkspace` — proportional size + showMinimap + panTo routing

**File:** `src/components/graph/GraphWorkspace.tsx`

**What:**

**New prop:**
- Add `showMinimap?: boolean` to `GraphWorkspaceProps` (default `true`).

**ResizeObserver for proportional width:**
- Add `const [minimapWidth, setMinimapWidth] = useState(144)`.
- Add a new `useRef` for the canvas container div: `const graphCanvasContainerRef = useRef<HTMLDivElement | null>(null)`.
- `useEffect` with `ResizeObserver` on `graphCanvasContainerRef`:
  ```typescript
  useEffect(() => {
    const el = graphCanvasContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setMinimapWidth(Math.max(80, Math.min(240, Math.round(w * 0.2))));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  ```
- Attach `ref={graphCanvasContainerRef}` to the `<div className="relative min-h-0 flex-1">` wrapper div.

**`onPanTo` routing:**
- Add handler:
  ```typescript
  const handleMinimapPanTo = useCallback((nx: number, ny: number) => {
    if (viewMode === '2d') {
      forceGraphRef.current?.panTo(nx, ny);
    } else {
      mindMapRef.current?.panTo(nx, ny);
    }
  }, [viewMode]);
  ```
- Pass to `GraphMinimap`: `onPanTo={handleMinimapPanTo}`.

**Conditional render:**
- Wrap `<GraphMinimap ... />` in `{(showMinimap ?? true) && <GraphMinimap ... />}`.
- Pass `width={minimapWidth}` to `GraphMinimap`.

**Acceptance:**
- `showMinimap={false}` hides the minimap.
- `showMinimap={true}` (default) shows it at 20% canvas width, clamped 80–240.
- Clicking/dragging minimap calls `panTo` on the active renderer.

**Verify:** `pnpm exec tsc --noEmit`. `pnpm test`. Manual: resize browser → minimap scales; click minimap → graph pans.

---

## ✅ Checkpoint 3

End-to-end pan works. `pnpm exec tsc --noEmit` + `pnpm test` pass.

---

## Task 5: Minimap toggle button in `CaseWorkspaceShell` toolbar

**File:** `src/components/layout/CaseWorkspaceShell.tsx`

**What:**
- Add `const [showMinimap, setShowMinimap] = useState(true)` to shell state.
- Add toggle button in the toolbar (right-side button group, before the analysis panel toggle):
  ```tsx
  <button
    type="button"
    onClick={() => setShowMinimap((v) => !v)}
    className={`rounded p-1 transition ${showMinimap ? 'text-shell-accent' : 'text-shell-text-muted hover:text-shell-text-secondary'}`}
    title="Toggle minimap"
  >
    {/* Map/grid icon — 4 quadrant squares */}
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
    </svg>
  </button>
  ```
- Pass `showMinimap={showMinimap}` to `<GraphWorkspace ... />`.

**Acceptance:**
- Toolbar shows minimap toggle icon (grid squares).
- Clicking toggles minimap on/off. Active state uses `text-shell-accent` (same as analysis panel toggle pattern).
- Minimap prop flows from shell → workspace → rendered or hidden.

**Verify:** `pnpm exec tsc --noEmit`. `pnpm test`. `pnpm build`. Manual: click toggle → minimap disappears/reappears.

---

## ✅ Checkpoint 4 (Final)

All tasks complete. Full verification:
- [ ] `pnpm exec tsc --noEmit` passes
- [ ] `pnpm test` passes (all existing tests green)
- [ ] `pnpm build` passes
- [ ] Manual: toolbar toggle shows/hides minimap
- [ ] Manual: minimap scales to 20% canvas width
- [ ] Manual: no header text or background on minimap
- [ ] Manual: click minimap pans 2D graph
- [ ] Manual: click minimap pans 3D view

---
*Created: 2026-04-17 · Feature: minimap-layout*
