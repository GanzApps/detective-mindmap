---
phase: 09-workspace-frame-panels
plan: 03
subsystem: ui
tags: [timeline, command-bar, validation, jest]

requires:
  - phase: 09-workspace-frame-panels
    plan: 02
    provides: Stable shell composition with left rail, center canvas, right analysis panel, and minimap

provides:
  - Collapsed-by-default timeline dock with visible handle and expandable chronology cards
  - Known-intent AI command band with quick commands and quiet execution affordance
  - Updated Jest config that ignores `.claude/worktrees` shadow copies
  - Full validation: TypeScript clean, full test suite green, production build green

key-files:
  modified:
    - src/components/layout/TimelineBar.tsx
    - src/components/layout/AICommandBar.tsx
    - jest.config.ts
    - src/__tests__/app-shell.test.tsx
    - src/components/layout/__tests__/AICommandBar.test.tsx
    - src/components/layout/__tests__/CaseHeader.test.tsx
    - src/components/layout/__tests__/TimelineBar.test.tsx

completed: 2026-04-10
---

# Phase 09 Plan 03 Summary

The bottom band now behaves like the reference direction: the timeline stays docked but collapsed until needed, and the AI surface reads as a polished known-intent orchestration area instead of a generic placeholder.

Highlights:
- Rebuilt `TimelineBar` into a collapsible dock that expands into event cards and workspace context only on demand.
- Refined `AICommandBar` into a quick-command surface with known-intent framing and an explicit future `Execute` affordance.
- Updated Jest expectations across the workspace shell and added ignore patterns so `.claude/worktrees` no longer pollute test runs.

Validation:
- `pnpm exec tsc --noEmit`
- `pnpm test -- --runInBand`
- `pnpm build`
