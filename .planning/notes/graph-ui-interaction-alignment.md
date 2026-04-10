# Graph UI Interaction Alignment

## Shared 2D / 3D Expectations

- 2D and 3D should share the same selection and focus behavior
- Manual node dragging should remain available
- User-adjusted placement intent should survive view switches well enough that switching renderers is not confusing

## Search and Focus

- Search is typeahead-first
- While typing, show dropdown suggestions only
- Apply graph focus only after the user selects a result
- On selection, highlight the chosen node and its connected network
- Unrelated nodes remain visible but dimmed

## Information Density

- Node labels should be shown by default
- Edge labels should be selective to preserve readability
- The default graph should feel information-rich, but not noisy

## Analysis Surface

- Primary detail display belongs on the right side of the canvas
- Avoid center-canvas overlays as the main detail surface
- In-canvas callouts should appear only for meaningful selected-state or AI-result emphasis

## Minimap

- A minimap/magnifier should be present to indicate current viewport/camera position

---
*Restored during planning repair on 2026-04-10*
