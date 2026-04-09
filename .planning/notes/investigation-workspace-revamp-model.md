---
title: "Investigation workspace revamp model"
date: "2026-04-10"
context: "Exploration note combining dashboard alignment, graph workspace structure, filters, minimap behavior, right-side analysis panel behavior, and the AI known-intent command model."
---

# Investigation Workspace Revamp Model

## Purpose

Capture the intended product model for the investigation workspace before implementation so the shell, graph interactions, filters, and AI command system evolve as one coherent experience.

## Product Positioning

The target product is not a raw graph tool and not a generic dashboard. It is a structured investigation workspace:

- calm dashboard shell
- dense but readable analytical graph canvas
- strong left-to-right information architecture
- persistent timeline and AI command surfaces

The graph remains the hero, but it sits inside a clean product frame.

## Layout Model

### Top shell

- Lightweight top tabs/breadcrumb navigation
- Case/workspace title with short supporting context
- Compact utility actions on the upper right:
  - command center status
  - export
  - actions menu

### Main body

- Left panel for evidence navigation and filters
- Center graph canvas as the main analytical surface
- Right-side on-canvas analysis panel for selected state or AI result state

### Bottom shell

- Timeline as a first-class synchronized surface
- Persistent AI command bar beneath the timeline or immediately below the graph/timeline stack

## Graph Experience

### 2D and 3D alignment

- 2D and 3D should feel like alternate views into the same investigation state
- Selection behavior must match in both modes
- Search-to-focus behavior must match in both modes
- Manual node placement should persist as shared workspace state to reduce disorientation when switching views

### Focus behavior

- Initial state should be rich and legible, not sparse
- Node labels should be visible by default
- Edge labels should be shown selectively to preserve readability
- When a node is selected:
  - selected node is emphasized
  - connected network is emphasized
  - unrelated nodes and edges remain visible but dimmed

### Visual system

- Node styling should be iconic and entity-type-specific
- Recognition should come from both shape and color
- Proposed shape language:
  - person: rounded avatar-like node
  - location: marker-style node
  - organization: square/structured block node
  - evidence/financial artifact: document/card or transaction-style node
  - event: diamond/signal-style node

## Filter and Navigation Model

### Left panel tabs

- `Raw Evidence`
- `Filters & Layers`
- Tabs should behave as distinct modes, not just visual sections in one long panel
- The active tab should clearly indicate which mental model is in play:
  - evidence browsing / navigation
  - graph control / filtering

### Filters & Layers structure

- Entity Types
- Connection Layers
- Time Range

### Filter behavior

- Entity-type filters should use icon + color pairing aligned with graph visuals
- Connection layers should be controlled separately from entity types
- Counts should be visible where useful for instant scope awareness
- Time filtering should be available as explicit structured controls, not only through the timeline
- Selected filter states should immediately affect graph visibility/emphasis while preserving overall orientation

## Right-Side Analysis Panel

### Display rule

- The right-side panel should appear on the right side of the canvas area to avoid obscuring the main graph
- It should be used when:
  - a node is selected
  - an AI/chat command returns a relevant result
- It should not behave as a permanently noisy always-on inspector

### Non-goal

- Do not rely on floating center-canvas popup cards for primary detail display
- The graph should remain visually unobstructed as much as possible

### Selected-state behavior

- Selected/focused network remains readable while the rest of the graph is dimmed
- This dimming pattern should preserve context instead of fully hiding unrelated entities
- The selected state shown in the reference is an important target for the revamp

### Panel role

- Summarize the active interpretation of the selected node, focused network, or command result
- Present findings, summary, and metrics in a structured readable format

## Minimap / Magnifier

- The graph should include a minimap or magnifier view to show viewport/camera position
- This orientation aid helps users maintain spatial awareness while panning and zooming
- The minimap should remain visually secondary but always available when useful

## AI Command Model

### UX role

- The AI command surface should be polished and visibly integrated into the workspace shell
- It should support:
  - quick command chips
  - typed input
  - result routing into graph and panel behavior

### First implementation constraint

- Use known intents only for the first release
- Do not rely on open-ended freeform AI interpretation as the execution layer

### Trigger model

- User selects a suggested command or enters a supported command
- The system maps the intent to predefined workspace functions
- The action updates the graph state and, when appropriate, the right-side analysis panel

### Example triggerable actions

- highlight a selected node or connected network
- isolate a relationship layer
- filter entity categories
- focus a time range
- open or update the right-side analysis panel
- surface findings/metrics tied to the active command

## Theme Direction

- The workspace must support both light and dark themes
- The shell, graph, filters, timeline, and AI surfaces should all participate in the same theme system
- Legibility of selection, dimming, labels, and iconic node types must be preserved in both modes

## Related Notes

- `.planning/notes/ui-reference-mac-video-alignment.md`
- `.planning/notes/graph-ui-interaction-alignment.md`

## Related Reference Assets

- `.planning/references/mac-ui-reference/graph-view-selected-filters.png`
