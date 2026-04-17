# Spec: Minimap Layout Redesign

## Objective

Improve the graph minimap widget to be visually cleaner, proportionally sized, toggleable from the toolbar, and interactive (click/drag to pan the graph).

**User:** Detective workspace user navigating large case graphs.

**Success looks like:** The minimap is unobtrusive (no background, no label text), sized at 20% of the graph canvas width, shows/hides via a toolbar toggle, and clicking/dragging on it pans the active graph renderer to that position.

## Tech Stack

Next.js 15 App Router · React 19 · TypeScript · Tailwind CSS · D3 (ForceGraph2D) · custom canvas (MindMap3D)

## Commands

```bash
pnpm dev          # start dev server
pnpm build        # verify no TS/build errors
pnpm test         # run Jest suite
pnpm exec tsc --noEmit  # type-check only
```

## Project Structure

Affected files:
```
src/components/graph/
  GraphMinimap.tsx            — visual redesign + click/drag interactivity
  graphMinimapTypes.ts        — add onPanTo callback type
  GraphWorkspace.tsx          — pass showMinimap prop; route panTo from minimap → renderer refs
  ForceGraph2D.tsx            — add panTo(nx, ny) to ForceGraph2DExportHandle
  MindMap3D.tsx               — add panTo(nx, ny) to MindMap3DExportHandle

src/components/layout/
  CaseWorkspaceShell.tsx      — add showMinimap state + toolbar toggle button

src/components/pages/
  CaseWorkspacePage.tsx       — no changes expected (shell owns the state)
```

## Requirements

### 1. Toggle in toolbar

- Add a `showMinimap` boolean state (default `true`) to `CaseWorkspaceShell`.
- Add a toolbar button (icon: a small map/grid square) that toggles `showMinimap`.
- Active state: same accent highlight pattern as the analysis panel toggle button.
- Pass `showMinimap` as a prop to `GraphWorkspace`, which conditionally renders `GraphMinimap`.

### 2. Proportional size (20% of canvas width)

- The minimap container must be sized at 20% of the graph canvas container width.
- Implementation: attach a `ResizeObserver` in `GraphWorkspace` to the canvas container (`relative min-h-0 flex-1` div). Compute `minimapWidth = containerWidth * 0.2`. Pass as a style prop to `GraphMinimap`.
- The SVG inside fills the full container width. Aspect ratio: 1:1 (square SVG viewBox stays `0 0 100 100`).
- The minimap has a `min-width: 80px` and `max-width: 240px` clamp so it stays usable at extreme resolutions.

### 3. Visual redesign — no background, no text

Remove:
- The `mb-2` header row (`Minimap` label + `2D`/`3D` badge) — entire element gone.
- `bg-shell-surface/90 backdrop-blur` background fill.
- `p-3` padding (replace with `p-0` or thin `p-1` for the border inset).

Keep / add:
- Border: `border border-shell-border` — unchanged.
- Shadow: upgrade from `shadow-shell-md` to `shadow-shell-lg` (or `shadow-[0_4px_24px_rgba(0,0,0,0.18)]` if shell token is insufficient).
- Rounded corners: `rounded-shell-xl` — unchanged.
- The SVG itself remains with `bg-shell-bg` fill so node dots are visible against the graph background.

Result: the minimap looks like a floating borderless window — just a rounded SVG with a subtle shadow, no chrome.

### 4. Click / drag to pan

- `GraphMinimap` receives an `onPanTo?: (nx: number, ny: number) => void` callback (normalized 0–1 coords).
- On `mousedown` / `mousemove` (while button held) on the SVG, compute `nx = clientX_relative / svgWidth`, `ny = clientY_relative / svgHeight`, call `onPanTo(nx, ny)`.
- Make the component `pointer-events-auto` (remove `pointer-events-none`).
- `GraphWorkspace` wires `onPanTo` → calls `forceGraphRef.current?.panTo(nx, ny)` or `mindMapRef.current?.panTo(nx, ny)` depending on `viewMode`.

**ForceGraph2D panTo:**
- D3 force simulation uses a zoom transform on the canvas. Implement `panTo(nx, ny)` by translating the D3 zoom transform so the canvas center aligns with the normalized position scaled to graph bounds.
- Expose via `ForceGraph2DExportHandle.panTo(nx: number, ny: number): void`.

**MindMap3D panTo:**
- The 3D renderer has its own camera/offset state. Implement `panTo(nx, ny)` by computing a world-space offset from the normalized coordinate and updating the camera state.
- Expose via `MindMap3DExportHandle.panTo(nx: number, ny: number): void`.

**Cursor:**
- SVG cursor: `cursor-crosshair` when hovering, `cursor-grabbing` while dragging.

## Success Criteria

- [ ] Toolbar has a minimap toggle button; clicking it shows/hides the minimap.
- [ ] Minimap is 20% of the graph canvas width (clamped 80–240px), proportional, no fixed `w-36`.
- [ ] No header text row ("Minimap" label, "2D"/"3D" badge) visible.
- [ ] No opaque background fill on the container — border + shadow only.
- [ ] Clicking on the minimap SVG pans the active graph renderer to the clicked position.
- [ ] Dragging on the minimap SVG continuously pans the renderer.
- [ ] `pnpm exec tsc --noEmit` passes with no new errors.
- [ ] `pnpm test` passes (existing tests unchanged; new tests for panTo if feasible).
- [ ] `pnpm build` passes.

## Boundaries

- **Always:** Run `pnpm exec tsc --noEmit` + `pnpm test` after each task before marking done.
- **Ask first:** Changing the `GraphMinimapState` data shape (adding fields that break existing renderers), changing toolbar layout beyond adding one button.
- **Never:** Remove the fallback minimap state (used when renderer hasn't emitted positions yet). Never touch `graphTypes.ts` Zod schemas for this feature.

## Open Questions

- None. All requirements confirmed by user.

---
*Created: 2026-04-17 · Feature: minimap-layout*
