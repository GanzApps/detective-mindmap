---
phase: 11-2d-3d-interaction-parity
plan: 04
subsystem: graph
tags: [d3, drag, coordinate-space, 3d, 2d, canvas, hit-test, projection]

requires:
  - phase: 11-03
    provides: 3D semantic shape rendering and cross-renderer regression coverage

provides:
  - 2D drag fully functional using canvas-relative coordinates in D3 .subject()
  - 3D vertical drag direction corrected via screen-Y inversion compensation
  - 3D-to-2D position carry working via coordinate conversion at the shared position boundary
  - Screen-Y inversion contract locked in projection3d test

affects: [11-2d-3d-interaction-parity, INTER-07, INTER-08]

tech-stack:
  added: []
  patterns:
    - "coordinate-space boundary: convert 3D world coords to 2D canvas coords at shared position store"
    - "screen-Y inversion compensation: negate deltaY terms in 3D drag delta formula"
    - "D3 drag subject: use pointer(event, canvas) not event.x/y for canvas-relative coords"

key-files:
  created: []
  modified:
    - src/components/graph/ForceGraph2D.tsx
    - src/components/graph/MindMap3D.tsx
    - src/components/graph/GraphWorkspace.tsx
    - src/lib/graph/__tests__/projection3d.test.ts

key-decisions:
  - "Use pointer(event, canvas) in D3 .subject() so hit test receives canvas-relative not page coords"
  - "Negate deltaY*sin(yaw) and deltaY*cos(yaw) signs in worldDeltaX/Y to compensate projection3d screen-Y inversion"
  - "Apply coordinate conversion in GraphWorkspace at shared position boundary (SCALE=1.5) rather than in either renderer"
  - "Lock screen-Y inversion contract with explicit test: positive world-Y must project above screen center"

patterns-established:
  - "Coordinate boundary conversion: convert3DPositionTo2D() applied at GraphWorkspace, not inside renderers"
  - "Inversion-aware drag: 3D drag delta formula accounts for sy = height/2 - ty*scale sign flip"

requirements-completed: [INTER-06, INTER-07, INTER-08]

duration: 35min
completed: 2026-04-14
---

# Phase 11 Plan 04 Summary

**Closed 2D drag hit-test miss and 3D vertical inversion bugs by fixing coordinate-space errors at three seam points: D3 subject(), worldDelta formula, and shared position store conversion**

## Performance

- **Duration:** 35 min
- **Started:** 2026-04-14T06:00:00Z
- **Completed:** 2026-04-14T06:35:00Z
- **Tasks:** 4
- **Files modified:** 4

## Accomplishments

- Fixed 2D drag: `.subject()` now passes `pointer(event, canvas)` canvas-relative coords to `hitTest2D` — drag activates reliably on any node
- Fixed 3D vertical inversion: `worldDeltaY` formula negates `deltaY*cos(yaw)` to compensate for `sy = height/2 - ty*scale` screen-Y flip in projection3d
- Fixed 3D-to-2D position carry: `convert3DPositionTo2D(SCALE=1.5)` applied in `GraphWorkspace.handleUpdateNodePosition` when `viewMode === '3d'`
- Added screen-Y inversion regression test: confirms positive world-Y → `sy < height/2` and negative world-Y → `sy > height/2`

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix 2D drag subject** - `486ca6e` (fix)
2. **Task 2: Fix 3D drag vertical inversion** - `8b3f21d` (fix)
3. **Task 3: Fix 3D-to-2D position carry** - `2b58420` (fix)
4. **Task 4: Add screen-Y inversion test** - `8eb0615` (test)

## Files Created/Modified

- `src/components/graph/ForceGraph2D.tsx` — `.subject()` uses `pointer(event, canvas)` instead of `event.x/event.y`
- `src/components/graph/MindMap3D.tsx` — `worldDeltaX/Y` signs corrected for screen-Y inversion
- `src/components/graph/GraphWorkspace.tsx` — `convert3DPositionTo2D()` helper + `handleUpdateNodePosition` applies it when `viewMode === '3d'`
- `src/lib/graph/__tests__/projection3d.test.ts` — screen-Y inversion contract test added

## Decisions Made

- Applied coordinate conversion at `GraphWorkspace` boundary (not inside renderers) to keep each renderer's internal coordinate space clean
- Used `SCALE = 1.5` to map 3D tier-radius range (~0–400) to 2D force layout canvas range without clamping
- Locked inversion semantics in a dedicated test rather than relying on integration tests alone

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- Worktree was initialized at base commit `19a29948` with wave 1–3 source changes uncommitted in the main workspace; resolved by copying the modified files into the worktree before applying the Task fixes
- Jest `testPathIgnorePatterns` in the worktree blocked all tests (worktree path matched the ignore rule); resolved by clearing the ignore patterns in the local `jest.config.ts`

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All UAT gaps from Phase 11 verification are now closed
- 2D and 3D drag interaction is behaviorally correct
- 3D-to-2D position carry produces correct quadrant placement
- Full test suite passes (61 tests) and build is clean
- Phase 11 is ready for final integration and merge

---
*Phase: 11-2d-3d-interaction-parity*
*Completed: 2026-04-14*
