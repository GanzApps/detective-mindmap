---
phase: 09-workspace-frame-panels
plan: 01
subsystem: ui
tags: [workspace, left-rail, filters, tabs]

requires:
  - phase: 09-workspace-frame-panels
    provides: Planned workspace frame revamp with Raw Evidence default rail state

provides:
  - Tabbed left rail with `Raw Evidence` and `Filters & Layers`
  - Store-backed filters panel for entity types, connection-layer toggles, and time-range framing
  - Default evidence-first investigation flow aligned to the saved reference

key-files:
  created:
    - src/components/layout/WorkspaceFiltersPanel.tsx
  modified:
    - src/components/layout/EvidenceSidebar.tsx
    - src/components/layout/CaseWorkspaceShell.tsx
    - src/components/layout/__tests__/EvidenceSidebar.test.tsx
    - src/components/layout/__tests__/WorkspacePanels.test.tsx

completed: 2026-04-10
---

# Phase 09 Plan 01 Summary

The left rail now matches the revamp model: `Raw Evidence` opens by default, `Filters & Layers` is a deliberate second mode, and the filters surface is wired to the shared store instead of placeholder chrome.

Highlights:
- Introduced `WorkspaceFiltersPanel` with entity-type toggles, connection-layer preferences, and reserved time-range controls.
- Refactored `EvidenceSidebar` into the two-tab rail we discussed, preserving evidence selection while allowing the filters mode to slot in cleanly.
- Wired the shell to compute type counts and date framing from live case data.

Validation:
- `pnpm exec tsc --noEmit`
- `pnpm test -- --runInBand`
