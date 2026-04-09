---
phase: 08-design-tokens-shell-alignment
plan: 02
subsystem: ui
tags: [shell, design-tokens, tailwind, dashboard, workspace]

requires:
  - phase: 08-design-tokens-shell-alignment
    plan: 01
    provides: CSS custom property shell token layer and Tailwind shell.* proxy extensions

provides:
  - Reference-aligned dashboard shell in CaseListPage using shell.* tokens
  - Reference-aligned workspace shell in CaseWorkspaceShell/CaseWorkspacePage using shell.* tokens
  - Aligned header and action area in CaseHeader using shell-accent purple CTA pattern

affects:
  - 08-03-workspace-shell-alignment
  - All layout components consuming hardcoded slate/cyan that Phase 9+ will further refactor

tech-stack:
  added: []
  patterns:
    - Shell token consumption via Tailwind shell.* utilities (bg-shell-surface, text-shell-text-primary, etc.)
    - Purple accent (shell-accent) as the sole primary CTA color replacing cyan
    - shell-surface-raised for nested/hover depth instead of opacity hacks
    - shell-accent-muted for selected/highlighted states replacing cyan tints
    - Conditional highlight chip rendering (only shows when count > 0)

key-files:
  created: []
  modified:
    - src/components/pages/CaseListPage.tsx
    - src/components/pages/CaseWorkspacePage.tsx
    - src/components/layout/CaseWorkspaceShell.tsx
    - src/components/layout/CaseHeader.tsx

key-decisions:
  - "Purple (shell-accent) replaces cyan as the primary action color across list and workspace entry surfaces — matches MAC reference direction and D-05"
  - "shell-accent-muted used for selected node highlight in entity list, maintaining semantic distinction from amber evidence highlights"
  - "Highlighted count chip in header only rendered when count > 0 to reduce visual noise in the default state"
  - "Status badge in CaseHeader uses semantic color classes (emerald/amber) that work in both light and dark modes rather than forcing shell token values onto semantic states"

duration: 8min
completed: 2026-04-10
---

# Phase 08 Plan 02: Dashboard and Workspace Shell Alignment Summary

**Shell surfaces for the case list dashboard and investigation workspace entry points refactored to the new shell token language, with purple accent CTA replacing cyan across all top-level action areas**

## Performance

- **Duration:** ~8 min
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Replaced the heavy dark hero gradient in `CaseListPage` with a centered, calmer `bg-shell-surface` card framing using `rounded-shell-xl`, `border-shell-border`, and `shadow-shell-md` — matches the saved MAC reference direction for dashboard framing
- Updated loading/error states in `CaseWorkspacePage` to use `bg-shell-surface` and `shell-destructive` tokens instead of hardcoded `slate-900`/`rose-950` values
- Refactored `CaseWorkspaceShell` container and all inner panels (entities, connections) to use `shell.*` spacing, surface, border, and accent utilities — the workspace now reads as a structured product shell, not a raw graph tool layout
- Updated `CaseHeader` to use `shell-accent` (purple) for the Export Report primary CTA, with the Actions button using a secondary border style; view mode toggle uses `shell-accent` fill for the active state; dropdown menus use `shell-surface`/`shell-surface-raised`/`shell-border`

## Task Commits

Each task committed atomically:

1. **Task 1: Reframe case list page** - `014b34b` (feat)
2. **Task 2: Reframe workspace page and shell containers** - `78edf3f` (feat)
3. **Task 3: Align header and top actions** - `f937d3e` (feat)

## Files Created/Modified

- `src/components/pages/CaseListPage.tsx` - Hero band uses shell-surface + restrained border; case cards use shell-surface with accent hover border; stat blocks use shell-surface-raised; CTA uses shell-accent purple
- `src/components/pages/CaseWorkspacePage.tsx` - Loading/error states use shell tokens; page wrapper uses bg-shell-bg and shell spacing
- `src/components/layout/CaseWorkspaceShell.tsx` - All layout gaps, panel surfaces, button styles, and node/edge list items migrated to shell.* tokens; graph functionality and all modal/dialog wiring intact
- `src/components/layout/CaseHeader.tsx` - Export primary CTA uses shell-accent; Actions uses secondary border; view mode toggle uses shell-accent fill; dropdowns use shell-surface tokens; all export entry points preserved

## Decisions Made

- Purple (`shell-accent`) replaces cyan as the primary action color — matches MAC reference direction (D-05) and creates consistent accent language across both list and workspace surfaces
- `shell-accent-muted` used for the selected entity highlight in the entity list panel, maintaining clear semantic distinction from the amber evidence highlight treatment
- Status badge in `CaseHeader` intentionally uses semantic color classes (emerald/amber) rather than shell token overrides — status is a semantic concern, not a shell surface concern
- Highlighted count chip only rendered when `highlightedCount > 0` to avoid a static "0 highlighted" chip cluttering the default state

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all UI elements are wired to real data; no placeholder content introduced.

## Threat Flags

None - no new network endpoints, auth paths, file access patterns, or schema changes introduced.

## Self-Check: PASSED

- `src/components/pages/CaseListPage.tsx` — FOUND
- `src/components/pages/CaseWorkspacePage.tsx` — FOUND
- `src/components/layout/CaseWorkspaceShell.tsx` — FOUND
- `src/components/layout/CaseHeader.tsx` — FOUND
- Commit `014b34b` — FOUND
- Commit `78edf3f` — FOUND
- Commit `f937d3e` — FOUND
- TypeScript check: PASSED (npx tsc --noEmit, no errors)

---
*Phase: 08-design-tokens-shell-alignment*
*Completed: 2026-04-10*
