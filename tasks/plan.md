# Implementation Plan: Tabbed Full-Viewport Case Workspace

## Overview

Replace the current page-navigation model (`/cases` → `/cases/[caseId]`) with a persistent tabbed shell where each case opens as a tab. The entire workspace fits within `100vh × 100vw` with zero page-level scrolling — only internal panels scroll.

The 6 layout slices from the reference (tab bar, toolbar, sidebar, graph container, timeline, AI command bar) are already built as components. We're reorganizing them into a fixed-viewport tab container.

## Architecture Decisions

- **Tab state lives in `caseStore`** — open tabs list, active tab ID. Each tab's workspace state (selected node, filters, view mode, AI result) is keyed by `caseId` so switching tabs preserves context.
- **`CasesPage` becomes `CaseShellLayout`** — the persistent container that never unmounts. It renders the tab bar + the active tab's workspace.
- **`CaseWorkspacePage` becomes `CaseTabPanel`** — a single case's workspace inside a tab. Receives `caseId` as prop, not from URL params.
- **Root layout changes to `h-screen w-screen overflow-hidden`** — no more `min-h-screen`/padding wrappers. Each slice gets explicit sizing.
- **URL still reflects active tab** for shareability (`/cases?tab=case-xxx`), but navigation is client-side only (no full page transitions).

## Dependency Graph

```
caseStore (extend with tab state + per-tab workspace state)
    │
    ├── CaseTabBar (new — reads tab list, active tab, add/remove)
    │       │
    │       └── CaseShellLayout (replaces CasesPage — root container)
    │               │
    │               └── CaseTabPanel (wraps CaseWorkspaceShell)
    │                       │
    │                       └── CaseWorkspaceShell (existing — 6 slices, refit to flex layout)
    │                               │
    │                               ├── CaseHeader (existing — toolbar)
    │                               ├── EvidenceSidebar (existing)
    │                               ├── GraphWorkspace (existing)
    │                               ├── TimelineBar (existing)
    │                               └── AICommandBar (existing)
    │
    └── RootLayout (change body to h-screen)
```

Implementation order: store first → tab bar → shell layout → viewport refit → wire up.

## Task List

### Phase 1: Store Foundation

#### Task 1: Extend caseStore with tab and per-tab workspace state

**Description:** Add tab management (open tabs, active tab) and per-tab workspace isolation. Currently `selectedNodeId`, `activeFilters`, `viewMode`, `aiResult`, etc. are global — they need to be keyed by `caseId` so each tab remembers its own state.

**Acceptance criteria:**
- [ ] `openTabs: { caseId: string; title: string }[]` in store — list of open case tabs
- [ ] `activeTabCaseId: string | null` — which tab is currently visible
- [ ] `perTabState: Record<string, TabWorkspaceState>` — workspace state keyed by caseId (selectedNodeId, activeFilters, viewMode, highlightedEntityIds, highlightedEvidenceId, aiResult, commandHistory, commandStatus)
- [ ] Actions: `openTab(caseId)`, `closeTab(caseId)`, `switchTab(caseId)`, `createTab(caseData)`
- [ ] Helper selectors: `activeTab()`, `activeTabWorkspaceState()`, `setActiveTabState(key, value)`
- [ ] Existing CRUD actions (`setSelectedNode`, `setActiveFilters`, etc.) become wrappers that delegate to `setActiveTabState` when a tab is active

**Verification:**
- [ ] `pnpm exec jest --runInBand` — store unit tests pass
- [ ] `pnpm exec tsc --noEmit` — no type errors

**Dependencies:** None

**Files likely touched:**
- `src/store/caseStore.ts`
- `src/store/__tests__/caseStore.test.ts` (new or extend existing)

**Estimated scope:** Medium (1 file, ~150 lines of new state + selectors)

---

#### Task 2: Root layout — full-viewport fixed container

**Description:** Change the root `body` wrapper from `min-h-screen` with padding to `h-screen w-screen overflow-hidden`. Remove page-level scrolling entirely.

**Acceptance criteria:**
- [ ] `body` uses `h-screen w-screen overflow-hidden flex flex-col`
- [ ] No page-level scroll on any route
- [ ] Content still renders (will be clipped until subsequent tasks, but no crash)

**Verification:**
- [ ] `pnpm build` — no hydration errors
- [ ] Manual: open any page, confirm no body scrollbar appears

**Dependencies:** None

