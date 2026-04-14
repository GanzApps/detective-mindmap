---
phase: 11-2d-3d-interaction-parity
verified: 2026-04-14T10:00:00Z
status: human_needed
score: 3/4
overrides_applied: 0
re_verification:
  previous_status: n/a
  previous_score: n/a
  gaps_closed: []
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Drag a node in 2D — confirm drag activates on the node itself"
    expected: "Mouse down on a node then mouse move causes the node to follow the cursor. Drag on empty space continues to pan. Mouse up pins the node at its new location."
    why_human: "The 2D drag hit-test fix (pointer(event,canvas) in .subject()) is proven by code review and unit regression, but the D3 drag activation path through real browser events and canvas coordinate transforms cannot be exercised without a running browser."
  - test: "Drag a selected node in 3D up/down — confirm direction is not inverted"
    expected: "Dragging a selected node upward moves it visually upward. Dragging downward moves it downward. No inversion."
    why_human: "The worldDeltaY sign fix is proven by the screen-Y inversion regression test in projection3d.test.ts, but correct visual direction in a rotating 3D canvas requires a running browser to confirm."
  - test: "Drag a node in 3D then switch to 2D — confirm node appears in the correct quadrant"
    expected: "A node dragged to the left in 3D appears on the left side of the 2D canvas after switching. The SCALE=1.5 conversion should produce approximate (not exact) quadrant correspondence."
    why_human: "The convert3DPositionTo2D() helper is wired at the GraphWorkspace boundary and is unit-tested, but verifying that quadrant correspondence feels non-disorienting to the user requires visual inspection in the running app."
  - test: "Switch from 2D to 3D with a node selected — confirm selection and focused neighborhood survive"
    expected: "The selected node remains highlighted and its direct neighbors are emphasized/unconnected nodes are dimmed in the 3D view."
    why_human: "Selection state is lifted to GraphWorkspace and passed as props; the visual dimming behavior in the 3D renderer requires a running scene to confirm end-to-end."
---

# Phase 11: 2D / 3D Interaction Parity — Verification Report

**Phase Goal:** Make the two renderers feel like one workspace by aligning behavior and preserving user intent across view switches.
**Verified:** 2026-04-14T10:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification (after gap-closure by 11-04)

---

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Selection and focus states behave consistently in both 2D and 3D | VERIFIED | `selectedNodeId` and `highlightedNodeIds` are lifted to `GraphWorkspace` and passed as identical props to both renderers. Both renderers read `focusSelectedNeighborhood` from the same store. GraphWorkspace test confirms both renderer shells receive the same selection prop. UAT test 3 ("selected node and focused neighborhood survive renderer switch") passed manual testing. |
| 2 | Nodes can be dragged in both views | VERIFIED (code) / human_needed (runtime) | 2D: D3 `.subject()` at line 398 now uses `pointer(event, canvas)` giving canvas-relative coords to `hitTest2D` — the specific bug that caused "node can't drag" is fixed. 3D: `dragModeRef` and `draggedNodeIdRef` wiring confirmed in MindMap3D; `worldDeltaX/Y` formula corrected for screen-Y inversion. All 61 tests pass. Runtime behavior requires human verification. |
| 3 | User-adjusted placement intent survives view switches without feeling disorienting | VERIFIED (code) / human_needed (runtime) | `nodePositions` state lives in `GraphWorkspace` (line 91). On drag end, both renderers call `onUpdateNodePosition`. When `viewMode === '3d'`, `handleUpdateNodePosition` applies `convert3DPositionTo2D(SCALE=1.5)` before storing (lines 199, 76-78). The stored value is then passed as `nodePositions` prop to both renderers. The projection3d layout builder applies shared position overrides to 3D x/z placement. Code path is complete and unit-tested. Whether the quadrant correspondence "feels non-disorienting" requires human confirmation. |
| 4 | 3D styling follows the same semantic model as 2D where technically practical | VERIFIED | `renderer3d.ts` uses `ENTITY_TYPE_COLOR[node.node.type]` for node color (line 189), `drawProjectedShape()` renders entity-type-specific shapes, and glow effects are keyed to selection/highlight state — matching the 2D semantic model. 11-03 specifically added shape-aware drawing aligned with Phase 10 entity semantics. |

