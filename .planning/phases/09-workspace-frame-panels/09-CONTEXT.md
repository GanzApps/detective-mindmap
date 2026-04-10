# Phase 9: Workspace Frame + Panels - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 9 rebuilds the workspace composition around the reference structure. This phase is about persistent layout bands and panel behavior: left rail tabs, grouped filters, right-side analysis panel, minimap placement, and timeline framing. It does not yet re-style graph node semantics, implement search-focus behavior, or finish AI intent routing.

</domain>

<decisions>
## Implementation Decisions

### Left Rail
- **D-01:** The left rail should default to the `Raw Evidence` tab when a workspace opens.
- **D-02:** `Filters & Layers` is a secondary mode, not the initial landing state.

### Right Analysis Panel
- **D-03:** The right analysis panel should remain visible in an idle, quiet default state rather than collapsing completely.
- **D-04:** Selection and AI-result details should render in the right panel so the graph stays unobstructed.

### Timeline
- **D-05:** The timeline should be collapsed by default, but remain visibly present with a clear handle/affordance.
- **D-06:** Timeline presence should still read as a first-class investigation surface, not hidden functionality.

### Minimap
- **D-07:** The minimap should sit at the bottom-right inside the graph area.
- **D-08:** The minimap should be always visible, but visually quiet / low-noise by default.

### the agent's Discretion
- Exact idle-state copy/content for the right analysis panel
- Exact collapsed timeline height, handle treatment, and motion details
- Exact minimap framing, opacity, and visual treatment so long as it remains low-noise
- Whether the minimap supports future interaction affordances now or later, as long as Phase 9 preserves the visual anchor

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone Source of Truth
- `.planning/PROJECT.md` - current milestone definition and high-level revamp goals
- `.planning/REQUIREMENTS.md` - Phase 9 requirement targets: `SHELL-08`, `WS-07`, `WS-08`, `WS-09`, `WS-11`, `ANALYSIS-01`, `ANALYSIS-02`
- `.planning/ROADMAP.md` - Phase 9 goal, dependency order, and success criteria
- `.planning/STATE.md` - current execution truth after planning repair and Phase 8 verification

### Reference Notes
- `.planning/notes/ui-reference-mac-video-alignment.md` - shell and layout interpretation from the MAC video
- `.planning/notes/graph-ui-interaction-alignment.md` - interaction expectations that Phase 9 must preserve while rebuilding structure
- `.planning/notes/investigation-workspace-revamp-model.md` - consolidated workspace model, filter structure, right panel role, and AI surface role

### Reference Assets
- `.planning/references/mac-ui-reference/2026-04-09.mp4` - primary shell and product framing reference
- `.planning/references/mac-ui-reference/graph-view-selected-filters.png` - key workspace frame reference showing tabs, right panel, dimmed focus state, timeline, and minimap

### Prior Phase Groundwork
- `.planning/phases/08-design-tokens-shell-alignment/08-CONTEXT.md` - token/shell direction and what Phase 8 intentionally deferred
- `.planning/phases/08-design-tokens-shell-alignment/08-RESEARCH.md` - shell token strategy and touched surfaces
- `.planning/phases/08-design-tokens-shell-alignment/08-UAT.md` - verified shell groundwork; confirms Phase 8 is complete baseline, not final revamp

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/layout/CaseWorkspaceShell.tsx` - current composition layer; already wires header, sidebar, graph, timeline, AI bar, and CRUD modals, so it is the central integration point for the banded workspace rebuild
- `src/components/layout/EvidenceSidebar.tsx` - existing left-rail starting point; should be evolved into the tabbed evidence/filter rail rather than replaced blindly
- `src/components/layout/TimelineBar.tsx` - current bottom investigation surface; likely reusable as the base for collapsed-by-default timeline behavior
- `src/components/layout/AICommandBar.tsx` - current command surface; Phase 9 should preserve shell placement while Phase 12 later deepens behavior
- `src/components/layout/CaseHeader.tsx` - already aligned to the token system from Phase 8 and should remain the top shell anchor
- `src/components/graph/GraphWorkspace` - current graph hero surface; minimap and right-panel integration should connect around it without entangling graph semantics planned for later phases

### Established Patterns
- `CaseWorkspaceShell` is already the page-level owner of workspace composition and modal wiring
- Phase 8 introduced tokenized shell styling; Phase 9 should continue using shell tokens rather than reintroducing hardcoded palette decisions
- Graph logic and shell composition are still separated; keep that boundary intact

### Integration Points
- Left rail tabs and grouped filters belong in or adjacent to `EvidenceSidebar.tsx`
- Right analysis panel likely belongs in `CaseWorkspaceShell.tsx` so it can respond to selected node and future AI result state
- Timeline collapsed-state behavior can be introduced in `TimelineBar.tsx` plus shell composition where needed
- Minimap placement likely belongs as part of the graph container/frame while staying visually controlled by workspace composition rather than graph-semantic code

</code_context>

<specifics>
## Specific Ideas

- Keep the graph as the hero surface, but frame it with explicit persistent bands instead of a generic left-sidebar + bottom-footer arrangement
- Preserve visual stability: avoid collapsing the right panel in ways that cause major graph width jumps
- `Raw Evidence` should feel like the case-opening mode; `Filters & Layers` should feel like deliberate graph control mode

</specifics>

<deferred>
## Deferred Ideas

- Search dropdown flow and dimmed network focus belong to Phase 10
- Entity-type iconic shapes and graph color semantics belong to Phase 10
- Shared drag/placement continuity across 2D and 3D belongs to Phase 11
- Known-intent AI action routing belongs to Phase 12

</deferred>

---
*Phase: 09-workspace-frame-panels*
*Context gathered: 2026-04-10*
