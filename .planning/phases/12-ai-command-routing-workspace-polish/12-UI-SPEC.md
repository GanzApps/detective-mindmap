# Phase 12 UI Spec

## Command Surface

- The command bar remains anchored as the bottom workspace surface.
- Input accepts natural language and slash-style commands in the same field.
- The surface should feel active and intentional even before typing.
- Inline status should communicate `idle`, `running`, `complete`, and `failed`.

## Quick Chips

- A stable baseline row of quick commands is always available.
- Additional contextual chips can appear based on selection, current focus, or active case state.
- Chips should route through the same known-intent path as typed input.

## Right Panel

- The existing right-side panel supports at least two clear modes:
  - `node detail`
  - `AI result`
- AI result mode should replace the panel contents cleanly instead of stacking mixed content.
- The mode shift should be obvious from heading/state treatment.

## Visual Polish

- Keep the shell calm and reference-aligned.
- Avoid toast-heavy feedback; command state should remain readable in-place.
- Preserve graph visibility as the first priority.