**Files likely touched:**
- `src/app/layout.tsx`
- `src/app/globals.css` (may need `html, body { overflow: hidden }` guard)

**Estimated scope:** XS (1-2 files, ~5 lines change)

---

### Checkpoint: Phase 1

- [ ] All tests pass
- [ ] Build succeeds
- [ ] Store has tab state + per-tab workspace state
- [ ] Root layout is full-viewport fixed

> **Review with human before proceeding.**

---

### Phase 2: Tab System

#### Task 3: CaseTabBar component

**Description:** Horizontal tab strip matching the reference: Home icon tab + case tabs with close button + "+ New" button to create and open a new case. Active tab has underline/highlight.

**Acceptance criteria:**
- [ ] Renders Home tab (links to `/cases` — closes all tabs)
- [ ] Renders one tab per open case with case name as label
- [ ] Each tab has a close button (×) that removes the tab
- [ ] "+ New" button opens the Create Case modal, then opens the new case as a tab
- [ ] Active tab visually distinguished (purple underline or background)
- [ ] Tabs scroll horizontally if more than fit the viewport
- [ ] Clicking a tab calls `switchTab(caseId)` in store

**Verification:**
- [ ] Component renders in Storybook or test mount
- [ ] Click tab → store updates activeTabCaseId
- [ ] Close tab → tab removed from openTabs list
- [ ] "+ New" → creates case, adds tab, switches to it

**Dependencies:** Task 1

**Files likely touched:**
- `src/components/layout/CaseTabBar.tsx` (new)
- `src/components/layout/CaseTab.tsx` (new)

**Estimated scope:** Medium (2 files, ~150 lines)

---

#### Task 4: CaseShellLayout — persistent tab container

**Description:** New page component for `/cases` that replaces the current `CaseListPage`. It renders the `CaseTabBar` at top, then the active tab's `CaseTabPanel` below. When no tabs are open, shows the case list grid as an empty-state view.

**Acceptance criteria:**
- [ ] `/cases` route renders `CaseShellLayout` (no full page reload on tab switch)
- [ ] Tab bar is fixed at top of viewport
- [ ] When tabs exist: active tab's workspace renders below tab bar
- [ ] When no tabs open: case list grid renders (existing `CaseListPage` layout)
- [ ] Opening a case from the list opens it as a tab (not a page navigation)
- [ ] Switching tabs preserves each tab's workspace state

**Verification:**
- [ ] Open 2 cases as tabs, switch between them — both preserve their selected node/filters
- [ ] Close a tab — workspace unmounts cleanly
- [ ] No full page navigation when clicking cases

**Dependencies:** Task 3

**Files likely touched:**
- `src/components/layout/CaseShellLayout.tsx` (new)
- `src/app/cases/page.tsx` (modify to use CaseShellLayout)
- `src/components/pages/CaseListPage.tsx` (extract empty-state view)

**Estimated scope:** Medium (3 files, ~100 lines new)

---

### Checkpoint: Phase 2

- [ ] All tests pass
- [ ] Tab system functional: open, close, switch
- [ ] No page navigation on tab switch
- [ ] Tab state persists across switches

> **Review with human before proceeding.**

---

### Phase 3: Workspace Refit to Full Viewport

#### Task 5: CaseWorkspaceShell — flex-based fixed layout

**Description:** Replace the current `max-w-7xl space-y-shell-lg` grid layout with a flex-based layout that fills the remaining viewport height. The 6 slices stack vertically with explicit sizing.

**Acceptance criteria:**
- [ ] Outer container: `flex flex-col h-full overflow-hidden` (fills parent)
- [ ] CaseHeader: fixed height (~48px), no shrink
- [ ] Middle row (Sidebar + Graph + Analysis): `flex-1 flex-row overflow-hidden`
  - Sidebar: fixed width (320px), `overflow-y-auto` for internal scroll
  - Graph: `flex-1 overflow-hidden` (fills remaining space)
  - Analysis panel: fixed width (320px), `overflow-y-auto`
- [ ] Timeline: fixed height (~120px), `overflow-x-auto` horizontally
- [ ] AICommandBar: fixed height (~48px), no shrink
- [ ] No content overflow causes page scroll — only internal panels scroll

**Verification:**
- [ ] Open a case tab, expand browser to full screen — graph fills all remaining space
- [ ] Add 20 evidence files — sidebar scrolls internally, page does not
- [ ] Add 30 timeline events — timeline scrolls horizontally, page does not
- [ ] Resize window — layout adapts, no horizontal page scroll

