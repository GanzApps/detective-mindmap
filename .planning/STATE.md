# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-10)

**Core value:** A detective must be able to load a case, see all entities and their connections in an interactive graph, and switch between 2D and 3D views without losing context.
**Current focus:** Milestone v2.0 planning - investigation workspace revamp

## Current Position

Phase: 8 of 12 (Design Tokens + Shell Alignment)
Plan: 0 of 3 in current phase
Status: Milestone v2.0 initialized - ready to plan Phase 8
Last activity: 2026-04-10 - Phase 8 context gathered

Progress: [----------] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 38
- Average duration: 10 min
- Total execution time: 280 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 5 | 50 min | 10 min |
| 2 | 5 | 50 min | 10 min |
| 3 | 5 | 50 min | 10 min |
| 4 | 5 | 50 min | 10 min |
| 5 | 5 | 50 min | 10 min |
| 6 | 4 | 40 min | 10 min |
| 7 | 4 | 40 min | 10 min |

**Recent Trend:**
- Last 5 plans: 06-04, 07-01, 07-02, 07-03, 07-04
- Trend: Stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Phase 1: Shared graph schemas stay free of x/y/z coordinates so renderers own spatial state
- Phase 1: Mock case data is validated with `CaseSchema.parse()` at import time
- Phase 1: All data access goes through `CaseRepository` rather than direct fixture imports
- Phase 2: `/` redirects directly into `/cases`, and the list route acts as the primary app entry
- Phase 2: Modal/dialog flows are the default UX for create/delete case graph mutations
- Phase 2: Evidence clicks already resolve to shared highlighted entity IDs through the app store
- Phase 3: The 3D renderer is live; camera state and animation stay in refs while projection and hit testing remain pure functions
- Phase 4: The 2D renderer is live; simulation setup stays separate from redraw-only state, and search recenters the best match without recreating the layout
- Phase 5: CSS `display:none` toggle, not unmount; both renderers remain mounted to preserve state
- Phase 5: The shared floating node detail card is now the single cross-renderer analysis surface, and targeted RTL coverage protects header/sidebar/panel behavior
- Phase 6: Filters dim non-matching nodes instead of removing them, shared label/focus toggles drive both renderers, and practical case/workspace state rehydrates from localStorage
- Phase 7: Export now routes through one header menu, captures the active renderer canvas first, and composes PDF reports in a dedicated export utility layer

### Pending Todos

None.

### Blockers/Concerns

- No active blockers.

## Session Continuity

Last session: 2026-04-10
Stopped at: Phase 8 context gathered
Resume file: .planning/phases/08-design-tokens-shell-alignment/08-CONTEXT.md
