# Phase 9 Research

## Objective

Research what needs to change to rebuild the workspace frame and persistent panels without drifting into Phase 10 graph semantics or Phase 12 AI routing.

## Key Findings

1. The current workspace composition is centered in `CaseWorkspaceShell.tsx`, which already owns the page-level layout, modal wiring, header, graph surface, timeline, and AI bar. This is the correct orchestration layer for the Phase 9 banded-layout rebuild.
2. `EvidenceSidebar.tsx` is currently a simple evidence-only rail. It is the right starting point for the Phase 9 left rail, but it needs to evolve into a true tabbed rail with `Raw Evidence` and `Filters & Layers` modes.
3. The current graph controls are in the wrong place for the target reference. `GraphWorkspace.tsx` currently renders `FilterPanel` inside the graph area. Phase 9 should migrate that control surface out of the graph hero area and into the left rail.
4. The current right-side analysis surface is not structurally aligned with the target. `NodeDetailPanel.tsx` is rendered as an absolute floating overlay inside `GraphWorkspace.tsx`, and it still carries legacy cyan/dark styling. Phase 9 should turn node analysis into a right-side shell-aligned panel owned by the workspace frame.
5. `TimelineBar.tsx` is always expanded today and consumes substantial space. Phase 9 should preserve it as a first-class surface, but move it into a collapsed-by-default pattern with a visible handle so the graph remains dominant at rest.
6. `AICommandBar.tsx` is still a placeholder, but it is already correctly positioned as a persistent bottom surface. Phase 9 should preserve placement and shell cohesion while deferring command behavior to Phase 12.
7. A minimap is not yet present in the graph surface. The best Phase 9 seam is likely the graph container/frame level rather than deep renderer logic, because this phase is about workspace framing, not graph-semantic behavior.
8. Existing shell tests protect basic rendering and header behavior, but there is no focused coverage yet for tabbed rails, right-panel idle state, or collapsed timeline behavior. Phase 9 should extend shell/layout-level regression coverage.

## Recommended Planning Implications

- Keep `CaseWorkspaceShell.tsx` as the orchestration layer for the banded shell.
- Move filter/layer controls out of `GraphWorkspace.tsx` and into a dedicated left-rail panel/component.
- Reuse node-detail data and relationships from `NodeDetailPanel.tsx`, but route the presentation into a workspace-level right panel instead of an in-canvas overlay.
- Add a minimap as a quiet workspace anchor in the bottom-right of the graph frame without entangling it with later graph-semantics phases.
- Treat timeline collapse/expand behavior and panel framing as Phase 9 work; do not let graph-shape, graph-color, or search-focus requirements leak in early.

## Reusable Codebase Assets

- `src/components/layout/CaseWorkspaceShell.tsx` - current page-level composition and best control point for workspace bands
- `src/components/layout/EvidenceSidebar.tsx` - best base for the tabbed left rail
- `src/components/graph/GraphWorkspace.tsx` - current graph hero surface, active place where filter controls and node detail overlay need to be relocated
- `src/components/graph/NodeDetailPanel.tsx` - reusable analysis data presentation logic, though styling/placement need rework
- `src/components/layout/TimelineBar.tsx` - current bottom chronology surface
- `src/components/layout/AICommandBar.tsx` - current command surface placement and shell integration point
- `src/__tests__/app-shell.test.tsx` - shell render smoke coverage that should be expanded for Phase 9

## Validation Architecture

- Quick feedback should come from shell/layout tests and type checks rather than graph-engine-heavy manual loops during every task.
- The phase should validate:
  - left rail tabs and grouped filter structure render correctly
  - right analysis panel exists in idle and active shell states
  - timeline collapsed state is present and stable
  - minimap appears in the correct location
  - full build/test passes after layout refactors

## Risks

- If Phase 9 modifies graph semantics while moving controls, it will blur into Phase 10 and create avoidable churn.
- If the right analysis panel is implemented by simply moving the current `NodeDetailPanel` without reworking shell ownership, the workspace may remain compositionally unstable.
- If minimap implementation reaches too far into renderer internals, it may prematurely entangle Phase 11 interaction-parity work.

---
*Phase: 09-workspace-frame-panels*
*Research completed: 2026-04-10*
