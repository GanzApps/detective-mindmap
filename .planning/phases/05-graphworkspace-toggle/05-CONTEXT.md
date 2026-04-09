# Phase 5: GraphWorkspace + Toggle - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 connects the live 2D and 3D renderers under a single `GraphWorkspace` with a CSS toggle, shared selection state, a common node detail surface, and component-level test coverage for the shell pieces that support cross-renderer continuity.

</domain>

<decisions>
## Implementation Decisions

### Node Detail Panel
- **D-01:** The shared node detail surface should feel like a richer case-analysis panel rather than a narrow factual inspector
- **D-02:** The panel should have stronger visual hierarchy and feel like a meaningful investigation workspace element, not just a debug readout

### Toggle and Selection Behavior
- **D-03:** Toggling between 2D and 3D should preserve node highlighting, but the shared panel can stay more minimal during renderer transitions
- **D-04:** Selection continuity matters, but the panel should not force identical presentation rules in both renderers if that makes the workspace feel clumsy

### Panel Placement
- **D-05:** The shared `NodeDetailPanel` should live as a floating inspector card near the graph area
- **D-06:** The panel should feel attached to the active graph workspace rather than occupying a permanent layout column

### Implementation Priority
- **D-07:** If Phase 5 introduces a tradeoff, cleaner panel UX and readability matter more than perfect state continuity or the simplest architecture
- **D-08:** The toggle still must preserve renderer state, but the panel experience should feel intentionally designed rather than purely mechanical

### Prior Decisions Carried Forward
- **D-09:** Both renderers stay mounted and are hidden with CSS `display:none`, not unmounted
- **D-10:** Shared selected-node state remains the single source of truth across both renderers
- **D-11:** The workspace remains desktop-first and should preserve the dark investigation-board direction
- **D-12:** Graph rendering remains client-only under the existing Next.js boundaries

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope
- `.planning/ROADMAP.md` - Phase 5 goal, success criteria, and plan inventory
- `.planning/REQUIREMENTS.md` - Phase 5 requirements `WS-01` through `WS-04` and `ARCH-05`
- `.planning/PROJECT.md` - Product direction, active workspace requirements, and renderer constraints
- `.planning/STATE.md` - Current phase focus and carried-forward decisions

### Prior Phase Context
- `.planning/phases/03-3d-renderer-port/03-CONTEXT.md` - 3D renderer integration and selection behavior direction
- `.planning/phases/04-2d-force-graph/04-CONTEXT.md` - 2D renderer decisions, search behavior, and stability priorities
- `.planning/phases/02-app-shell/02-CONTEXT.md` - Shell structure and modal interaction decisions

### Existing Code Integration
- `src/components/layout/CaseWorkspaceShell.tsx` - Current workspace composition around the renderer slot
- `src/components/graph/ForceGraph2D.tsx` - Live 2D renderer that must remain mounted through the toggle
- `src/components/graph/MindMap3D.tsx` - Live 3D renderer that must remain mounted through the toggle
- `src/store/caseStore.ts` - Shared `viewMode`, selected node, and highlight state
- `src/components/layout/CaseHeader.tsx` - Existing view toggle and toolbar surface

### Product References
- `image.png` - Investigation-board reference for overall shell tone and floating workspace surfaces

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/layout/CaseWorkspaceShell.tsx` - Already coordinates case data, CRUD surfaces, renderer mode, and selection feed
- `src/store/caseStore.ts` - Already owns shared `viewMode`, selected node, and highlighted entity IDs
- `src/components/graph/ForceGraph2D.tsx` - Already exposes shared search and selection callbacks from the 2D renderer
- `src/components/graph/MindMap3D.tsx` - Already exposes shared selection callbacks and includes a local detail surface that can be unified in this phase

### Established Patterns
- Renderer lifecycle-sensitive state lives in refs inside renderer components, not in the parent shell
- Shared app state continues to flow through Zustand rather than route-local ad hoc state
- Graph surfaces already live inside the existing workspace shell and should not be split into separate standalone pages

### Integration Points
- Phase 5 should likely introduce a dedicated `GraphWorkspace` wrapper that takes ownership of both mounted renderers and the shared detail surface
- The existing local detail UI inside `MindMap3D` should be replaced or unified rather than left as a conflicting parallel inspector
- Component-level tests should extend the current shell smoke approach without trying to unit-test raw canvas drawing behavior

</code_context>

<specifics>
## Specific Ideas

- The node detail surface should feel like a floating investigation card, not a permanent layout rail
- Selection should remain visually preserved across renderer toggles, but the panel can stay restrained and not over-adapt itself per renderer
- The first shared panel should already feel richer than a plain key-value inspector

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 05-graphworkspace-toggle*
*Context gathered: 2026-04-09*