**Dependencies:** Task 4

**Files likely touched:**
- `src/components/layout/CaseWorkspaceShell.tsx` (refactor layout structure)

**Estimated scope:** Medium (1 file, ~50 lines change)

---

#### Task 6: CaseShellLayout — flex wrapper for tab content area

**Description:** The area below the tab bar in `CaseShellLayout` needs to be `flex-1 overflow-hidden` so the active tab's workspace fills the remaining height.

**Acceptance criteria:**
- [ ] Tab bar: fixed height, no shrink
- [ ] Content area: `flex-1 overflow-hidden` — workspace fills remaining viewport
- [ ] Case list empty-state: scrolls internally if list is long

**Verification:**
- [ ] With no tabs open, case list fills remaining height below tab bar
- [ ] With tabs open, active tab's workspace fills remaining height
- [ ] No page-level scroll in any configuration

**Dependencies:** Task 4, Task 5

**Files likely touched:**
- `src/components/layout/CaseShellLayout.tsx`

**Estimated scope:** XS (1 file, ~10 lines change)

---

### Checkpoint: Phase 3

- [ ] Full-viewport layout: no page scroll at any screen size
- [ ] Graph fills all available space
- [ ] Sidebar and timeline scroll internally
- [ ] All 6 slices visible simultaneously

> **Review with human before proceeding.**

---

### Phase 4: Polish & Routing

#### Task 7: URL sync — active tab reflected in URL

**Description:** Keep the URL in sync with the active tab for shareability. Use query param `?tab=case-xxx` so the URL updates without full page navigation.

**Acceptance criteria:**
- [ ] Switching a tab updates URL to `/cases?tab=case-xxx`
- [ ] Loading `/cases?tab=case-xxx` directly opens that tab
- [ ] Closing the active tab updates URL to `/cases` or switches to another tab
- [ ] Home tab clears the query param

**Verification:**
- [ ] Copy URL with `?tab=xxx`, paste in new window — correct tab opens
- [ ] Browser back/forward navigates tab history

**Dependencies:** Task 4

**Files likely touched:**
- `src/components/layout/CaseShellLayout.tsx`
- `src/components/layout/CaseTabBar.tsx`

**Estimated scope:** Small (2 files, ~30 lines)

---

#### Task 8: Keyboard shortcuts — tab navigation

**Description:** Add keyboard shortcuts for tab management matching the reference pattern.

**Acceptance criteria:**
- [ ] `Ctrl+T` / `Cmd+T` — create new case (opens modal)
- [ ] `Ctrl+W` / `Cmd+W` — close current tab
- [ ] `Ctrl+1..9` / `Cmd+1..9` — switch to tab N
- [ ] Shortcuts only active when focus is not in a text input

**Verification:**
- [ ] Press `Ctrl+W` — active tab closes
- [ ] Press `Ctrl+2` — switches to second tab
- [ ] Typing in AI command bar does not trigger shortcuts

**Dependencies:** Task 3

**Files likely touched:**
- `src/components/layout/CaseTabBar.tsx` (add keyboard handler)

**Estimated scope:** Small (1 file, ~40 lines)

---

### Checkpoint: Complete

- [ ] All tests pass
- [ ] `pnpm exec tsc --noEmit` — no errors
- [ ] `pnpm build` — clean production build
- [ ] Full E2E flow: create case → opens as tab → workspace fills viewport → switch tabs → close tab → URL in sync

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Per-tab state in zustand store grows large | Medium — memory if many tabs open | Limit open tabs to 10; tabs are lightweight (just IDs + pointers to shared case data) |
| Graph canvas doesn't fill space due to flex quirks | Low — visual issue | Test with `ResizeObserver`; graph already uses `flex-1` internally |
| Next.js client-side routing conflicts with tab state | Medium — stale data on refresh | URL sync (Task 7) restores active tab on reload; store persists to localStorage |
| Existing `CaseWorkspacePage` page routes still work via direct URL | Low — edge case | Keep `/cases/[caseId]` route but redirect to `/?tab=caseId` for compatibility |

## Open Questions

- Should the case list grid be replaced entirely by the tab view, or kept as the empty-state when no tabs are open? (Planned: kept as empty-state)
- Should closing the last tab return to the case list, or open a new empty tab? (Planned: return to case list)
- Do we need tab drag-to-reorder, or is click-to-switch sufficient for v3.0? (Planned: click-to-switch first, reorder later)
