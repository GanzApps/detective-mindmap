# Implementation Plan: Graph Workspace Layout Polish

## Overview

Polish the graph workspace so the header controls and graph canvas use space more efficiently. The key changes are moving graph search into the left rail, removing the extra graph-header band, keeping the minimap anchored inside the graph panel, and making the graph layout fill the available vertical space with no obvious dead area.

This is a layout-only follow-up to the completed tabbed workspace work. It should not change graph semantics, AI routing, or 2D/3D interaction parity.

## Architecture Decisions

- **Search moves to the sidebar, not the graph renderers.** The current search state lives inside `GraphWorkspace`, but the input control should visually belong to the left rail. We should lift the search UI out of `ForceGraph2D` and `MindMap3D` while keeping committed-search state in one place.
- **Graph headers stay renderer-local.** `2D` and `3D` can keep their own renderer labels and controls, but the wasted spacer band should be removed so the canvas starts higher.
- **Minimap stays workspace-owned.** `GraphMinimap` already renders from `GraphWorkspace`, which is the right ownership boundary. We should preserve that and only adjust surrounding layout if needed.
- **Height changes should happen at the shell/container layer first.** Dead space under the graph is more likely a shell sizing issue than a renderer issue, so we should start in `CaseWorkspaceShell` and `GraphWorkspace` before touching renderer internals.

## Dependency Graph

```text
CaseWorkspaceShell
    |
    +-- EvidenceSidebar
    |     |
    |     +-- left-rail search placement
    |
    +-- GraphWorkspace
          |
          +-- shared search state / minimap ownership
          +-- ForceGraph2D header cleanup
          +-- MindMap3D header cleanup
```

Implementation order:
1. Put search in the correct owning area (`EvidenceSidebar` / shell wiring).
2. Remove renderer header waste once the search field is gone from the graph.
3. Adjust graph/shell sizing so the canvas fills the freed space.
4. Verify minimap anchoring and full layout behavior.

## Task List

## Task 1: Lift graph search into the left rail

**Description:** Move the search input UI out of the graph renderer headers and into the left sidebar while preserving the existing shared search behavior for both `2D` and `3D`.

**Acceptance criteria:**
- [ ] Search input is rendered in the left rail instead of inside `ForceGraph2D` / `MindMap3D`
- [ ] Typing still updates shared search state for both renderers
- [ ] Committed search selection still focuses the graph the same way as today
- [ ] Left rail layout remains stable in both `Raw Evidence` and `Filters & Layers`

**Verification:**
- [ ] Manual: search is visible in the left rail and no longer appears in graph headers
- [ ] Manual: committed search still focuses correctly in both `2D` and `3D`

**Dependencies:** None

**Files likely touched:**
- `src/components/layout/EvidenceSidebar.tsx`
- `src/components/layout/CaseWorkspaceShell.tsx`
- `src/components/graph/GraphWorkspace.tsx`
- `src/components/graph/ForceGraph2D.tsx`
- `src/components/graph/MindMap3D.tsx`

**Estimated scope:** Medium

---

## Task 2: Remove the empty graph-header band

**Description:** Tighten the `2D` and `3D` graph panel headers once search is removed so the title and controls sit in a compact top row with no large empty strip.

**Acceptance criteria:**
- [ ] `ForceGraph2D` header no longer reserves space for a removed search field
- [ ] `MindMap3D` header no longer reserves space for a removed search field
- [ ] The title and control row alignment feels consistent across both renderers
- [ ] No floating badge or detached control overlaps the graph title area

**Verification:**
- [ ] Manual: compare the top of both graph panels against `tasks/polish-position.png`
- [ ] Manual: headers feel compact and aligned in both renderers

**Dependencies:** Task 1

**Files likely touched:**
- `src/components/graph/ForceGraph2D.tsx`
- `src/components/graph/MindMap3D.tsx`

**Estimated scope:** Small

---

## Task 3: Expand graph layout to fill the available height

**Description:** Remove the visible dead space below the graph by adjusting shell/layout sizing so the graph panel and canvas consume the available vertical area.

**Acceptance criteria:**
- [ ] The graph panel fills the available height in the center column
- [ ] Obvious empty space below the graph is removed
- [ ] Timeline and AI command surfaces still keep their intended fixed/owned space
- [ ] No page-level overflow is introduced

**Verification:**
- [ ] Manual: desktop viewport no longer shows dead area under the graph
- [ ] Manual: resize window and confirm the graph remains the main consumer of available space

**Dependencies:** Task 2

**Files likely touched:**
- `src/components/layout/CaseWorkspaceShell.tsx`
- `src/components/graph/GraphWorkspace.tsx`
- potentially `src/components/layout/TimelineBar.tsx` only if spacing coordination is required

**Estimated scope:** Medium

---

## Task 4: Final minimap and layout polish validation

**Description:** Verify that the minimap stays visually anchored bottom-right in the graph layout after the search/header/height changes and add or update any tests that cover the new structure.

**Acceptance criteria:**
- [ ] Minimap remains visually attached to the graph panel bottom-right in `2D`
- [ ] Minimap remains visually attached to the graph panel bottom-right in `3D`
- [ ] Updated layout does not regress graph workspace shell rendering
- [ ] Typecheck, targeted tests, and production build pass

**Verification:**
- [ ] `pnpm exec tsc --noEmit`
- [ ] `pnpm test -- --runInBand src/components/graph/__tests__/GraphWorkspace.test.tsx src/components/layout/__tests__/WorkspacePanels.test.tsx src/__tests__/app-shell.test.tsx`
- [ ] `pnpm build`

**Dependencies:** Task 3

**Files likely touched:**
- `src/components/graph/GraphWorkspace.tsx`
- `src/components/graph/__tests__/GraphWorkspace.test.tsx`
- `src/components/layout/__tests__/WorkspacePanels.test.tsx`
- `src/__tests__/app-shell.test.tsx`

**Estimated scope:** Small

## Checkpoints

### Checkpoint 1: Layout Ownership Fixed
- [ ] Search lives in the left rail
- [ ] Graph headers are compact
- [ ] No title/control overlap remains

### Checkpoint 2: Layout Fill Fixed
- [ ] Graph panel fills the available height
- [ ] Minimap remains bottom-right
- [ ] No new overflow or clipping issues appear

### Checkpoint 3: Validation Complete
- [ ] Typecheck passes
- [ ] Targeted tests pass
- [ ] Build passes

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Search moved into the rail breaks tabbed rail layout | Medium | Keep search as a top rail block with minimal coupling to evidence/filter content |
| Removing the search row breaks renderer-specific spacing | Low | Keep renderer-local header markup but reduce it after search removal |
| Height fix causes timeline or AI bar clipping | Medium | Adjust shell sizing from the center column outward and validate at desktop widths |
| Minimap anchoring drifts after height changes | Low | Keep minimap ownership in `GraphWorkspace` and validate both renderers after layout changes |

## Open Questions

- Should the left-rail search remain visible in both tabs, or only in the active graph-relevant tab?
- Do we want the renderer title row to stay visible long-term, or eventually collapse into a smaller shared graph toolbar?
