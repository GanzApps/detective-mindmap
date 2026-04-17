# Todo: Minimap Layout Redesign

- [ ] Task 1: `ForceGraph2D.tsx` — add `panTo(nx, ny)` to `ForceGraph2DExportHandle` + implement
  - Verify: `pnpm exec tsc --noEmit`
  - Files: `src/components/graph/ForceGraph2D.tsx`

- [ ] Task 2: `MindMap3D.tsx` — add `panTo(nx, ny)` to `MindMap3DExportHandle` + implement
  - Verify: `pnpm exec tsc --noEmit`
  - Files: `src/components/graph/MindMap3D.tsx`

- [ ] Task 3: `GraphMinimap.tsx` — remove header/bg, add `width` + `onPanTo` props, click/drag interactivity
  - Verify: `pnpm exec tsc --noEmit` · Visual: no text, no bg, border+shadow only
  - Files: `src/components/graph/GraphMinimap.tsx`

- [ ] CHECKPOINT 1+2: Tasks 1, 2, 3 done. `pnpm exec tsc --noEmit` passes.

- [ ] Task 4: `GraphWorkspace.tsx` — `showMinimap` prop, ResizeObserver 20% width, wire `onPanTo` → renderer refs
  - Verify: `pnpm exec tsc --noEmit` · `pnpm test` · Manual: minimap scales, click pans
  - Files: `src/components/graph/GraphWorkspace.tsx`

- [ ] Task 5: `CaseWorkspaceShell.tsx` — `showMinimap` state + toolbar toggle button
  - Verify: `pnpm exec tsc --noEmit` · `pnpm test` · `pnpm build`
  - Files: `src/components/layout/CaseWorkspaceShell.tsx`

- [ ] CHECKPOINT FINAL: All manual checks pass. `pnpm build` clean.
