# Phase 8: Design Tokens + Shell Alignment - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the shared design-token and shell-alignment foundation for milestone `v2.0` so the dashboard and investigation workspace adopt the saved reference language in both light and dark themes. This phase covers shell framing, token decisions, and theme structure. It does not yet rebuild the tabbed workspace rail, right-side analysis panel behavior, graph visual language, or AI action routing in full.

</domain>

<decisions>
## Implementation Decisions

### Shell visual direction
- **D-01:** Follow the saved MAC references for the overall shell direction: calm, bright, centered dashboard/workspace framing with restrained surfaces and generous whitespace.
- **D-02:** Keep the graph as the product hero, but frame it inside a structured product shell rather than a raw full-bleed tool layout.

### Theme and token strategy
- **D-03:** Support both light and dark themes from the shared token layer in this phase.
- **D-04:** Light mode should be the calm, bright baseline; dark mode should be restrained rather than neon or high-noise.
- **D-05:** Purple remains the primary accent for actions, active tabs, and shell emphasis.
- **D-06:** Shell tokens and graph/entity colors should be treated as separate systems so layout surfaces and graph semantics do not compete.

### Scope emphasis for this phase
- **D-07:** Phase 8 should lock the shell structure and token system first, before deeper workspace interaction changes in later phases.
- **D-08:** The saved notes and repo-local reference assets are the canonical source of truth for shell alignment in this phase.

### the agent's Discretion
- Exact token names and CSS variable structure
- Final neutral palette values for both themes
- Elevation, border, and radius scale details
- How to distribute token ownership between `globals.css`, Tailwind utility usage, and reusable layout components

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone and phase definition
- `.planning/PROJECT.md` - milestone `v2.0` goal, target features, and shell-alignment context
- `.planning/REQUIREMENTS.md` - `SHELL-06` and `THEME-01` define the required shell and theme outcomes for this phase
- `.planning/ROADMAP.md` - Phase 8 goal, success criteria, and plan breakdown

### Reference interpretation notes
- `.planning/notes/ui-reference-mac-video-alignment.md` - dashboard/workspace layout principles, tab behavior notes, shell visual language, and theme direction
- `.planning/notes/investigation-workspace-revamp-model.md` - overall workspace revamp model, panel structure, minimap role, and shell/graph relationship
- `.planning/notes/graph-ui-interaction-alignment.md` - downstream graph behavior targets that the shell/token work must not conflict with

### Reference assets
- `.planning/references/mac-ui-reference/2026-04-09.mp4` - primary repo-local reference recording
- `.planning/references/mac-ui-reference/frame_0000.png` - representative dashboard frame
- `.planning/references/mac-ui-reference/frame_0300.png` - representative dashboard frame
- `.planning/references/mac-ui-reference/frame_0480.png` - representative dashboard/card interaction frame
- `.planning/references/mac-ui-reference/graph-view-selected-filters.png` - workspace shell, filter tabs, right-side analysis panel, dimmed selected-state reference

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/pages/CaseListPage.tsx` - current case-list shell; primary entry point for dashboard shell refactor
- `src/components/pages/CaseWorkspacePage.tsx` - page-level workspace entry and state wiring; useful for preserving route/page boundaries during shell refactor
- `src/components/layout/CaseWorkspaceShell.tsx` - current workspace composition layer; central place to realign shell framing and persistent bands
- `src/components/layout/CaseHeader.tsx` - existing top action/header surface that can be adapted into the new shell language
- `src/components/layout/EvidenceSidebar.tsx` - existing left utility rail that Phase 9 will rebuild further; Phase 8 should avoid blocking that path
- `src/components/layout/TimelineBar.tsx` and `src/components/layout/AICommandBar.tsx` - existing bottom shell surfaces to be visually aligned in this phase

### Established Patterns
- Page surfaces are currently composed with Tailwind utility classes directly in component files
- The app already uses a shared page-shell pattern via `CaseWorkspacePage` -> `CaseWorkspaceShell`
- Themes are not yet systematized; `src/app/globals.css` is effectively empty, so Phase 8 can introduce a proper token layer without fighting an existing theme system

### Integration Points
- `src/app/globals.css` is the right place to introduce shared CSS variables/tokens for light and dark themes
- `CaseListPage` and `CaseWorkspaceShell` are the key integration points for shell alignment
- Existing graph components should remain functionally intact in Phase 8 while their container/presentation layer is modernized

</code_context>

<specifics>
## Specific Ideas

- The shell should follow the recommendation already approved in discussion: calm bright structure, restrained dark mode, purple primary accent, and a separate graph color system.
- The workspace should feel like a structured investigation product, not a raw graph tool.
- Preserve centered, restrained layout framing rather than full-bleed edge-to-edge composition.

</specifics>

<deferred>
## Deferred Ideas

- Left panel tabbed evidence/filter behavior details are implemented in Phase 9
- Right-side analysis panel behavior and minimap behavior are implemented in Phase 9
- Iconic graph node shapes and selected-network focus behavior are implemented in Phase 10
- Shared manual placement and full 2D/3D interaction parity are implemented in Phase 11
- Known-intent AI command routing is implemented in Phase 12

</deferred>

---

*Phase: 08-design-tokens-shell-alignment*
*Context gathered: 2026-04-10*
