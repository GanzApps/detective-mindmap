# Task List: Graph Workspace Layout Polish

Reference:
- `tasks/polish-position.png`

## Goal

Polish the graph workspace layout so the graph area uses space better and the controls sit in the right places.

## Scope

- move search from the graph header into the left sidebar
- remove the wasted horizontal header space above the graph
- keep the minimap anchored bottom-right inside the graph layout
- make the graph panel fill the available vertical space so there is no dead area below it

## Tasks

- [ ] Task 1: Move graph search into the left rail
  - Acceptance: search is rendered in the left sidebar instead of the graph header
  - Acceptance: search is visible in the intended rail mode(s) without breaking rail layout
  - Verify: manual check in both `2D` and `3D`

- [ ] Task 2: Remove empty graph-header band
  - Acceptance: graph header no longer has a large spacer strip between title and controls
  - Acceptance: `2D` and `3D` header rows keep aligned spacing and control rhythm
  - Verify: manual comparison against `tasks/polish-position.png`

- [ ] Task 3: Keep minimap anchored bottom-right in the graph layout
  - Acceptance: minimap stays visually attached to the graph panel in both renderers
  - Acceptance: minimap does not drift into page margin or timeline space
  - Verify: manual check in both `2D` and `3D`

- [ ] Task 4: Expand graph layout to fill vertical space
  - Acceptance: the graph panel/canvas fills the freed height below the header
  - Acceptance: obvious dead space under the graph is removed
  - Verify: manual resize check at desktop widths

## Validation

- [ ] `pnpm exec tsc --noEmit`
- [ ] `pnpm test -- --runInBand src/components/graph/__tests__/GraphWorkspace.test.tsx src/components/layout/__tests__/WorkspacePanels.test.tsx src/__tests__/app-shell.test.tsx`
- [ ] `pnpm build`
