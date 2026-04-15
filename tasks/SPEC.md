# SPEC: Sidebar Entities Tab — Group-by-Type, Hierarchy & Children Count

**Phase:** 13 (post v2.0)
**Date:** 2026-04-15
**Status:** **Approved** — ready for /plan

---

## Objective

Refine the Entities sidebar tab into a first-class navigation surface with two view modes and entity-level detail drill-down:
- **By Type** — entities grouped into collapsible sections per `EntityType`
- **Hierarchy** — entities rendered as an indented tree using `node.parent`
- **Children count badge** on each entity row — clickable to focus the node and open its detail in the analysis panel

Target user: detective/analyst scanning a case graph to locate, select, and manage entities, then quickly jump to their detail.

---

## Assumptions (validated)

1. Sidebar has **2 tabs**: **Evidence** (= Entities tab we're building) · **Filters** ✓
2. `node.parent` and `node.tier` are already present on every `GraphNode` (confirmed in `graphTypes.ts`) ✓
3. The analysis panel (`WorkspaceAnalysisPanel`) already handles showing entity detail when `selectedNodeId` is set — clicking a children badge just needs to call `onSelectNode` ✓
4. Entity detail is shown in the right-side analysis panel, NOT in a slide-out within the sidebar ✓
5. Entity type icons are **SVG files** (not inline `<path>` strings) — need to be generated as `.svg` assets ✓

---

## Scope

### In scope
- Reduce `EvidenceSidebar` to 2 tabs: **Evidence** (Entities content) · **Filters**
- `EntitiesPanel` component already exists — enhance with:
  - **Children count badge** on each entity row (count of direct children via `node.parent`)
  - Badge is clickable → calls `onSelectNode(node.id)` to focus the node (which opens detail in analysis panel)
- Keep existing By Type / Hierarchy sub-toggle
- Wire `onSelectNode` and `onDeleteEntity` into `EntitiesPanel`
- Generate 7 SVG icon files for entity types (`public/icons/entity-types/`)

### Out of scope
- Editing entity properties inline
- Drag-to-reorder or reparent via sidebar
- Adding new entities from the sidebar (+ Entity button stays in toolbar)
- Building a new detail panel inside the sidebar (detail uses existing analysis panel)
- Showing evidence files linked to entities (that's the Evidence tab's job)

---

## Acceptance Criteria

1. Sidebar has two tabs: **Evidence** (= Entities) · **Filters**
2. **Evidence tab** has a toggle row: **By Type** | **Hierarchy**
3. **By Type view:**
   - One collapsible section per `EntityType`, in existing display order (`ENTITY_TYPE_ORDER`)
   - Section header: type icon (16px SVG file), label (from `ENTITY_LABELS`), count badge
   - Sections with 0 entities are hidden
   - Each entity row: type icon (14px SVG file), label (truncated), status badge, **children count badge**, delete button
   - Clicking row calls `onSelectNode(node.id)` — selected node highlighted in graph + analysis panel
4. **Hierarchy view:**
   - Root nodes (`parent === null`) rendered at top level
   - Children indented under their parent, recursively
   - Indent = `depth * 12px` left padding per depth level
   - Orphaned children (parent ID not found in nodes) rendered as roots
   - Same row design as By Type view (with children count badge)
5. **Children count badge:**
   - Shown as a small rounded pill with the count of direct children + chevron-down SVG
   - Style: `text-[10px] px-1.5 py-0.5 rounded-full bg-shell-surface-raised border border-shell-border text-shell-text-muted`
   - Hover: `hover:text-shell-text-primary hover:border-shell-accent/30`
   - Clicking badge calls `onSelectNode(node.id)` — same effect as clicking the row
   - Badge hidden when node has 0 children
   - Layout: `{count}` followed by 12×12 chevron-down SVG icon
6. Selected node (`selectedNodeId`) shown with `bg-shell-accent-muted border-shell-accent/40`
7. Highlighted nodes (`highlightedEntityIds`) shown with amber tint (`border-amber-400/30 bg-amber-400/10`)
8. All existing tests pass; new `EntitiesPanel` unit tests cover By Type grouping, Hierarchy tree building, and children count badge behavior

---

## Component Design

### `EvidenceSidebar` changes — reduce to 2 tabs
```
RailTab = 'evidence' | 'filters'   // remove 'entities'
// Rename tab button label: 'entities' → 'Evidence'
// The 'evidence' tab now renders entitiesPanel content (not the old evidence files list)
// Old evidence files list: remove from sidebar (or relocate to analysis panel stretch goal)
// Remove the 'evidence' prop and onEvidenceSelect callback if unused
```

### Existing: `src/components/layout/EntitiesPanel.tsx`
```
Props (already defined):
  nodes: GraphNode[]
  selectedNodeId: string | null
  highlightedEntityIds: string[]
  onSelectNode: (id: string | null) => void
  onDeleteEntity: (id: string) => void

Enhancement:
  - Compute children count per node: build a Map<parentId, childCount>
  - Add ChildrenCountBadge component to EntityRow
  - Badge click → onSelectNode(node.id)
```

### New: SVG icon assets
```
Location: public/icons/entity-types/ (or src/assets/icons/entity-types/)
Files:
  - person.svg
  - organization.svg
  - location.svg
  - event.svg
  - evidence.svg
  - vehicle.svg
  - digital.svg

Each SVG: 24×24 viewBox, stroke-based, single-color adaptable
Used via: <img src="/icons/entity-types/person.svg" /> or <EntityIcon type="person" /> wrapper component
```

### `CaseWorkspaceShell` — NO changes needed
- Already passes `EntitiesPanel` with correct props
- Already has connections strip at bottom (entities not in bottom strip)

---

## Children Count Logic

```ts
// Compute children count per node
function computeChildrenCountMap(nodes: GraphNode[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const n of nodes) {
    if (n.parent) {
      map.set(n.parent, (map.get(n.parent) ?? 0) + 1)
    }
  }
  return map
}

// In EntityRow:
const childCount = childrenCountMap.get(node.id) ?? 0
{childCount > 0 && (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); onSelectNode(node.id) }}
    className="text-[10px] px-1.5 py-0.5 rounded-full border border-shell-border bg-shell-surface-raised text-shell-text-muted hover:text-shell-text-primary hover:border-shell-accent/30"
  >
    {childCount}
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
)}
```

---

## Entity Type SVG Icons

Generate 7 SVG icon files — one per `EntityType`. Store in `public/icons/entity-types/`.

| Type | Icon concept | File |
|------|-------------|------|
| `person` | user silhouette | `person.svg` |
| `organization` | building | `organization.svg` |
| `location` | map pin | `location.svg` |
| `event` | lightning bolt | `event.svg` |
| `evidence` | file/card | `evidence.svg` |
| `vehicle` | car | `vehicle.svg` |
| `digital` | monitor/hex | `digital.svg` |

Each SVG file structure:
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="[path data from ENTITY_TYPE_ICON]" />
</svg>
```

Color is applied via `currentColor` — wrapper component sets `color: ENTITY_TYPE_COLOR[type]` via inline style.

Used in:
- **By Type** section headers (16×16, beside section label)
- **Entity rows** (14×14, replacing color dot)

---

## Entity Row Design (updated)

```
[icon] Label text          [children]  [status]  [×]
  ^       ^                   ^           ^        ^
14px   flex-1             N↓ badge     status   delete
SVG    truncate           (if >0)      badge
(file,
type
color)
```

- Icon: 14×14 SVG file, `color` set to `ENTITY_TYPE_COLOR[node.type]`
- Label: `text-sm font-medium text-shell-text-primary truncate flex-1`
- **Children badge**: `text-[10px] px-1.5 py-0.5 rounded-full border border-shell-border bg-shell-surface-raised text-shell-text-muted`, clickable, shows `{count}` followed by 12×12 chevron-down SVG
- Status badge: `text-[10px] uppercase tracking-wider px-1.5 rounded-full border`
  - `confirmed` → green tint
  - `suspect` → amber tint
  - `unknown` → muted
- Delete: `×` button, `text-shell-destructive opacity-60 hover:opacity-100`
- Row container: `flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-pointer`

---

## Hierarchy Tree Logic (unchanged)

```ts
function buildTree(nodes: GraphNode[]): TreeNode[] {
  const map = new Map<string, TreeNode>(
    nodes.map((n) => [n.id, { ...n, children: [] }]),
  );
  const roots: TreeNode[] = [];
  for (const n of map.values()) {
    if (n.parent && map.has(n.parent)) {
      map.get(n.parent)!.children.push(n);
    } else {
      roots.push(n);
    }
  }
  return roots;
}
```

Render with recursive `TreeNodeRow` component, `depth` prop controls left padding: `style={{ paddingLeft: depth * 12 }}`.

---

## File Changes

| File | Action |
|------|--------|
| `src/components/layout/EvidenceSidebar.tsx` | Reduce to 2 tabs, rename 'entities' → 'Evidence' |
| `src/components/layout/EntitiesPanel.tsx` | Add children count badge to EntityRow |
| `public/icons/entity-types/person.svg` | **New** — entity type icon |
| `public/icons/entity-types/organization.svg` | **New** — entity type icon |
| `public/icons/entity-types/location.svg` | **New** — entity type icon |
| `public/icons/entity-types/event.svg` | **New** — entity type icon |
| `public/icons/entity-types/evidence.svg` | **New** — entity type icon |
| `public/icons/entity-types/vehicle.svg` | **New** — entity type icon |
| `public/icons/entity-types/digital.svg` | **New** — entity type icon |
| `src/components/layout/__tests__/EntitiesPanel.test.tsx` | **New** — unit tests for grouping, hierarchy, children badge |

---

## Test Plan

- `EntitiesPanel` renders By Type sections grouped correctly
- By Type hides empty-type sections
- Hierarchy builds tree: children nest under parents
- Hierarchy orphans render as roots
- Children count badge shows correct count per node
- Children badge hidden for nodes with 0 children
- Clicking children badge calls `onSelectNode`
- Clicking node row calls `onSelectNode`
- Delete button calls `onDeleteEntity`
- Selected node has accent highlight class
- Highlighted nodes have amber tint class
- Tab switch between By Type / Hierarchy works correctly

---