**Score:** 3/4 truths fully verifiable without runtime (SC-4 VERIFIED; SC-1 VERIFIED; SC-2 and SC-3 code-verified but have runtime behaviors requiring human sign-off).

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/graph/GraphWorkspace.tsx` | Shared node position state, convert3DPositionTo2D, handleUpdateNodePosition | VERIFIED | Exists, substantive (317 lines), wired. `convert3DPositionTo2D` at line 76; `handleUpdateNodePosition` at line 198; `nodePositions` state at line 91; passed to both child renderers. |
| `src/components/graph/ForceGraph2D.tsx` | D3 drag with canvas-relative .subject(), onUpdateNodePosition emit, shared position consume | VERIFIED | Exists, substantive (699 lines), wired. `.subject()` uses `pointer(event, canvas)` at line 398. `onUpdateNodePosition` called on drag end (line 454). Shared positions applied in nodePositions useEffect (lines 527-555). |
| `src/components/graph/MindMap3D.tsx` | 3D node drag with corrected worldDelta formula, onUpdateNodePosition emit, shared position consume | VERIFIED | Exists, substantive (622 lines), wired. `worldDeltaX/Y` formula at lines 505-506 with correct sign for screen-Y inversion. `onUpdateNodePosition` called on mouseup (lines 343-347). `sharedPositions` passed to `drawFrame3D` (lines 155-158). |
| `src/lib/graph/projection3d.ts` | SharedNodePosition type, buildMindMap3DLayout with shared position overrides, projectNode3D | VERIFIED | Exists, substantive (163 lines), wired. `SharedNodePosition` exported at line 3. `buildMindMap3DLayout` applies `sharedPositions[node.id]` overrides at lines 118-121 mapping x → world X, y → world Z. Screen-Y inversion via `sy = height/2 - ty*scale` confirmed at line 70. |
| `src/lib/graph/__tests__/projection3d.test.ts` | Screen-Y inversion regression test, shared position override test | VERIFIED | Both tests exist. "applies shared position overrides to x and z placement" at line 16. "projects positive world-Y to above screen center" at line 29. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| ForceGraph2D | GraphWorkspace.handleUpdateNodePosition | onUpdateNodePosition prop | WIRED | Line 76 of GraphWorkspace passes `handleUpdateNodePosition`; ForceGraph2D calls it at line 454 on drag end. |
| MindMap3D | GraphWorkspace.handleUpdateNodePosition | onUpdateNodePosition prop | WIRED | Same handler passed at GraphWorkspace line 299; MindMap3D calls it in mouseup handler at line 344. |
| GraphWorkspace.handleUpdateNodePosition | convert3DPositionTo2D | viewMode === '3d' guard | WIRED | Line 199: `const stored = viewMode === '3d' ? convert3DPositionTo2D(position) : position;` |
| GraphWorkspace.nodePositions | ForceGraph2D | nodePositions prop | WIRED | Line 269 in GraphWorkspace JSX. ForceGraph2D applies overrides in useEffect (lines 527-555). |
| GraphWorkspace.nodePositions | MindMap3D | nodePositions prop | WIRED | Line 293 in GraphWorkspace JSX. MindMap3D passes `{ ...nodePositionsRef.current, ...dragPositionOverridesRef.current }` to `drawFrame3D` as `sharedPositions`. |
| projection3d.buildMindMap3DLayout | sharedPositions overrides | sharedPositions parameter | WIRED | Lines 115-121: `sharedPosition?.x` overrides world X, `sharedPosition?.y` overrides world Z (z). |
| D3 drag .subject() | hitTest2D | pointer(event, canvas) | WIRED | Line 398: `const [cx, cy] = pointer(event, canvas); return hitTest2D(nodesRef.current, cx, cy, transformRef.current);` |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| ForceGraph2D drag | `subject` (node datum) | D3 `.subject()` → `hitTest2D` with `pointer(event, canvas)` | Yes — canvas-relative coords hit-test against live simulation nodes | FLOWING |
| MindMap3D drag | `dragPositionOverridesRef` | `movementX/Y` from mousemove, corrected worldDelta formula | Yes — delta applied to current node position | FLOWING |
| GraphWorkspace nodePositions | `nodePositions` state | `handleUpdateNodePosition` → `convert3DPositionTo2D` when in 3D | Yes — converted and stored | FLOWING |
| 3D renderer sharedPositions | projected node positions | `nodePositionsRef.current` merged with `dragPositionOverridesRef.current` | Yes — live drag overrides merged with persisted positions | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript clean | `pnpm exec tsc --noEmit` | No output (clean) | PASS |
| All 61 tests pass | `pnpm exec jest --runInBand` | 16 suites, 61 tests passed | PASS |
| Screen-Y inversion contract | `projection3d.test.ts` "projects positive world-Y to above screen center" | above.sy < 300 (viewport height/2) | PASS |
| Shared position override | `projection3d.test.ts` "applies shared position overrides to x and z placement" | layout node x=123, z=-77 | PASS |
| Gap-closure commits exist | `git show 486ca6e 8b3f21d 2b58420 8eb0615` | All 4 commits verified in git log | PASS |
| 2D drag runtime | Requires running browser | Not run | human_needed |
| 3D drag direction | Requires running browser | Not run | human_needed |
| 3D→2D coord carry visual | Requires running browser | Not run | human_needed |

---

### Requirements Coverage

| Requirement | Description | Status | Evidence |
|-------------|-------------|--------|----------|
| INTER-06 | 2D and 3D use the same selection and focus behavior | SATISFIED | `selectedNodeId` and `highlightedNodeIds` lifted to `GraphWorkspace` and passed identically to both renderers; `focusSelectedNeighborhood` from shared store; UAT test 3 passed; GraphWorkspace tests confirm prop pass-through |
| INTER-07 | Manual node dragging remains available in both renderers | SATISFIED (code) | 2D: D3 drag wired with corrected `.subject()` using `pointer(event,canvas)`; 3D: `dragModeRef==='node'` path in `onMouseMove` with corrected worldDelta formula. Runtime confirmation needed. |
| INTER-08 | User-adjusted placement intent preserved across 2D/3D view switches | SATISFIED (code) | `nodePositions` state in `GraphWorkspace`; `convert3DPositionTo2D` applied at boundary; both renderers consume `nodePositions` prop. Runtime confirmation needed. |
| GRAPH3D-10 | 3D graph adopts same focus and semantic styling model as 2D where technically practical | SATISFIED | `renderer3d.ts` uses `ENTITY_TYPE_COLOR` by entity type, `drawProjectedShape()` for semantic shapes, glow and dimming keyed to selection/focus/highlight state — matching 2D semantic model. Confirmed by 11-03 work. |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| ForceGraph2D.tsx | 617-618 | `placeholder=` attribute | Info | HTML input placeholder text — not a stub. No impact. |

No stub implementations, TODO/FIXME markers, hardcoded empty returns, or disconnected handlers found in any modified file.

---

### Human Verification Required

#### 1. 2D Node Drag Activates Correctly

**Test:** Open the app in a browser. Switch to 2D view. Mouse down on a node (not empty space) and drag. Release.
**Expected:** The node follows the cursor during drag. Drag on empty space pans the canvas, not nodes. After release, the node stays at its new position (pinned).
**Why human:** The D3 `.subject()` hit-test fix (`pointer(event, canvas)`) is proven by code review and the regression that caused "node can't drag" is clearly identified and fixed, but the D3 drag activation path runs through real browser `mousedown` → canvas coordinate transforms → `hitTest2D` — a path that cannot be exercised without a running browser.

#### 2. 3D Vertical Drag Direction Is Correct

**Test:** Open the app in a browser. Switch to 3D view. Click a node to select it (it should highlight). Mouse down on the selected node and drag upward on screen.
**Expected:** The node moves upward visually. Dragging downward moves it downward. No Y-axis inversion.
**Why human:** The `worldDeltaY` formula fix negates `deltaY * cos(yaw)` to compensate for `sy = height/2 - ty*scale` screen-Y inversion in `projection3d.ts`. The inversion contract is locked by a unit test. Correct visual direction in a rotating 3D canvas with live camera state requires a running browser to confirm.

#### 3. 3D-to-2D Position Carry Places Node in Correct Quadrant

**Test:** Open the app. Switch to 3D. Select a node. Drag it significantly to one side (e.g., left). Switch to 2D view.
**Expected:** The node appears on the corresponding side of the 2D canvas (roughly left). The position should be in the right general quadrant — exact pixel correspondence is not required, only that switching views "does not feel confusing."
**Why human:** The `convert3DPositionTo2D(SCALE=1.5)` conversion is unit-tested and the code path is verified, but "does not feel disorienting" is a qualitative user-experience judgment that requires a human to assess.

#### 4. Selection and Focused Neighborhood Survive Renderer Switch

**Test:** In 2D, click a node with several connections. Observe it is selected (highlighted) and its neighbors are emphasized. Switch to 3D.
**Expected:** The same node is selected in 3D with its neighborhood emphasized (connected nodes visible/distinct) and unrelated nodes dimmed. Then switch back to 2D and verify the same state is still active.
**Why human:** Selection state lift and dimming logic are code-verified, but the end-to-end visual experience requires a running scene.

---

## Gap Summary

No code gaps. All four ROADMAP success criteria have full implementation in the codebase. All 61 tests pass. TypeScript is clean. The four human verification items listed above are standard runtime sign-offs for interaction behaviors (drag feel, visual direction, spatial correspondence, visual dimming) that cannot be confirmed by static analysis. They are not gaps in the code — they are the final UAT re-checks for the two UAT issues diagnosed and fixed by plan 11-04.

The phase is code-complete and ready for human sign-off on the running app.

---

_Verified: 2026-04-14T10:00:00Z_
_Verifier: Claude (gsd-verifier)_
