---
phase: 08-design-tokens-shell-alignment
plan: 03
subsystem: ui
tags: [shell, design-tokens, tailwind, theming, regression-tests, layout]

requires:
  - phase: 08-design-tokens-shell-alignment
    plan: 01
    provides: CSS custom property shell token layer and Tailwind shell.* proxy extensions
  - phase: 08-design-tokens-shell-alignment
    plan: 02
    provides: Shell token adoption across CaseListPage, CaseWorkspacePage, CaseWorkspaceShell, CaseHeader

provides:
  - Final theme-aware shell styling across all layout surfaces (CaseHeader, EvidenceSidebar, TimelineBar, AICommandBar)
  - Shell regression test coverage with all 114 tests passing
  - Verified Phase 8 shell foundation: TypeScript clean, full test suite green, production build succeeds

affects:
  - All future UI phases (Phase 9+ panel and workspace rebuilds)
  - EvidenceSidebar, TimelineBar, AICommandBar now consume shell tokens

tech-stack:
  added: []
  patterns:
    - Shell token consumption via Tailwind shell.* utilities applied to all persistent layout bands
    - Semantic color classes (emerald/amber) retained for status and evidence badges — distinct from shell surface tokens
    - aria-label attributes on view mode toggle buttons for accessible role-based test queries

key-files:
  created: []
  modified:
    - src/components/layout/CaseHeader.tsx
    - src/components/layout/EvidenceSidebar.tsx
    - src/components/layout/TimelineBar.tsx
    - src/components/layout/AICommandBar.tsx

key-decisions:
  - "EvidenceSidebar, TimelineBar, and AICommandBar migrated to shell.* tokens in Plan 03 — they were missed in Plan 02 and needed the same token pass"
  - "View mode toggle buttons updated to '2D view'/'3D view' with aria-label attributes for accessible test queries"
  - "Export Report capitalized to match test expectations and provide consistent action labeling"
  - "Semantic status/evidence colors (emerald, amber) retained as intentional semantic distinctions, not overridden by shell tokens"
  - "Task 2 (test adjustments) required zero test file changes — existing tests were already written to expect the final shell state"

duration: 12min
completed: 2026-04-10
---

# Phase 08 Plan 03: Shell Token Application, Tests, and Phase Validation Summary

**Final theme-aware shell styling applied across all layout surfaces; 114 tests passing; TypeScript clean; production build succeeds — Phase 8 shell foundation verified**

## Performance

- **Duration:** ~12 min
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Applied shell token system to the four remaining layout surfaces that Plans 01 and 02 missed: `EvidenceSidebar`, `TimelineBar`, and `AICommandBar` now use `bg-shell-surface`, `border-shell-border`, `text-shell-text-*`, `rounded-shell-*`, and spacing tokens instead of hardcoded `slate`/`cyan`/`fuchsia` classes
- Updated `CaseHeader` to match regression test expectations: `'Export Report'` (capitalized), `'2D view'`/`'3D view'` button labels with `aria-label` attributes for accessible queries
- Confirmed all 114 tests pass across 30 test suites with the refactored shell surfaces
- Confirmed TypeScript check: no errors
- Confirmed Next.js production build: clean compile, all 5 static/dynamic routes generated

## Task Commits

1. **Task 1: Apply final theme-aware shell styling** - `7a2f98e` (feat)
2. **Fix: Restore planning artifacts** - `e395948` (fix) — `.planning/` files accidentally swept into Task 1 commit due to pre-staged deletions from worktree reset; restored immediately
3. **Tasks 2 and 3: Shell regression tests verified, full validation passed** — no file changes needed; test and build results confirm Phase 8 foundation is stable

## Files Created/Modified

- `src/components/layout/CaseHeader.tsx` — `Export Report` (capitalized), `2D view`/`3D view` labels with `aria-label`; full shell token adoption already from Plan 02
- `src/components/layout/EvidenceSidebar.tsx` — Migrated from hardcoded `slate`/`cyan` rounded classes to `rounded-shell-xl`, `border-shell-border`, `bg-shell-surface*`, `text-shell-text-*`, `shell-accent*` active state
- `src/components/layout/TimelineBar.tsx` — Migrated from hardcoded `slate`/`cyan` to full shell token set; status badge retains `emerald` semantic treatment
- `src/components/layout/AICommandBar.tsx` — Migrated from hardcoded `fuchsia`/`slate` gradient to `border-shell-accent/20 bg-shell-surface`; accent border signals future capability without competing with primary shell surfaces

## Decisions Made

- EvidenceSidebar and TimelineBar still used hardcoded `slate`/`cyan` classes from earlier phases — completing their token migration in Plan 03 ensures the full shell is coherent before later phases rebuild these surfaces
- `aria-label` attributes added to view mode toggle buttons so tests can use `getByRole('button', { name: '2D view' })` — a more robust query than text matching alone
- No test file changes were needed: the regression tests in `app-shell.test.tsx` and `CaseHeader.test.tsx` were already written to expect the final shell state, so Task 2 was a verification task rather than an edit task

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing token adoption] EvidenceSidebar, TimelineBar, AICommandBar still used hardcoded slate/cyan**
- **Found during:** Task 1
- **Issue:** Plans 01 and 02 focused on CaseListPage, CaseWorkspaceShell, CaseWorkspacePage, and CaseHeader. The three persistent band components (EvidenceSidebar, TimelineBar, AICommandBar) were left with hardcoded Tailwind colors, making the shell incoherent in light mode.
- **Fix:** Applied shell token system to all three components in Task 1
- **Files modified:** `src/components/layout/EvidenceSidebar.tsx`, `src/components/layout/TimelineBar.tsx`, `src/components/layout/AICommandBar.tsx`
- **Commit:** `7a2f98e`

**2. [Rule 1 - Bug] .planning/ files accidentally deleted in Task 1 commit**
- **Found during:** Task 1 commit
- **Issue:** The worktree was initialized via `git reset --soft` which left `.planning/` file deletions pre-staged in the index. These were swept into the Task 1 commit despite not being explicitly staged.
- **Fix:** Restored all 9 deleted `.planning/` files from the base commit and added a fix commit
- **Files modified:** All `.planning/phases/08-design-tokens-shell-alignment/` files
- **Commit:** `e395948`

## Known Stubs

None — all UI elements are wired to real data; no placeholder content introduced in this plan.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes introduced.

## Self-Check: PASSED

- `src/components/layout/CaseHeader.tsx` — FOUND (worktree path confirmed)
- `src/components/layout/EvidenceSidebar.tsx` — FOUND (worktree path confirmed)
- `src/components/layout/TimelineBar.tsx` — FOUND (worktree path confirmed)
- `src/components/layout/AICommandBar.tsx` — FOUND (worktree path confirmed)
- Commit `7a2f98e` — FOUND
- Commit `e395948` — FOUND
- TypeScript check: PASSED (pnpm exec tsc --noEmit, no errors)
- Test suite: PASSED (114/114 tests, 30 suites)
- Production build: PASSED (Next.js 15.5.15, all routes generated)

---
*Phase: 08-design-tokens-shell-alignment*
*Completed: 2026-04-10*
