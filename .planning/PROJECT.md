# Detective Mindmap

## What This Is

A desktop-first investigation workspace for detective-style case analysis. The product combines a case dashboard, a graph-centered investigation workspace, synchronized 2D and 3D graph views, evidence/filter rails, a timeline, and an AI-assisted command surface.

The current milestone is not about adding arbitrary v2 features. It is specifically about realigning the product to the saved visual references so the shell, workspace framing, interaction model, and graph behavior feel like one coherent investigation product.

## Core Value

A detective must be able to open a case, immediately understand the investigation space, search and focus the relevant network, switch between 2D and 3D without losing context, and act from a clean, high-signal workspace.

## Current Milestone: v2.0 Investigation Workspace Revamp

### Goal

Rebuild the shell and graph workspace so the app aligns with the saved MAC reference direction while preserving the existing graph engine and export foundation.

### Target Features

- Reference-aligned dashboard and workspace shell with shared light/dark theme support
- Unified 2D / 3D interaction model: shared selection, shared focus logic, shared manual placement intent
- Left rail with tabbed `Raw Evidence` and `Filters & Layers` modes
- Right-side on-canvas analysis panel for selected nodes and AI result states
- Typeahead-first search that highlights only after selection
- Focus mode that emphasizes the selected node and connected network while dimming unrelated nodes
- Entity-type-specific iconic node shapes and reference-aligned color semantics
- Persistent minimap, timeline, and polished AI command surface
- Known-intent AI command routing into predefined graph/workspace actions

## Requirements

See: `.planning/REQUIREMENTS.md`

## Context

- The shell/layout reference is preserved in `.planning/references/mac-ui-reference/2026-04-09.mp4`
- The graph workspace reference is preserved in `.planning/references/mac-ui-reference/graph-view-selected-filters.png`
- Detailed interpretation notes live in:
  - `.planning/notes/ui-reference-mac-video-alignment.md`
  - `.planning/notes/graph-ui-interaction-alignment.md`
  - `.planning/notes/investigation-workspace-revamp-model.md`
- The Phase 8 work already completed should be treated as shell/token groundwork for this milestone, not as the complete revamp

## Constraints

- Tech stack stays: Next.js App Router, TypeScript, React, Tailwind CSS, Jest
- Preserve desktop-first interaction model
- Keep graph logic separated from shell/UI concerns so renderer behavior remains testable
- Do not conflate shell design tokens with graph/entity semantic colors
- The first AI implementation should use known intents only, not freeform interpretation

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Shared shell revamp before deep graph restyling | The current app works, but the product framing is inconsistent with the reference | Phase 8 establishes tokens and shell alignment first |
| Calm bright baseline with restrained dark mode | Matches the reference and reduces visual noise compared with the old dense dark shell | Light/dark support is required across the revamp |
| Purple is the shell accent color | The reference uses purple for primary actions and active states | Shell actions, tabs, and command emphasis use purple |
| Shell tokens and graph semantics are separate systems | The shell should stay calm while graph colors carry entity meaning | Graph color/shape language is handled in later phases |
| 2D and 3D must align behaviorally | Users should not re-learn interaction when switching renderers | Shared selection, search, focus, and placement intent are milestone-level requirements |
| Search is typeahead-first, focus-after-selection | Highlighting while typing is noisy and less legible | Search shows dropdown results first, then applies graph focus when a result is chosen |
| Right-side analysis panel instead of center popups | The graph must remain visible during analysis | Selection and AI results route into a right-side on-canvas panel |
| Non-selected graph remains visible but dimmed | Dimming preserves orientation better than hiding | Focus mode dims unrelated nodes instead of removing them |
| AI command surface is orchestration, not generic chat | The workspace should trigger actions, not just produce text | Known intents map to predefined graph/workspace functions |

## Evolution

This document should change when milestone direction changes, not only when code changes.

### Update this file when:

1. The product definition drifts from the current milestone goal
2. New reference material changes shell or interaction direction
3. Major interaction decisions are made that affect multiple upcoming phases
4. A completed phase changes the meaning of the current milestone

---
*Last updated: 2026-04-10 during planning repair after Phase 8 verification*
