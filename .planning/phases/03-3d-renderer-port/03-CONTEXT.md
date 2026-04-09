# Phase 3: 3D Renderer Port - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 ports the existing `3d_mindmap_fixed.html` experience into the app as a React Canvas renderer with extracted pure math/render helpers, preserved interactions, and clean lifecycle handling.

</domain>

<decisions>
## Implementation Decisions

### Visual Fidelity
- **D-01:** Phase 3 should match `3d_mindmap_fixed.html` as closely as practical now
- **D-02:** The reference is not just inspiration; it is the behavioral and visual baseline for the first renderer pass

### Selection Behavior
- **D-03:** Node click should produce stronger in-canvas emphasis on the selected node and its neighborhood
- **D-04:** The right-side detail panel should still appear on node selection, but the canvas highlight behavior is equally important

### Labels
- **D-05:** Label rendering should remain broadly visible like the reference in the first 3D pass
- **D-06:** Do not over-prune labels for cleanliness if it materially changes the original scene readability

### Implementation Priority
- **D-07:** If a tradeoff appears during the port, smooth interaction and runtime stability win over cleaner abstraction
- **D-08:** Pure function extraction is still required, but it must not come at the expense of preserving drag, zoom, hover, and selection quality

### Prior Decisions Carried Forward
- **D-09:** Shared graph schemas remain free of spatial coordinates; the 3D renderer owns view/camera state
- **D-10:** The 3D renderer must still respect the app shell contracts already established in Phase 2, including shared selected node state and client-only graph boundaries

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope
- `.planning/ROADMAP.md` - Phase 3 goal, success criteria, and plan inventory
- `.planning/REQUIREMENTS.md` - Phase 3 requirements `GRAPH3D-01` through `GRAPH3D-09`
- `.planning/PROJECT.md` - Product direction, fidelity expectations, and active graph requirements
- `.planning/STATE.md` - Current phase focus and carried-forward decisions

### Prior Phase Context
- `.planning/phases/02-app-shell/02-CONTEXT.md` - App shell decisions that the 3D renderer must plug into
- `.planning/phases/02-app-shell/02-VERIFICATION.md` - What Phase 2 already proved about routing, state, and client boundaries
- `.planning/phases/01-foundation/01-CONTEXT.md` - Shared graph/data constraints established in Phase 1

### Renderer Reference
- `3d_mindmap_fixed.html` - Canonical interaction and visual baseline for the Phase 3 port
- `image.png` - Investigation-board shell direction the renderer ultimately lives inside

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/graph/graphTypes.ts` - Shared graph node/edge contracts and `getConnectedIds()` helper already available for selection logic
- `src/store/caseStore.ts` - Global selected-node, highlight, and view-mode state already exists for renderer integration
- `src/components/layout/CaseWorkspaceShell.tsx` - Current workspace composition the 3D renderer will eventually sit inside
- `src/app/cases/[caseId]/page.tsx` - Established `dynamic({ ssr: false })` route boundary pattern for graph surfaces

### Established Patterns
- Graph UI must stay client-only under Next.js to avoid SSR crashes
- Shared case data still flows through the repository and store layers rather than direct fixture imports in route code
- The codebase currently prefers pure-function extraction in `src/lib/graph/` before React component integration when graph behavior is testable in isolation

### Integration Points
- Phase 3 should likely introduce `MindMap3D` under a graph-focused component area and feed it case graph data plus shared selection callbacks
- The renderer must emit selected node IDs in a form the existing store can consume
- The panel and controls from the reference need to align with the Phase 2 shell rather than live as a totally separate standalone page forever

</code_context>

<specifics>
## Specific Ideas

- The reference file should be treated as the source interaction model, not loosely reinterpreted
- Selection should feel stronger than a subtle tint; the neighborhood emphasis matters
- Broad label visibility is desirable in the initial port even if later phases refine label controls

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 03-3d-renderer-port*
*Context gathered: 2026-04-09*
