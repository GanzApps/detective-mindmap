# Implementation Plan: Sidebar Evidence Tab — Entities with Children Count

## Overview

Transform the existing `EvidenceSidebar` + `EntitiesPanel` into a 2-tab sidebar (Evidence = Entities · Filters) with SVG entity type icons and a clickable children count badge on each entity row. The EntitiesPanel already has By Type / Hierarchy views — this plan adds the badge, generates the SVG assets, and simplifies the sidebar tab structure.

## Architecture Decisions

- **SVG icons as static files in `public/`** — using `<img>` tags with `style={{ color }}` for `currentColor` theming, avoiding React component boilerplate per icon.
- **EntityIcon wrapper component** — single component that maps `EntityType` to SVG path and handles sizing/color, keeping `EntitiesPanel` clean.
- **Children count computed via Map** — O(n) pass over nodes, stored as `Map<string, number>` keyed by parent ID, passed to EntityRow.
- **Evidence tab replaces old evidence files list** — the old evidence category/file rendering is removed from the sidebar. If needed later, it can be relocated to the analysis panel (out of scope).

## Task List

### Phase 1: SVG Icon Assets

#### Task 1: Generate 7 SVG icon files for entity types

**Description:** Create `public/icons/entity-types/` directory with 7 SVG files — one per `EntityType`. Each file uses the existing `ENTITY_TYPE_ICON` path data wrapped in a proper `<svg>` element with `currentColor` stroke so color can be controlled via CSS.

**Acceptance criteria:**
- [ ] 7 SVG files exist in `public/icons/entity-types/` (person, organization, location, event, evidence, vehicle, digital)
- [ ] Each file is valid SVG with `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.5"`
- [ ] Path data matches the existing `ENTITY_TYPE_ICON` constants in `graphTypes.ts`

**Verification:**
- [ ] Open each SVG in browser — renders correctly at 24×24
- [ ] Check SVG source — uses `currentColor`, not hardcoded hex colors

**Dependencies:** None

**Files likely touched:**
- `public/icons/entity-types/person.svg` (new)
- `public/icons/entity-types/organization.svg` (new)
- `public/icons/entity-types/location.svg` (new)
- `public/icons/entity-types/event.svg` (new)
- `public/icons/entity-types/evidence.svg` (new)
- `public/icons/entity-types/vehicle.svg` (new)
- `public/icons/entity-types/digital.svg` (new)

**Estimated scope:** Small — 7 files, straightforward generation

---

### Phase 2: EntityIcon Wrapper Component

#### Task 2: Create EntityIcon component that loads SVG files

**Description:** Create a small `EntityIcon` component in `EntitiesPanel.tsx` (or as a separate file) that maps `EntityType` to the correct SVG file path, renders it at the requested size, and applies `ENTITY_TYPE_COLOR[type]` via inline `style.color`.

**Acceptance criteria:**
- [ ] `EntityIcon` accepts `type: EntityType` and `size?: number` (default 14)
- [ ] Renders `<img>` or inline `<svg>` with correct file path
- [ ] Color is set via `style={{ color: ENTITY_TYPE_COLOR[type] }}`
- [ ] Component has `shrink-0` class to prevent flex squishing

**Verification:**
- [ ] `EntitiesPanel` renders without errors with new icon component
- [ ] Icons appear in By Type section headers (16px) and entity rows (14px)
- [ ] Each icon has the correct type color

**Dependencies:** Task 1

**Files likely touched:**
- `src/components/layout/EntitiesPanel.tsx`

**Estimated scope:** XS — 1 file, ~20 lines

---

### Phase 3: Children Count Badge

#### Task 3: Add children count computation and badge to EntitiesPanel

**Description:** Add `computeChildrenCountMap()` function to build a `Map<parentId, childCount>` from the nodes array. Add a children count badge to `EntityRow` that shows `{count}` + chevron-down SVG, visible only when count > 0, clickable to call `onSelectNode`.

**Acceptance criteria:**
- [ ] `computeChildrenCountMap` correctly counts direct children per node
- [ ] EntityRow receives `childCount` prop or reads from map
- [ ] Badge renders only when `childCount > 0`
- [ ] Badge shows `{count}` followed by 12×12 chevron-down SVG
- [ ] Badge click calls `onSelectNode(node.id)` with `e.stopPropagation()`
- [ ] Badge has correct hover styles: `hover:text-shell-text-primary hover:border-shell-accent/30`

**Verification:**
- [ ] Nodes with children show correct count in badge
- [ ] Nodes without children show no badge
- [ ] Clicking badge selects node (same as row click)
- [ ] Unit test: badge count matches expected children

**Dependencies:** None (can be done in parallel with Tasks 1-2)

**Files likely touched:**
- `src/components/layout/EntitiesPanel.tsx`

