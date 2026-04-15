# Spec: Graph Workspace Layout Polish

## Assumptions I'm Making

1. This is a desktop-first refinement of the existing case workspace, not a new mobile layout.
2. The change should apply consistently to both `2D` and `3D` graph views unless a control is explicitly renderer-specific.
3. The search control belongs to the left evidence/filter rail, not inside the graph panel header.
4. The graph canvas should expand vertically to consume available workspace height after header cleanup.
5. This is a follow-on polish spec after milestone `v2.0`, not a rewrite of graph behavior or data architecture.

## Objective

Polish the graph workspace layout so the graph panel uses space more efficiently and aligns more closely with the reference framing. The user should be able to open a case and immediately see:

- search where it belongs in the left rail
- a tighter graph header with no wasted band of empty space
- the minimap anchored bottom-right inside the graph layout
- the graph canvas filling the available vertical area without dead space below it

Success means the workspace feels denser, more intentional, and easier to scan without changing the existing interaction model.

## Tech Stack

- Next.js App Router
- TypeScript
- React 19
- Tailwind CSS
- Zustand for workspace state
- Jest for unit/component tests

## Commands

- Dev: `pnpm dev`
- Test: `pnpm test -- --runInBand`
- Typecheck: `pnpm exec tsc --noEmit`
- Build: `pnpm build`

## Project Structure

- `src/app/` -> route entrypoints and app shell
- `src/components/pages/` -> case page orchestration
- `src/components/layout/` -> workspace shell, rails, timeline, AI command surface
- `src/components/graph/` -> `2D` / `3D` graph presenters and minimap
- `src/lib/graph/` -> graph rendering and behavior helpers
- `.planning/specs/` -> new follow-on specs for layout polish and post-milestone work

## Code Style

Follow existing React component patterns: keep shell/layout concerns in layout components, keep graph rendering concerns inside graph components, and keep props explicit.

```tsx
<div className="flex items-center justify-between gap-4">
  <h2 className="text-2xl font-semibold text-shell-text-primary">MindMap3D</h2>
  <button
    type="button"
    className="rounded-shell-lg border border-shell-accent/25 bg-shell-accent-muted px-4 py-3 text-sm font-semibold text-shell-text-primary"
  >
    Zoom to Fit
  </button>
</div>
```

Conventions:
- prefer layout changes in the smallest owning component
- avoid duplicating shell controls across workspace layers
- keep renderer-specific controls aligned unless behavior truly differs
- preserve desktop-first spacing and shell token usage

## Testing Strategy

- Update or add component tests where layout contracts are already covered
- Run focused tests for graph/layout shell components if markup changes
- Run full typecheck before signoff
- Run full build before signoff because layout regressions often surface through route/component integration

Recommended validation:
- `pnpm exec tsc --noEmit`
- `pnpm test -- --runInBand src/components/layout/__tests__/WorkspacePanels.test.tsx src/components/graph/__tests__/GraphWorkspace.test.tsx src/__tests__/app-shell.test.tsx`
- `pnpm build`

## Boundaries

- Always:
  - keep search, minimap, and graph controls visually consistent between `2D` and `3D`
  - preserve current graph selection, drag, zoom, and focus behavior
  - keep minimap inside the graph layout at bottom-right
- Ask first:
  - changing evidence-rail information architecture beyond adding/moving search
  - changing graph panel height rules in a way that impacts timeline collapse behavior
  - introducing new controls beyond the screenshot scope
- Never:
  - regress existing `2D` / `3D` interaction parity
  - move minimap outside the graph panel
  - reintroduce dead vertical space under the graph canvas

## Scope

### In Scope

1. Move graph search into the left sidebar near the rail controls.
2. Remove the empty horizontal band in the graph panel header.
3. Keep the minimap visually anchored at the bottom-right of the graph layout.
4. Expand the graph panel/canvas to fill the vertical space currently left empty below it.

### Out of Scope

- new graph semantics or selection logic
- AI command workflow changes
- timeline redesign beyond any necessary height coordination
- evidence card redesign

## Success Criteria

1. Search is no longer rendered in the graph header area and instead appears in the left rail.
2. The graph panel header has no large empty spacer band between title and controls.
3. The minimap remains fixed to the bottom-right corner of the graph layout in both renderers.
4. The graph canvas expands to occupy the freed vertical space so there is no obvious empty block below the graph panel.
5. `2D` and `3D` headers retain aligned controls and similar spacing rhythm after the polish.
6. Typecheck, targeted tests, and production build all pass after the change.

## Open Questions

1. Should the left-rail search remain visible in both `Raw Evidence` and `Filters & Layers`, or only in one tab?
2. Should `Zoom to Fit` stay renderer-local in the graph header, or eventually move to a shared workspace toolbar?
