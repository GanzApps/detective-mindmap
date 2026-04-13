---
status: complete
phase: 11-2d-3d-interaction-parity
source:
  - 11-01-SUMMARY.md
  - 11-02-SUMMARY.md
  - 11-03-SUMMARY.md
started: 2026-04-13T17:45:00+07:00
updated: 2026-04-13T18:10:00+07:00
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
  artifacts: []
  missing: []
- truth: "Drag a selected node to a new position in 3D, switch back to 2D, and the same node should stay in the corresponding carried-over position instead of resetting."
  status: failed
  reason: "User reported: Fail - Node can drag when selected but dragged top down its still inverse & position 2d shared match as 3d"
  severity: major
  test: 2
  artifacts: []
  missing: []