**Estimated scope:** Small — 1 file, ~40 lines

---

### Checkpoint: Core EntitiesPanel Complete

- [ ] `EntitiesPanel` renders By Type view with SVG icons and children badges
- [ ] `EntitiesPanel` renders Hierarchy view with SVG icons and children badges
- [ ] `npm run build` succeeds
- [ ] All existing tests pass

---

### Phase 4: Simplify EvidenceSidebar to 2 Tabs

#### Task 4: Reduce EvidenceSidebar from 3 tabs to 2

**Description:** Change `RailTab` type from `'evidence' | 'filters' | 'entities'` to `'evidence' | 'filters'`. Rename the tab button labels: first tab → "Evidence" (renders `entitiesPanel`), second tab → "Filters". Remove the old evidence files list rendering (the `evidence.map(...)` block). Remove unused `evidence`, `selectedEvidenceId`, `onEvidenceSelect` props if no longer needed.

**Acceptance criteria:**
- [ ] `RailTab` type is `'evidence' | 'filters'`
- [ ] Tab buttons render: "Evidence" and "Filters"
- [ ] "Evidence" tab renders `entitiesPanel` content
- [ ] "Filters" tab renders `filtersPanel` content
- [ ] Old evidence files list (`evidence.map(...)`) is removed
- [ ] Unused props (`evidence`, `selectedEvidenceId`, `onEvidenceSelect`) are removed
- [ ] TypeScript compiles without errors

**Verification:**
- [ ] Sidebar shows 2 tabs
- [ ] "Evidence" tab displays EntitiesPanel (By Type / Hierarchy)
- [ ] "Filters" tab displays WorkspaceFiltersPanel
- [ ] No TypeScript errors in `EvidenceSidebar` or callers

**Dependencies:** None (can be done in parallel with Tasks 1-3)

**Files likely touched:**
- `src/components/layout/EvidenceSidebar.tsx`
- `src/components/layout/CaseWorkspaceShell.tsx` (update props passed to EvidenceSidebar)

**Estimated scope:** Small — 2 files

---

### Phase 5: Cleanup & Tests

#### Task 5: Add EntitiesPanel unit tests

**Description:** Create `src/components/layout/__tests__/EntitiesPanel.test.tsx` covering: By Type grouping, empty-type hiding, Hierarchy tree building, orphan handling, children count badge behavior, select/delete interactions, selected/highlighted styling.

**Acceptance criteria:**
- [ ] Test: By Type sections grouped by `EntityType`
- [ ] Test: Empty type sections are hidden
- [ ] Test: Hierarchy builds tree with correct nesting
- [ ] Test: Orphaned nodes (parent not found) render as roots
- [ ] Test: Children count badge shows correct count
- [ ] Test: Children badge hidden for nodes with 0 children
- [ ] Test: Clicking badge calls `onSelectNode`
- [ ] Test: Clicking row calls `onSelectNode`
- [ ] Test: Delete button calls `onDeleteEntity`
- [ ] Test: Selected node has accent highlight class
- [ ] Test: Highlighted nodes have amber tint class
- [ ] Test: Tab switch between By Type / Hierarchy

**Verification:**
- [ ] `npm test` — all new tests pass
- [ ] `npm test -- --coverage` — EntitiesPanel covered

**Dependencies:** Tasks 1-4

**Files likely touched:**
- `src/components/layout/__tests__/EntitiesPanel.test.tsx` (new)

**Estimated scope:** Medium — 1 file, ~12 test cases

---

### Checkpoint: Complete

- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: sidebar shows 2 tabs, Evidence tab has By Type/Hierarchy with icons and children badges, Filters tab works
- [ ] Ready for review

---

## Dependency Graph

```
Task 1: SVG icons ──→ Task 2: EntityIcon wrapper ──→ Task 3: Children badge
                                                                        │
Task 4: Sidebar 2 tabs ─────────────────────────────────────────────────┤
                                                                        ├──→ Task 5: Tests
                                                                        │
Checkpoint: Core (after 1-4) ───────────────────────────────────────────┘
```

Tasks 1, 3, and 4 can be done in parallel. Task 2 depends on Task 1. Task 5 depends on all others.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Old evidence files list removal breaks `CaseWorkspaceShell` prop passing | Medium | Check all consumers of `EvidenceSidebar` props before removal; keep props if still used elsewhere |
| SVG icons not rendering due to Next.js static file handling | Low | Use `public/` directory (Next.js serves automatically); fallback to inline SVG if needed |
| `EntitiesPanel` already works — risk of regressions | Medium | Run existing tests before and after changes; test manually in dev server |
| Badge `stopPropagation` conflicts with row click | Low | Test both badge click and row click independently |

## Open Questions

None — all resolved in spec refinement.
