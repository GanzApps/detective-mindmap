# Project State

## Project Reference

See: `.planning/PROJECT.md` and `.planning/ROADMAP.md`

**Core value:** A detective must be able to open a case, understand the workspace immediately, focus the relevant network, and move between 2D and 3D without losing context.
**Current focus:** Phase 11 gap-closure complete. Both drag bugs fixed, coordinate carry corrected. Ready for final verification.

## Current Position

Phase: 11 of 12
Plan: 4 of 4 planned for current phase
Status: Phase 11 gap-closure executed, awaiting final verification
Last activity: 2026-04-14 - executed Phase 11 gap-closure plan (11-04)

Progress: [########--] 60%

## Current Truth

- Phase 8 (`design-tokens-shell-alignment`) exists on disk, was executed, and passed UAT
- Phase 8 should be treated as groundwork, not as the full UI revamp
- The old milestone-1 planning docs had drifted and were incorrectly still acting as top-level source of truth
- The revamp direction is now restored in the main planning files and reference notes
- Phase 9 delivered the workspace frame refactor: tabbed left rail, store-backed filters panel, right-side analysis panel, bottom-right minimap, collapsed timeline dock, and known-intent AI command band
- The graph canvas no longer owns primary side-panel layout responsibilities; shell framing now lives in `CaseWorkspaceShell`
- Jest now ignores `.claude/worktrees/` so validation runs target the real workspace only
- Phase 10 is now delivered with:
  - typeahead-first search and committed focus selection
  - semantic entity color and iconic shape language
  - dimmed focused-network readability
  - default label-on / selective edge-label behavior
- Phase 11 decisions are now locked for:
  - exact shared placement between 2D and 3D
  - preserving selected node plus focused neighborhood on view switch
  - gesture parity as close as practical
  - preserving node/focus state only, not exact camera framing
- Phase 11 gap-closure (11-04) delivered:
  - 2D drag fixed: `.subject()` now uses `pointer(event, canvas)` for canvas-relative coords
  - 3D drag vertical inversion fixed: `worldDeltaY` formula negates `deltaY` to compensate screen-Y inversion
  - 3D→2D position carry fixed: `convert3DPositionTo2D(SCALE=1.5)` converts 3D world (x,z) to 2D canvas (x,y)
  - Screen-Y inversion regression test added to projection3d.test.ts
  - 61 tests pass, TypeScript clean, build succeeds

## Verification Status

- Phase 8 UAT: complete (`7/7` passed)
- Security review for Phase 8: not yet recorded
- Phase 9 validation: `pnpm exec tsc --noEmit`, `pnpm exec jest --runInBand`, and `pnpm build` all passed
- Phase 10 validation: `pnpm exec tsc --noEmit`, `pnpm exec jest --runInBand`, and `pnpm build` all passed
- Phase 11 UAT: `3/5` passed, `2/5` issues (diagnosed and fixed by 11-04)
- Phase 11 gap-closure validation: 61 tests pass, TypeScript clean

## Next Actions

1. Run `/gsd-verify-work 11` (re-test the two failing UAT items)
2. Run `/gsd-secure-phase 8` (security review still pending)
3. Discuss Phase 12

## Blockers / Concerns

- Additional screenshots or extracted frames can still be re-added later if needed, but the critical video and graph workspace screenshot are already restored in the repo

## Reference Assets

- `.planning/references/mac-ui-reference/2026-04-09.mp4`
- `.planning/references/mac-ui-reference/graph-view-selected-filters.png`

## Resume Point

Resume from: `.planning/ROADMAP.md` -> Phase 11 re-verification
Next phase entry: `.planning/phases/11-2d-3d-interaction-parity/11-04-SUMMARY.md`

---
*Last updated: 2026-04-14 after Phase 11 gap-closure execution*
