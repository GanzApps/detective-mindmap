---
title: "Graph UI interaction alignment for 2D and 3D"
date: "2026-04-10"
context: "Exploration note capturing the desired shared interaction model and node visual language for the 2D and 3D investigation graph."
---

# Graph UI Interaction Alignment

## Purpose

Capture the intended behavior and visual direction for the graph experience before implementation so the 2D and 3D views evolve as one coherent workspace.

## Core Direction

The 2D and 3D graph modes should feel like two views into the same investigation state, not two separate tools with different interaction rules.

## Interaction Alignment

### Shared selection model

- Selection behavior must match in both 2D and 3D
- Selecting a node should highlight:
  - the selected node
  - its directly connected network
- Nodes and edges outside the selected network should remain visible but dimmed
- Dimming is preferred over hiding so users do not lose spatial context

### Shared drag and placement model

- A selected node should be draggable to a desired position
- Manual repositioning should persist as shared workspace state
- Switching between 2D and 3D should preserve the user-chosen placement model enough to avoid disorientation
- The experience should reduce the feeling that each renderer has its own unrelated layout

### Search behavior

- Search should behave as typeahead first
- While typing, the UI should primarily show a dropdown of matching node labels
- Graph highlighting should not trigger on every keystroke
- Once the user selects a result from the dropdown:
  - the matching node becomes selected
  - its connected network is highlighted
  - the rest of the graph becomes dimmed

## Visual Direction

### Node styling

- Nodes should not remain generic graph dots
- Each entity type should have an iconic, recognizable visual identity
- Entity categories should be distinguishable at a glance by shape, not color alone
- The graph should feel designed, not merely rendered

### Color system

- Graph colors should align with the reference visual language captured in the MAC UI reference note
- The color system should feel calmer and more productized than the current graph palette
- Color should support recognition, emphasis, and state changes without making the graph noisy

## Theme Direction

- The shared graph visual system must support both light and dark themes
- Theme behavior should remain consistent across shell, dashboard, and graph surfaces
- Selection, dimming, and entity-type recognition must remain legible in both themes

## UX Goal

The graph should preserve analytical power while becoming easier to read, easier to orient within, and more visually aligned with the product shell. Users should feel that:

- search is controlled and predictable
- focus mode is clear without being disorienting
- drag placement is respected across views
- entity types are identifiable instantly
- 2D and 3D are alternate perspectives of the same investigation state

## Related Reference

- See `.planning/notes/ui-reference-mac-video-alignment.md`
- See `.planning/references/mac-ui-reference/2026-04-09.mp4`
