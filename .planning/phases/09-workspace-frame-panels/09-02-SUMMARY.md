---
phase: 09-workspace-frame-panels
plan: 02
subsystem: ui
tags: [workspace, analysis-panel, minimap, graph]

requires:
  - phase: 09-workspace-frame-panels
    plan: 01
    provides: Workspace shell with tabbed left rail and store-backed filter wiring

provides:
  - Persistent right-side analysis panel that keeps graph details off the canvas center
  - Bottom-right minimap for constant viewport orientation in both 2D and 3D
  - Graph workspace layout focused on the center canvas instead of owning side-panel structure

key-files:
  created:
    - src/components/graph/graphMinimapTypes.ts
    - src/components/graph/GraphMinimap.tsx
    - src/components/layout/WorkspaceAnalysisPanel.tsx
  modified:
    - src/components/graph/GraphWorkspace.tsx
    - src/components/graph/ForceGraph2D.tsx
    - src/components/graph/MindMap3D.tsx
    - src/components/graph/NodeDetailPanel.tsx
    - src/components/layout/CaseWorkspaceShell.tsx
    - src/components/graph/__tests__/GraphWorkspace.test.tsx

completed: 2026-04-10
---

# Phase 09 Plan 02 Summary

The graph canvas now sits inside a real workspace frame: analysis moves to the right rail, the minimap stays bottom-right inside the canvas, and both renderers emit enough viewport data to preserve orientation.

Highlights:
- Added a shared `GraphMinimap` with renderer-fed viewport state from both `ForceGraph2D` and `MindMap3D`.
- Moved node detail presentation into `WorkspaceAnalysisPanel` so selection no longer depends on floating in-canvas panels.
- Simplified `GraphWorkspace` to focus on renderer continuity, minimap state, and active-node indication rather than full shell composition.

Validation:
- `pnpm exec tsc --noEmit`
- `pnpm test -- --runInBand`
