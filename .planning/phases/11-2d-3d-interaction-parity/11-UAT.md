---
status: diagnosed
phase: 11-2d-3d-interaction-parity
source:
  - 11-01-SUMMARY.md
  - 11-02-SUMMARY.md
  - 11-03-SUMMARY.md
started: 2026-04-13T17:45:00+07:00
updated: 2026-04-13T18:30:00+07:00
---

## Current Test

[testing complete]

## Tests

### 1. Shared placement carries from 2D to 3D
expected: Drag a node to a new position in 2D, switch to 3D, and the same node should appear in the corresponding carried-over position instead of snapping back to its default layout.
result: issue
reported: "fail - node can't drag"
severity: major

### 2. Shared placement carries from 3D to 2D
expected: Drag a selected node to a new position in 3D, switch back to 2D, and the same node should stay in the corresponding carried-over position instead of resetting.
result: issue
reported: "Fail - Node can drag when selected but dragged top down its still inverse & position 2d shared match as 3d"
severity: major

### 3. Selected node and focused neighborhood survive renderer switch
expected: Select or focus a node in one renderer, switch views, and the same node should remain selected while its neighborhood stays emphasized and unrelated nodes stay dimmed.
result: pass

### 4. Gesture intent feels consistent across 2D and 3D
expected: In both renderers, clicking a node selects it, dragging a node moves it, dragging empty space navigates the canvas/camera, and scroll zoom stays inside the graph surface.
result: pass

### 5. 3D semantic shapes remain readable after parity changes
expected: In 3D, node colors and shapes should still be distinguishable by entity type, and the scene should remain understandable after the parity updates.
result: pass

## Summary

total: 5
passed: 3
issues: 2
pending: 0
skipped: 0

## Gaps

- truth: "Drag a node to a new position in 2D, switch to 3D, and the same node should appear in the corresponding carried-over position instead of snapping back to its default layout."
  status: failed
  reason: "User reported: fail - node can't drag"
  severity: major
  test: 1
  root_cause: "ForceGraph2D.tsx line 397 — drag .subject() callback passes raw MouseEvent.x/y (page coords) to hitTest2D instead of canvas-relative coords from pointer(event, canvas). hitTest2D applies the zoom transform (mx - transform.x) / transform.k expecting canvas coords, so the hit test always misses every node, .subject() returns null, and D3 drag never starts."
  artifacts:
    - path: "src/components/graph/ForceGraph2D.tsx"
      issue: "line 397: .subject() uses event.x/event.y (page coords) instead of pointer(event, canvas) canvas-relative coords"
  missing:
    - "Replace event.x, event.y in .subject() with const [cx, cy] = pointer(event, canvas) and pass cx, cy to hitTest2D"
  debug_session: ""
- truth: "Drag a selected node to a new position in 3D, switch back to 2D, and the same node should stay in the corresponding carried-over position instead of resetting."
  status: failed
  reason: "User reported: Fail - Node can drag when selected but dragged top down its still inverse & position 2d shared match as 3d"
  severity: major
  root_cause: "Two separate bugs: (1) MindMap3D.tsx lines 505-506 — drag delta worldDeltaY adds +deltaY*cos(yaw) without compensating for screen-Y inversion baked into projection3d.ts (sy = height/2 - ty*scale negates world Y), so dragging down moves node up. (2) SharedNodePosition.y means 3D world Z (not world Y) in projection3d.ts lines 119/122, but ForceGraph2D.tsx lines 537-540 applies sharedPosition.x/y directly as 2D canvas x/y with no coordinate-space conversion — the two renderers use incompatible coordinate semantics for the same field."
  artifacts:
    - path: "src/components/graph/MindMap3D.tsx"
      issue: "lines 503-509: drag delta deltaY not negated to account for screen-Y inversion, causing inverted vertical drag"
    - path: "src/lib/graph/projection3d.ts"
      issue: "lines 69, 119, 122: SharedNodePosition.y maps to 3D world Z; screen Y is negated (sy = height/2 - ty*scale)"
    - path: "src/components/graph/ForceGraph2D.tsx"
      issue: "lines 537-540: sharedPosition.x/y applied as 2D canvas coords with no transform from 3D world space"
  missing:
    - "Negate deltaY terms in MindMap3D drag handler: worldDeltaX = (deltaX*cos(yaw) + deltaY*sin(yaw))/zoom, worldDeltaY = (deltaX*sin(yaw) - deltaY*cos(yaw))/zoom"
    - "Add coordinate conversion in GraphWorkspace or projection3d.ts to map SharedNodePosition from 3D world (x, z) to 2D canvas (x, y) before passing to ForceGraph2D"
  debug_session: ""
