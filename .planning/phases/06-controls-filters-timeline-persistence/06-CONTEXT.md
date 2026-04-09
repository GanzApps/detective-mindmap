# Phase 6: Controls + Filters + Timeline + Persistence - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase adds the control surfaces around the existing shared graph workspace: entity-type filtering, layer toggles, a footer timeline/status bar with AI command placeholder, and local persistence for case and UI state.

</domain>

<decisions>
## Implementation Decisions

### Filter behavior
- **D-01:** Entity-type filters should dim non-matching nodes rather than hiding them completely.
- **D-02:** This dimming behavior should preserve graph context in both renderers instead of collapsing the scene.

### Layers behavior
- **D-03:** The first Layers panel should control edge labels, node labels, and a "focus selected neighborhood" toggle.
- **D-04:** Evidence highlight visibility is not part of the first Layers panel pass and should remain outside this phase's layer toggles.

### Timeline/footer behavior
- **D-05:** The timeline should start as a mostly visual status/footer bar with a current case timeline label and placeholder scrubber.
- **D-06:** Phase 6 should prioritize the dark investigation-board footer feel over building a richer event-driven timeline interaction.

### Persistence scope
- **D-07:** Local persistence should restore everything practical on reload: cases, graph mutations, current selection, filters, view mode, and layer preferences.
- **D-08:** Persisted state should support returning to the workspace without losing investigation context.

### the agent's Discretion
- Footer copy, exact control grouping, and the specific visual composition of the filter/layers/timeline surfaces can be decided during planning and implementation as long as they stay desktop-first and consistent with the investigation-board look.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and scope
- `.planning/ROADMAP.md` - Phase 6 goal, requirements, and success criteria
- `.planning/REQUIREMENTS.md` - WS-05, WS-06, SHELL-05, and DATA-04 traceability
- `.planning/PROJECT.md` - current product direction and prior locked decisions
- `.planning/STATE.md` - active phase and session continuity

### Existing workspace implementation
- `src/components/graph/GraphWorkspace.tsx` - shared mounted-dual-renderer workspace
- `src/components/graph/ForceGraph2D.tsx` - current 2D renderer controls and graph interaction surface
- `src/components/graph/MindMap3D.tsx` - current 3D renderer controls and graph interaction surface
- `src/components/graph/NodeDetailPanel.tsx` - shared floating node analysis surface
- `src/components/layout/CaseWorkspaceShell.tsx` - case shell layout and existing activity feed area
- `src/store/caseStore.ts` - current shared workspace state and mutation model

### Visual references
- `image.png` - investigation-board UI reference for shell and footer tone
- `3d_mindmap_fixed.html` - reference interaction model for the 3D graph mode

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `GraphWorkspace` already owns the graph area and is the right integration point for filters, layer toggles, and shared renderer-facing control props.
- `CaseWorkspaceShell` already has a lower "Workspace Activity" section that can be evolved or replaced by the new footer/timeline surface.
- `caseStore` already manages shared case state, selected node, highlighted evidence, filters, and view mode, so persistence and new UI preferences should extend this store instead of creating parallel state.
- `ForceGraph2D` and `MindMap3D` already accept shared selection/highlight state and can be extended with additional renderer flags for labels/focus behavior.

### Established Patterns
- Shared workspace state flows through Zustand and page-level props rather than renderer-local ownership.
- The shell uses dark, investigation-board styling with rounded panels and compact control clusters.
- Renderer continuity is preserved by keeping both renderers mounted and toggling visibility with CSS.

### Integration Points
- Filter and layer controls should attach to `GraphWorkspace` and/or the shell header area rather than creating a separate disconnected panel system.
- Timeline/footer UI should integrate at the bottom of the case workspace layout, below the graph area.
- Persistence should be implemented through the shared Zustand store so reload restoration remains centralized.

</code_context>

<specifics>
## Specific Ideas

- The user wants filters to preserve scene context, so dimming is preferred over hard removal.
- The Layers panel should help investigation focus, especially around the currently selected neighborhood.
- The timeline/footer should read as a strong visual status strip first, not a deep interactive analytics feature yet.

</specifics>

<deferred>
## Deferred Ideas

- Rich event-marker timelines driven by graph/event timestamps are deferred beyond the initial Phase 6 footer pass.
- Evidence highlight visibility toggles are deferred rather than being added to the first Layers panel.

</deferred>

---

*Phase: 06-controls-filters-timeline-persistence*
*Context gathered: 2026-04-09*
