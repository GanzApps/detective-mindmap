---
phase: 11-2d-3d-interaction-parity
plan: 05
status: executed
executed: 2026-04-14
---

# Phase 11-05 Summary: Drag Parity Fixes

## What changed

- Reworked `2D` node dragging in `src/components/graph/ForceGraph2D.tsx` to use delta-based world movement rather than re-deriving the node position from raw pointer coordinates on every frame.
- Updated focus emphasis to the approved family rule by introducing `getFamilyFocusIds()` in `src/lib/graph/graphTypes.ts` and using it in both `2D` and `3D` renderers so selection emphasizes the selected node plus its children and siblings only.
- Removed asymmetric `3D` -> `2D` position conversion in `src/components/graph/GraphWorkspace.tsx` so shared placement state uses the same stored coordinates in both renderers.
- Simplified `3D` node drag mapping in `src/components/graph/MindMap3D.tsx` so screen drag direction tracks camera yaw more intuitively without the previous pitch-based inversion.

## Why

Live UAT still showed:

- `2D` node drag not moving reliably
- focus highlighting following the wrong relationship rule instead of the approved children-plus-siblings behavior
- `3D` drag feeling inverted after rotation
- visual distrust when carrying positions between `3D` and `2D`

These fixes are aimed at closing those exact interaction gaps before advancing the milestone.

## Validation

- `pnpm exec tsc --noEmit`
- `pnpm test -- --runInBand src/__tests__/forceGraph2d.test.tsx src/__tests__/mindmap3d.test.tsx src/components/graph/__tests__/GraphWorkspace.test.tsx src/lib/graph/__tests__/projection3d.test.ts`

## Next step

- Re-run `/gsd-verify-work 11`
