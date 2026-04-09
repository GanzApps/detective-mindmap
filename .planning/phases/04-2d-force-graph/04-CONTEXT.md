# Phase 4: 2D Force Graph - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 delivers the first live 2D investigation graph: a D3-driven Canvas renderer with force simulation, drag, pan, zoom, edge labels, node search, and shared selection behavior that plugs into the existing case workspace without restarting the simulation on UI-only state changes.

</domain>

<decisions>
## Implementation Decisions

### Visual Fidelity
- **D-01:** Phase 4 should match the dark investigation-board visual tone closely now rather than shipping as a plain engineering scaffold
- **D-02:** The 2D graph should feel like a real part of the same workspace as the Phase 3 renderer, not a temporary debug canvas

### Edge and Label Density
- **D-03:** Edge labels should be shown selectively by default so the canvas stays readable under force movement
- **D-04:** Readability wins over showing every relationship label at once in the first pass

### Search Behavior
- **D-05:** Node search should highlight matches and auto-center the best match
- **D-06:** Search should feel navigational, not just decorative, so the viewport should help the user land on the result

### Implementation Priority
- **D-07:** If tradeoffs appear during Phase 4, smooth drag/pan/zoom behavior and runtime stability are more important than perfect visual fidelity or cleaner abstraction
- **D-08:** The simulation lifecycle must remain stable under selection, filtering, and search interactions even if some polish choices have to defer

### Prior Decisions Carried Forward
- **D-09:** The workspace remains desktop-first and should preserve the dark investigative direction established earlier
- **D-10:** Graph rendering stays client-only under Next.js boundaries already established in Phase 2
- **D-11:** Shared graph schemas remain free of spatial coordinates; the 2D renderer owns runtime layout state just as the 3D renderer owns camera state
- **D-12:** Shared selected-node and highlighted-entity state should continue to integrate with the existing store and workspace shell rather than introducing a separate renderer-local source of truth

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope
- `.planning/ROADMAP.md` - Phase 4 goal, success criteria, research note, and planned task sequence
- `.planning/REQUIREMENTS.md` - Phase 4 requirements `GRAPH2D-01` through `GRAPH2D-10`
- `.planning/PROJECT.md` - Product direction, active graph requirements, and workspace constraints
- `.planning/STATE.md` - Current phase focus and carried-forward decisions

### Prior Phase Context
- `.planning/phases/02-app-shell/02-CONTEXT.md` - App shell decisions the 2D graph must plug into
- `.planning/phases/03-3d-renderer-port/03-CONTEXT.md` - Existing renderer integration expectations and selection behavior direction

### Research and Pitfalls
- `.planning/research/PITFALLS.md` - Must review Pitfall 11 before finalizing D3 Canvas drag behavior

### Existing Code Integration
- `src/store/caseStore.ts` - Shared selected node, highlight, filter, and `viewMode` state contracts
- `src/components/layout/CaseWorkspaceShell.tsx` - Current workspace composition and the place where the 2D renderer must replace the placeholder
- `src/components/layout/CaseHeader.tsx` - Existing view toggle and toolbar shape the 2D graph should align with
- `src/components/graph/MindMap3D.tsx` - Existing renderer contract and interaction standard to stay consistent with where reasonable
- `src/components/graph/GraphSurfacePlaceholder.tsx` - Current 2D placeholder being replaced in this phase

### Product References
- `image.png` - Investigation-board visual reference for the 2D workspace tone and overall composition

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/store/caseStore.ts` - Already owns shared selection, highlight, and view-mode state the 2D renderer should consume and emit through
- `src/lib/graph/graphTypes.ts` - Shared graph contracts and helpers already exist for node/edge typing
- `src/components/layout/CaseWorkspaceShell.tsx` - Already wires the graph area, CRUD side panels, and selection feed around the renderer slot
- `src/components/graph/MindMap3D.tsx` - Provides a working reference for renderer props, client-only lifecycle handling, and panel integration expectations

### Established Patterns
- Renderer components are client-only and sit behind the app shell rather than owning their own route
- Pure graph math and non-React rendering helpers belong in `src/lib/graph/` and get Jest coverage first when practical
- Shared graph interactions should emit IDs upward instead of mutating global state directly from deep inside helpers
- Runtime interaction state that should not trigger React churn belongs in refs or D3-owned objects rather than component state

### Integration Points
- `GraphSurfacePlaceholder` is the current swap point for the 2D renderer in `CaseWorkspaceShell`
- The 2D graph needs to align with the same `selectedNodeId`, `highlightedEntityIds`, and `onSelectNode` flow already used by the 3D graph
- Search and zoom controls introduced in Phase 4 need to fit the existing workspace/header layout rather than inventing a disconnected UI shell

</code_context>

<specifics>
## Specific Ideas

- The first 2D pass should already feel visually intentional and consistent with the darker investigation-board direction
- Edge labels should be present, but selectively surfaced so the graph remains readable while the simulation is active
- Search should act like a navigation aid by centering the most relevant result instead of only tinting nodes

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 04-2d-force-graph*
*Context gathered: 2026-04-09*
