# Task List: Tabbed Full-Viewport Case Workspace

## Phase 1: Foundation
- [x] Task 1: Extend caseStore with tab and per-tab workspace state
- [x] Task 2: Root layout — full-viewport fixed container

### Checkpoint: Foundation
- [x] All tests pass (64/64)
- [x] Build succeeds (tsc clean, pnpm build green)
- [x] Store has tab state + per-tab workspace state
- [x] Root layout is full-viewport fixed

## Phase 2: Tab System
- [x] Task 3: CaseTabBar component
- [x] Task 4: CaseShellLayout — persistent tab container

### Checkpoint: Tab System
- [x] Tab system functional: open, close, switch
- [x] No page navigation on tab switch
- [x] Tab state persists across switches

## Phase 3: Workspace Refit
- [x] Task 5: CaseWorkspaceShell — flex-based layout (scrollable)
- [x] Task 6: CaseShellLayout — flex wrapper for tab content area

### Checkpoint: Viewport
- [x] Layout scrolls naturally — no content clipping at any resolution
- [x] Graph has min-h-[500px] + flex-1 growth
- [x] Sidebar and panels scroll internally when needed
- [x] All 6 slices visible simultaneously

## Phase 4: Polish & Routing
- [x] Task 7: URL sync — active tab reflected in URL
- [x] Task 8: Keyboard shortcuts — tab navigation

### Checkpoint: Complete
- [x] All tests pass (64/64), tsc clean, build green
- [x] Full E2E flow: create case → opens as tab → switch tabs → close tab → URL in sync → keyboard shortcuts
