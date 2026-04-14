# Phase 11 Validation

## Required Checks

### Shared Placement

- Drag a node in `2D`, switch to `3D`, and verify the same node placement is preserved.
- Drag a node in `3D`, switch to `2D`, and verify the same node placement is preserved.
- Multiple moved nodes should remain stable across repeated view switches.

### Selection / Focus Parity

- Select a node in `2D`, switch to `3D`, and verify the same node remains selected.
- Verify the focused neighborhood remains highlighted/dimmed consistently after the switch.
- Repeat the same flow starting from `3D`.

### Gesture Parity

- In both views, clicking a node selects it.
- In both views, dragging a node moves it.
- In both views, navigating empty space does not accidentally move a node.
- Zooming in either renderer does not scroll the page.

### 3D Semantic Parity

- 3D remains readable after parity changes.
- Semantic node colors remain recognizable by entity type.
- 3D focus/dimming behavior still matches the “dim, don’t hide” contract.

### Regression Safety

- `pnpm exec tsc --noEmit`
- `pnpm test -- --runInBand`
- `pnpm build`

## UAT Pass Condition

Phase 11 is verified only when all shared-placement and cross-renderer parity behaviors pass in live use, not just in tests.
