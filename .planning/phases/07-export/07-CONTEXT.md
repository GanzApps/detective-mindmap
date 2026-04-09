# Phase 7: Export - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase adds export from the current investigation graph view: a current-view PNG export plus a PDF report path, with deliberate capture-strategy coverage so export reliability is validated before wiring the final user flow.

</domain>

<decisions>
## Implementation Decisions

### Export scope
- **D-01:** Phase 7 should export the current graph view only, not a full workspace screenshot.
- **D-02:** The graph export should stay renderer-specific so the active 2D or 3D canvas is the export source of truth.

### Capture strategy
- **D-03:** Phase 7 should implement both capture paths for safety: direct canvas export and an html2canvas-based path where appropriate.
- **D-04:** The phase should explicitly validate fallback behavior rather than assuming one path will cover all export cases.

### PDF detail level
- **D-05:** The PDF should be detailed: case metadata, entity list, connection summary, graph snapshot, and current evidence/highlight context where relevant.
- **D-06:** The report should feel like an investigation export, not just a raw canvas dump.

### Export UX
- **D-07:** Keep one export entry point in the header, but present a small choice menu for PNG vs PDF vs both rather than forcing one outcome.
- **D-08:** Export should remain intentionally lightweight in the UI and should not expand into a broader sharing workflow in this phase.

### the agent's Discretion
- Exact menu presentation, report layout structure, snapshot sizing, filename conventions, and how selected-evidence/highlight context is summarized can be decided during planning as long as the export remains current-view-first and reliable across both renderers.

</decisions>

<specifics>
## Specific Ideas

- The user chose current-view export over full-workspace export, so footer/sidebar chrome should not become the primary exported artifact.
- Reliability matters enough that both direct canvas export and html2canvas-related handling should be built or validated during this phase.
- The PDF should read like a useful case artifact, with richer context than the PNG path.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and scope
- `.planning/ROADMAP.md` - Phase 7 goal, export scope, and success criteria
- `.planning/REQUIREMENTS.md` - EXPORT-01, EXPORT-02, EXPORT-03 traceability
- `.planning/PROJECT.md` - current product direction and locked workspace decisions
- `.planning/STATE.md` - current execution state and continuity notes

### Existing export touchpoints
- `src/components/layout/CaseHeader.tsx` - existing `Export Report` entry point in the workspace header
- `src/components/layout/CaseWorkspaceShell.tsx` - current shell composition and visible export context around the graph
- `src/components/graph/GraphWorkspace.tsx` - shared graph-area owner and likely integration point for active renderer export access
- `src/components/graph/ForceGraph2D.tsx` - current 2D canvas surface and viewport behavior
- `src/components/graph/MindMap3D.tsx` - current 3D canvas surface and camera-driven render loop
- `src/components/pages/CaseWorkspacePage.tsx` - page-level orchestration for the active case workspace
- `src/store/caseStore.ts` - current selection, highlight, and active-view state that can feed export metadata

### Visual and technical references
- `image.png` - investigation-board UI reference, useful for keeping export/report tone aligned
- `3d_mindmap_fixed.html` - original 3D interaction reference, useful when reasoning about canvas capture fidelity

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CaseHeader` already exposes a single `Export Report` affordance, which fits the chosen one-entry-point-with-menu direction.
- `GraphWorkspace` already knows which renderer is active and keeps both renderers mounted, making it the best place to expose renderer-specific export handles.
- The shared store already holds current case, selection, highlight, and view context needed for richer PDF metadata.

### Established Patterns
- Renderer continuity is preserved with mounted canvases and CSS visibility, so export wiring should avoid disrupting that continuity.
- The workspace is desktop-first and visually intentional, so export UX should stay compact and high-signal rather than adding broad modal-heavy flows.
- Pure logic is kept outside UI components where possible, so export formatting and capture utilities should likely live in dedicated library modules.

### Integration Points
- Export menu behavior likely begins in `CaseHeader`, routes through `CaseWorkspaceShell` / `CaseWorkspacePage`, and ultimately targets the active renderer canvas via `GraphWorkspace`.
- PDF generation will need structured case data from the store plus renderer output from the active graph surface.
- Any fallback capture path should be planned with awareness of the existing mixed DOM + Canvas workspace structure.

</code_context>

<deferred>
## Deferred Ideas

- Full workspace screenshot export including sidebar/footer chrome is deferred because this phase is current-view-first.
- Broader sharing flows, link generation, and collaboration-friendly export packaging remain outside this phase.

</deferred>

---

*Phase: 07-export*
*Context gathered: 2026-04-09*
