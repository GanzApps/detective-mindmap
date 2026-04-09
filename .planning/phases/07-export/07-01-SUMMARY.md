# Phase 7 Wave 1 Summary

## Outcome

Added explicit export handles to both graph renderers and surfaced a single active-renderer export seam through `GraphWorkspace`.

## Delivered

- `ForceGraph2D` now exposes `getCanvas`, `redrawForExport`, and `captureDataUrl`
- `MindMap3D` now exposes the same export contract
- `GraphWorkspace` now resolves the active renderer, active capture container, and current-view data URL through a shared ref

## Verification

- `pnpm exec tsc --noEmit`
- `npx jest src/components/graph/__tests__/GraphWorkspace.test.tsx --runInBand`
