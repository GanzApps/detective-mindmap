---
phase: 08-design-tokens-shell-alignment
plan: 01
subsystem: ui
tags: [css-variables, design-tokens, tailwind, theming, shell]

requires:
  - phase: 07-export
    provides: Completed investigation workspace shell that Phase 8 now wraps with a token layer

provides:
  - Centralized CSS custom property token set for shell backgrounds, surfaces, text, borders, accent, destructive, shadows, spacing, radius, typography, and band dimensions
  - Light and dark theme entry points via [data-theme] attribute on the html root
  - Tailwind theme extensions that proxy every shell token via CSS variable references
  - Base body styles consuming token vars instead of hardcoded Tailwind classes

affects:
  - 08-02-shell-dashboard-alignment
  - 08-03-workspace-shell-alignment
  - all future shell and layout component refactors

tech-stack:
  added: []
  patterns:
    - CSS custom properties in globals.css as the single source of truth for shell visual values
    - data-theme attribute on html root to switch light/dark without JavaScript class toggling
    - Tailwind theme.extend wiring CSS vars so utility classes respect the active theme
    - Shell tokens scoped separately from graph/entity semantic colors

key-files:
  created: []
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
    - tailwind.config.ts

key-decisions:
  - "CSS custom properties in globals.css (not JS-in-CSS or Tailwind preset) to keep token ownership simple and compatible with the existing codebase pattern"
  - "data-theme attribute approach rather than prefers-color-scheme media query so themes are switchable programmatically in later phases"
  - "Shell tokens explicitly exclude graph/entity semantic colors — those are a separate system deferred to Phase 10"
  - "Dark mode defaults to restrained dark (slate-950/gray-900 family) rather than neon to match the MAC reference direction"
  - "suppressHydrationWarning added to html element anticipating future client-side theme toggling"

patterns-established:
  - "Shell token naming: --shell-{category}-{variant} (e.g. --shell-surface-raised, --shell-text-secondary)"
  - "Tailwind extension: shell.* color keys proxy CSS vars so bg-shell-surface, text-shell-text-primary etc. are valid utilities"
  - "Theme switching: set data-theme='light'|'dark' on <html> — no class toggling needed"

requirements-completed:
  - SHELL-06
  - THEME-01

duration: 3min
completed: 2026-04-10
---

# Phase 08 Plan 01: Design Tokens + Shell Alignment - Token Foundation Summary

**CSS custom property shell token layer with light/dark theme entry points and Tailwind proxy extensions, keeping shell and graph color systems strictly separate**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-09T18:31:26Z
- **Completed:** 2026-04-09T18:34:40Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Defined 40+ CSS custom properties in `globals.css` covering every shell visual concern: backgrounds, surfaces, text hierarchy, borders, accent (purple `#7c3aed`), destructive, elevation shadows, spacing scale, border radius, typography scale, and shell band dimensions
- Wired light (`[data-theme="light"]`) and dark (`[data-theme="dark"]`) themes at the `html` root via `data-theme` attribute, defaulting to dark; body now drives colors entirely from token vars
- Extended `tailwind.config.ts` with `shell.*` color, spacing, borderRadius, boxShadow, height, and width entries that all reference CSS variables — Tailwind utilities now reflect the active theme without a rebuild

## Task Commits

Each task was committed atomically:

1. **Task 1: Introduce centralized shell tokens** - `d83e8f3` (feat)
2. **Task 2: Wire light and dark theme entry points** - `bdc1cea` (feat)
3. **Task 3: Align Tailwind usage with the new token model** - `6317323` (feat)

## Files Created/Modified

- `src/app/globals.css` - Full shell token set as CSS custom properties; light/dark theme blocks; base body/focus-ring styles consuming tokens
- `src/app/layout.tsx` - Added `data-theme="dark"` and `suppressHydrationWarning` to `<html>`; removed hardcoded `bg-slate-950 text-slate-100` from body
- `tailwind.config.ts` - Extended theme with `shell.*` color map, spacing, borderRadius, boxShadow, height, and width entries all backed by CSS variable references

## Decisions Made

- CSS custom properties in `globals.css` was the right vehicle — the codebase had no existing token system so there was nothing to unwind, and it keeps theme switching zero-dependency
- `data-theme` attribute (not `.dark` class or `prefers-color-scheme` only) was chosen so later phases can add a programmatic toggle without rewriting the token selectors
- Shell tokens and graph/entity colors are kept in separate systems per the phase context decision D-06; nothing graph-specific was added to `globals.css` or `tailwind.config.ts`
- Dark mode defaults to `#0f172a` / `#111827` (slate-950/gray-900 family) — restrained per D-04, not neon

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

The worktree was initialized via `git reset --soft` to the base commit, which left planning file updates (STATE.md, ROADMAP.md, REQUIREMENTS.md, and phase 08 planning files) staged. These were swept into the Task 1 commit. This is an artifact of the worktree setup and does not affect the source code changes.

## Known Stubs

None - this plan creates token infrastructure only, no UI rendering or data wiring.

## Threat Flags

None - no new network endpoints, auth paths, file access patterns, or schema changes introduced.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Shell token foundation is complete and ready for dashboard shell refactor (Plan 02) and workspace shell alignment (Plan 03)
- Later phases can adopt shell tokens by switching from hardcoded Tailwind classes to `bg-shell-surface`, `text-shell-text-primary`, etc.
- Theme toggling can be added by flipping `data-theme` on `document.documentElement` — the token layer resolves automatically

## Self-Check: PASSED

- `src/app/globals.css` — FOUND (confirmed written to worktree path)
- `src/app/layout.tsx` — FOUND (confirmed written to worktree path)
- `tailwind.config.ts` — FOUND (confirmed written to worktree path)
- Commit `d83e8f3` — FOUND
- Commit `bdc1cea` — FOUND
- Commit `6317323` — FOUND
- TypeScript check: PASSED (npx tsc --noEmit, no errors)

---
*Phase: 08-design-tokens-shell-alignment*
*Completed: 2026-04-10*
